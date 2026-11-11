import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, gotoWithRetry, onlyRestartNoise, setTheme, stubExternalRequests, waitForServer } from "./helpers";

/**
 * Motion on the example sites (SiteShell / LocaleSwitch `motion` levels, kit motion primitives).
 * For 12 representative sites:
 *  - reveal: content below the fold starts pending and is revealed as it scrolls into view;
 *  - count-up: every CountUp ends on its final value;
 *  - page switch: a nav link (or the EN/TR switch on LocaleSwitch sites) runs its transition to the end;
 *  - reduced motion: every heading and section is visible at once, nothing pending or animating;
 *  - CLS: loading the home page and scrolling it to the end stays under the layout-shift budget.
 */

type Site = {
  name: string;
  /** All pages, for the reduced-motion pass (`home` is the default page). */
  pages: string[];
  /** The page switch: `page` follows a `?page=` link, `lang` the visible TR link. */
  to: { page: string } | { lang: "tr" };
};

const SITES: Site[] = [
  { name: "site-clinic-01", pages: ["home", "doctors", "appointment"], to: { page: "doctors" } },
  { name: "site-ai-01", pages: ["home", "pricing", "security"], to: { page: "security" } },
  { name: "site-community-01", pages: ["home", "topics", "thread"], to: { page: "topics" } },
  { name: "site-dietitian-01", pages: ["home", "programmes", "booking"], to: { page: "programmes" } },
  { name: "site-factory-01", pages: ["home", "products", "quality"], to: { page: "quality" } },
  { name: "site-physio-01", pages: ["home", "treatments", "booking"], to: { page: "treatments" } },
  { name: "site-portfolio-02", pages: ["home", "project-kara", "studio"], to: { page: "studio" } },
  { name: "site-store-02", pages: ["home", "archive", "product"], to: { page: "archive" } },
  { name: "site-therapy-01", pages: ["home", "approach", "contact"], to: { page: "approach" } },
  { name: "site-waitlist-01", pages: ["home", "joined"], to: { lang: "tr" } },
  { name: "site-blog-02", pages: ["home", "post", "archive"], to: { page: "archive" } },
  { name: "site-spa-01", pages: ["home"], to: { lang: "tr" } },
];

const HYDRATION = /Hydration failed|didn't match the client|hydration mismatch/i;
/** CLS budget ("good" in Core Web Vitals). */
const CLS_BUDGET = 0.1;

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
  await setTheme(page, { dark: false, material: "glass" });
  // Collect layout shifts from the very first paint.
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) w.__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* no layout-shift support */
    }
  });
});

const urlOf = (name: string, pageId = "home") => `/view/${name}${pageId === "home" ? "" : `?page=${pageId}`}`;

async function waitForHydration(page: Page, timeout = 30_000) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("main button, main a[href], header a[href], button");
      return !el || Object.keys(el).some((k) => k.startsWith("__reactProps"));
    },
    undefined,
    { timeout },
  );
}

/** Opens a site page (200, hydrated); retries once on dev-server restarts and stale-SSR hydration noise. */
async function openSite(page: Page, name: string, pageId = "home") {
  const errors = collectConsoleErrors(page);
  const href = urlOf(name, pageId);
  const load = async () => {
    const res = await gotoWithRetry(page, href);
    expect(res?.status(), href).toBe(200);
    return waitForHydration(page).then(() => true, () => false);
  };
  let ok = await load();
  if (!ok || onlyRestartNoise(errors)) {
    test.info().annotations.push({ type: "dev-server-restart", description: href });
    await waitForServer(page);
    errors.length = 0;
    ok = await load();
  }
  if (!ok) throw new Error(`${href}: never hydrated. Console: ${errors.join(" | ")}`);
  if (errors.length && errors.every((e) => HYDRATION.test(e))) {
    test.info().annotations.push({ type: "flaky-hydration", description: href });
    errors.length = 0;
    await load();
  }
  // Let deep links (?page=) settle: SiteShell switches them right after hydration.
  await page.waitForTimeout(400);
  return errors;
}

/** Reveal elements that are laid out (not inside a hidden page / closed panel) and still pending. */
const pendingReveals = (page: Page) =>
  page.evaluate(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-state="pending"]')).filter((el) => el.getClientRects().length > 0)
        .length,
  );

/** Scrolls to the end in viewport-sized steps, so every IntersectionObserver gets its turn. */
async function scrollThrough(page: Page, pause = 160) {
  const steps = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (window.innerHeight * 0.6)));
  for (let i = 1; i <= steps + 1; i++) {
    await page.evaluate((k) => window.scrollTo(0, k * window.innerHeight * 0.6), i);
    await page.waitForTimeout(pause);
  }
}

/** Headings and sections that are laid out but not fully visible (opacity along the ancestor chain, or clipped away). */
const hiddenHeadings = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main section"))) {
      if (el.getClientRects().length === 0 || el.closest("[hidden], [inert], [aria-hidden='true'], dialog:not([open]), [popover]:not(:popover-open)")) continue;
      let o = 1;
      let clipped = false;
      for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        o *= Number(cs.opacity);
        if (/inset\(\s*100%|inset\(0(px)? 0(px)? 100%|inset\(100%/.test(cs.clipPath)) clipped = true;
        if (cs.visibility === "hidden") clipped = true;
      }
      if (o < 0.99 || clipped) out.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 40)}" opacity=${o.toFixed(2)}${clipped ? " clipped" : ""}`);
    }
    return out;
  });

/** Finite CSS animations / transitions still running (loops such as marquees are allowed). */
const runningFinite = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      // Scroll-driven ones (navbar fill, reading progress, table edge fades) follow the scroll
      // position, not the clock, so they are state indicators rather than motion.
      .filter((a) => a.playState === "running" && a.timeline === document.timeline && Number.isFinite(Number(a.effect?.getComputedTiming().iterations)))
      .map((a) => {
        const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
        const name = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? "anim";
        return `${name} on ${t?.tagName.toLowerCase() ?? "?"}.${(t?.getAttribute("class") ?? "").split(" ").slice(0, 3).join(".")}`;
      }),
  );

test.describe("motion — reveal, count-up, page switch, CLS", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const site of SITES) {
    test(`${site.name}: reveals on scroll, count-ups land, page switch completes, CLS under budget`, async ({ page }) => {
      test.setTimeout(150_000);
      const errors = await openSite(page, site.name);

      // Reveal: something below the fold waits, and nothing waits after a scroll through.
      const start = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-state]")).filter((el) => el.getClientRects().length > 0);
        const below = all.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
        return { all: all.length, below: below.length, belowNotPending: below.filter((el) => el.dataset.revealState !== "pending").length };
      });
      expect(start.all, `${site.name}: no Reveal/Stagger on the home page`).toBeGreaterThan(0);
      expect(start.belowNotPending, `${site.name}: below-the-fold reveals already shown before scrolling`).toBe(0);
      await scrollThrough(page);
      await expect.poll(() => pendingReveals(page), { message: `${site.name}: pending after scroll`, timeout: 6_000 }).toBe(0);
      const revealed = await page.locator('[data-reveal-state="in"], [data-reveal-state="done"]').count();
      expect(revealed).toBeGreaterThan(0);

      // Count-up: every visible CountUp ends on its final value (the reserved ghost text).
      const counts = page.locator("[data-count-up]");
      const n = await counts.count();
      for (let i = 0; i < n; i++) {
        const c = counts.nth(i);
        if (!(await c.isVisible())) continue;
        await c.scrollIntoViewIfNeeded();
        await expect(c, `${site.name}: count-up #${i} still running`).not.toHaveAttribute("data-running", "", { timeout: 6_000 });
        const ghost = await c.getAttribute("data-ghost");
        await expect(c).toHaveText(ghost!);
      }

      // CLS: load + scroll through the home page.
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls, `${site.name}: CLS ${cls.toFixed(3)}`).toBeLessThan(CLS_BUDGET);

      // Page switch: the transition runs to the end and the new page is fully visible.
      await page.evaluate(() => window.scrollTo(0, 0));
      if ("page" in site.to) {
        const id = site.to.page;
        await page.locator(`a[href*="page=${id}"]:visible`).first().click();
        await expect(page).toHaveURL(new RegExp(`page=${id}`));
      } else {
        const main = () => page.locator("main:visible").first().innerText();
        const was = await main();
        await page.locator('a[hreflang="tr"]:visible').first().click();
        await expect(page).toHaveURL(/lang=tr/);
        await expect.poll(main).not.toBe(was);
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-vm-transition")), { timeout: 5_000 }).toBe(false);
      const h1 = page.locator("h1:visible");
      await expect(h1).toHaveCount(1);
      await expect
        .poll(
          () =>
            h1.evaluate((el) => {
              let o = 1;
              for (let n: Element | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
              return o;
            }),
          { timeout: 5_000 },
        )
        .toBeGreaterThan(0.99);

      errors.stop();
      expect(errors.filter((e) => !HYDRATION.test(e))).toEqual([]);
    });
  }
});

test.describe("motion — reduced motion shows everything at once", () => {
  test.use({ reducedMotion: "reduce" });

  for (const site of SITES) {
    test(`${site.name}: every heading and section is visible immediately at 1440 and 390`, async ({ page }) => {
      test.setTimeout(60_000 + site.pages.length * 30_000);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width > 500 ? 900 : 844 });
        for (const pageId of site.pages) {
          const errors = await openSite(page, site.name, pageId);
          const tag = `${site.name} ?page=${pageId} @${width}`;
          // Immediately: no scrolling, no waiting for transitions.
          expect(await pendingReveals(page), `${tag}: pending reveals`).toBe(0);
          expect(await page.locator("[data-count-up][data-running]").count(), `${tag}: running count-ups`).toBe(0);
          expect(await hiddenHeadings(page), tag).toEqual([]);
          expect(await runningFinite(page), `${tag}: animations under reduced motion`).toEqual([]);
          errors.stop();
          expect(errors.filter((e) => !HYDRATION.test(e)), tag).toEqual([]);
        }
      }
    });
  }
});
