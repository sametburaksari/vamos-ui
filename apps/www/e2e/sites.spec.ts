import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, gotoWithRetry, onlyRestartNoise, seriousA11y, setTheme, stubExternalRequests, waitForServer } from "./helpers";

/**
 * Example websites (docs/plan/SITES.md). For every site: a smoke pass over all of its pages
 * (HTTP 200, one visible h1, a main landmark, no console or page errors, no serious/critical axe
 * finding with colour contrast on, no sideways scroll at 1440 and 390 px) and one test of its
 * signature interaction plus the EN → TR switch.
 *
 * Smoke runs in light + solid, where the testing plan checks contrast (glass is judged on token pairs).
 */

const SITES: Record<string, string[]> = {
  // Batch A
  "site-store-01": ["home", "shop", "product", "checkout"],
  "site-portfolio-01": ["home", "work-fog-studies", "about"],
  "site-blog-01": ["home", "article", "archive"],
  "site-app-01": ["home", "pricing", "download"],
  "site-clinic-01": ["home", "doctors", "appointment"],
  "site-estate-01": ["home", "listings", "listing"],
  "site-event-01": ["home", "schedule", "tickets"],
  "site-course-01": ["home", "curriculum", "enrol"],
  "site-cv-01": ["home", "cv"],
  "site-law-01": ["home", "practice-disputes", "team"],
  // Batch B
  "site-ai-01": ["home", "pricing", "security"],
  "site-devtool-01": ["home", "docs", "changelog"],
  "site-changelog-01": ["home", "entry"],
  "site-status-01": ["home", "incident", "history"],
  "site-waitlist-01": ["home", "joined"],
  "site-help-01": ["home", "category", "article"],
  // Batch G (second variants)
  "site-store-02": ["home", "archive", "product"],
  "site-portfolio-02": ["home", "project-kara", "studio"],
  "site-blog-02": ["home", "post", "archive"],
  "site-app-02": ["home", "pricing", "security"],
  // Batch C
  "site-nonprofit-01": ["home", "donate", "report"],
  "site-podcast-01": ["home", "episode"],
  "site-artist-01": ["home", "tour", "releases"],
  "site-wedding-01": ["home", "details", "rsvp"],
  // Batch D (1–8)
  "site-autoservice-01": ["home", "services", "booking"],
  "site-vet-01": ["home", "services", "team"],
  "site-preschool-01": ["home", "programme", "enrol"],
  "site-driving-01": ["home", "courses", "signup"],
  "site-movers-01": ["home", "quote", "faq"],
  "site-florist-01": ["home", "bouquets", "order"],
  "site-studio-01": ["home", "packages", "booking"],
  "site-venue-01": ["home", "spaces", "enquiry"],
  // Batch D (9–12) + E
  "site-therapy-01": ["home", "approach", "contact"],
  "site-dietitian-01": ["home", "programmes", "booking"],
  "site-physio-01": ["home", "treatments", "booking"],
  "site-accounting-01": ["home", "services", "contact"],
  "site-factory-01": ["home", "products", "quality"],
  "site-construction-01": ["home", "projects", "project-kuzey-yaka", "project-liman-library", "project-degirmen-workshops", "project-ardic-terraces"],
  "site-wholesale-01": ["home", "catalogue", "quote"],
  "site-careers-01": ["home", "jobs", "job"],
  "site-digital-01": ["home", "product", "checkout"],
  "site-subbox-01": ["home", "plans", "gift"],
  "site-market-01": ["home", "search", "seller"],
  "site-newsletter-01": ["home", "archive", "issue"],
  // Batch F
  "site-public-01": ["home", "services", "announcement"],
  "site-department-01": ["home", "programmes", "people"],
  "site-club-01": ["home", "fixtures", "membership"],
  "site-community-01": ["home", "topics", "thread"],
  "site-game-01": ["home", "media", "press"],
  // Batch G (5–8)
  "site-clinic-02": ["home", "visit", "book"],
  "site-estate-02": ["home", "collection", "residence"],
  "site-saas-02": ["home", "pricing", "connectors"],
  "site-agency-02": ["home", "case", "contact"],
};

const HYDRATION = /Hydration failed|didn't match the client|hydration mismatch/i;

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
  await setTheme(page, { dark: false, material: "solid" });
});

/** Waits until the site's client tree has hydrated (React props on the first interactive element). */
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

const urlOf = (name: string, pageId = "home", lang?: string) => {
  const q = [pageId === "home" ? "" : `page=${pageId}`, lang ? `lang=${lang}` : ""].filter(Boolean).join("&");
  return `/view/${name}${q ? `?${q}` : ""}`;
};

/** Opens a site page: 200, hydrated. Returns the live console-error array. */
async function openSite(page: Page, name: string, pageId = "home", lang?: string) {
  const errors = collectConsoleErrors(page);
  const href = urlOf(name, pageId, lang);
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
  // A one-off stale-SSR hydration mismatch right after an on-demand compile (PLAN §11): reload once.
  if (errors.length && errors.every((e) => HYDRATION.test(e))) {
    test.info().annotations.push({ type: "flaky-hydration", description: href });
    errors.length = 0;
    await load();
  }
  return errors;
}

const overflowX = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const visibleH1s = (page: Page) => page.locator("h1:visible").count();

/** Clicks the visible TR link and checks that the page language really changed. */
async function switchToTurkish(page: Page) {
  const mainText = () => page.locator("main:visible").first().innerText();
  const before = await mainText();
  await page.locator('a[hreflang="tr"]:visible').first().click();
  await expect(page).toHaveURL(/lang=tr/);
  await expect.poll(mainText).not.toBe(before);
  await expect(page.locator("main:visible").first()).toContainText(/[çğışöüÇĞİŞÖÜ]/);
  await expect(page.locator("h1:visible")).toHaveCount(1);
}

test.describe("sites — smoke", () => {
  // Scroll-driven reveals (.vb-reveal) start at opacity 0 below the fold, which axe reads as low
  // contrast; with reduced motion they render at full strength, as the content really is.
  test.use({ reducedMotion: "reduce" });
  for (const [name, pages] of Object.entries(SITES)) {
    test(`${name}: every page renders at 1440 and 390 with one h1, main, no errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(60_000 + pages.length * 45_000);
      for (const pageId of pages) {
        const check = async () => {
          await page.setViewportSize({ width: 1440, height: 900 });
          const errors = await openSite(page, name, pageId);
          const h1 = await visibleH1s(page);
          const main = await page.locator("main").count();
          const axe = await seriousA11y(page, []);
          const wide = await overflowX(page);
          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(300);
          const narrow = await overflowX(page);
          const h1Narrow = await visibleH1s(page);
          errors.stop();
          return { h1, h1Narrow, main, axe, wide, narrow, errors: [...errors] };
        };
        let r = await check();
        if (onlyRestartNoise(r.errors)) {
          test.info().annotations.push({ type: "dev-server-restart", description: `${name} ${pageId}` });
          await waitForServer(page);
          r = await check();
        }
        const tag = `${name} ?page=${pageId}`;
        expect(r.h1, `${tag}: visible h1 at 1440`).toBe(1);
        expect(r.h1Narrow, `${tag}: visible h1 at 390`).toBe(1);
        expect(r.main, `${tag}: main landmark`).toBeGreaterThanOrEqual(1);
        expect(r.axe, tag).toEqual([]);
        expect(r.errors, tag).toEqual([]);
        expect(r.wide, `${tag} overflows at 1440`).toBeLessThanOrEqual(1);
        expect(r.narrow, `${tag} overflows at 390`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("sites — signature interaction + EN/TR", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("site-store-01: a glaze swatch swaps the photo, quick add fills the cart drawer, remove updates it; TR", async ({ page }) => {
    const errors = await openSite(page, "site-store-01");
    const group = page.getByRole("radiogroup", { name: /Glaze of Morning cup/ }).first();
    const card = page.locator("article").filter({ has: group }).first();
    const alt = () => card.locator("img[alt]:not([alt=''])").first().getAttribute("alt");
    expect(await alt()).toMatch(/chalk/i);
    await group.getByRole("radio", { name: "Clay foot" }).click();
    await expect.poll(alt).toMatch(/terracotta/i);
    const cart = page.locator('a[href="#cart"]').first();
    await expect(cart).toContainText("3");
    await card.getByRole("button", { name: /Add Morning cup in Clay foot/ }).click();
    await expect(cart).toContainText("4");
    await cart.click();
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByText(/Your cart \(4\)/)).toBeVisible();
    await drawer.getByRole("button", { name: /Remove Bud vase pair/ }).click();
    await expect(drawer.getByText(/Your cart \(3\)/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-portfolio-01: discipline filter, lightbox, index hover preview, row opens the case story; TR", async ({ page }) => {
    const errors = await openSite(page, "site-portfolio-01");
    await page.getByRole("tab", { name: /Portrait/ }).click();
    const panel = page.getByRole("tabpanel");
    await expect(panel.locator("img")).toHaveCount(2);
    await panel.locator("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    const row = page.locator("[data-index-row]").nth(2);
    await row.scrollIntoViewIfNeeded();
    const box = (await row.boundingBox())!;
    await page.mouse.move(box.x + 200, box.y + box.height / 2);
    await page.mouse.move(box.x + 260, box.y + box.height / 2, { steps: 5 });
    await expect(page.locator("[data-visible]")).toHaveCount(1);
    await row.click();
    await expect(page).toHaveURL(/page=work-/);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-blog-01: reading progress follows the scroll and side notes sit in the margin; TR", async ({ page }) => {
    const errors = await openSite(page, "site-blog-01", "article");
    const bar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(bar).toHaveAttribute("aria-valuenow", "0");
    await expect(page.locator("[data-sidenote]").first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await expect.poll(async () => Number(await bar.getAttribute("aria-valuenow"))).toBeGreaterThan(10);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-app-01: the chapter rail swaps the phone screen; TR", async ({ page }) => {
    const errors = await openSite(page, "site-app-01");
    const phone = page.locator("[data-scroll-phone]");
    const first = await phone.getAttribute("data-active-screen");
    const rail = page.getByRole("navigation", { name: "Feature chapters" });
    await rail.scrollIntoViewIfNeeded();
    await rail.getByRole("button").nth(2).click();
    await expect.poll(() => phone.getAttribute("data-active-screen")).not.toBe(first);
    await expect(rail.getByRole("button").nth(2)).toHaveAttribute("aria-current", "step");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-clinic-01: service → clinician → day → slot → details with validation → confirmed; TR", async ({ page }) => {
    const errors = await openSite(page, "site-clinic-01", "appointment");
    const next = page.getByRole("button", { name: "Continue" });
    await expect(next).toBeDisabled();
    await page.getByRole("radio", { name: /General consultation/ }).click();
    await next.click();
    await page.getByRole("radio", { name: /First available/ }).click();
    await next.click();
    await page.locator("[role=gridcell] button:not([disabled]), button[name=day]:not([disabled])").first().click();
    await next.click();
    await page.locator('[role=radio]:not([disabled]):not([aria-disabled="true"])').first().click();
    await next.click();
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await expect(page.getByText("A few fields need a look.")).toBeVisible();
    await page.getByLabel(/Full name/).fill("Ayla Demir");
    await page.getByLabel(/Date of birth/).fill("1990-04-12");
    await page.getByLabel(/Mobile/).fill("5321234567");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await expect(page.getByText("You’re booked")).toBeVisible();
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-estate-01: hovering a listing lights its map pin and hovering a pin lights its card; TR", async ({ page }) => {
    const errors = await openSite(page, "site-estate-01", "listings");
    const card = page.locator("article").first();
    await card.hover();
    await expect(page.locator("button[data-active]")).toHaveCount(1);
    const pins = page.getByRole("list", { name: "Listings on the map" }).getByRole("button");
    await pins.nth(1).hover();
    await expect(page.locator("article[data-active]")).toHaveCount(1);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-event-01: the track filter narrows the schedule and Add puts a session in my agenda; TR", async ({ page }) => {
    const errors = await openSite(page, "site-event-01", "schedule");
    const panel = page.getByRole("tabpanel");
    const adds = panel.locator("[data-add]");
    const all = await adds.count();
    expect(all).toBeGreaterThan(3);
    await page.locator('[data-track="workshop"]').click();
    await expect.poll(() => adds.count()).toBeLessThan(all);
    const firstTitle = (await panel.locator("li h4").first().innerText()).trim();
    await adds.first().click();
    await expect(adds.first()).toHaveAttribute("data-variant", "solid");
    await expect(page.locator("[data-agenda]")).toContainText(firstTitle);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-course-01: the weekly pace re-plans the lesson map; TR", async ({ page }) => {
    const errors = await openSite(page, "site-course-01");
    const pace = page.locator('[aria-labelledby$="-pace"]').first();
    await pace.scrollIntoViewIfNeeded();
    const weekText = page.locator("span", { hasText: /^Week \d+ \/ \d+$/ }).first();
    const before = (await weekText.innerText()).trim();
    await pace.getByText("8 h", { exact: true }).click();
    await expect.poll(async () => (await weekText.innerText()).trim()).not.toBe(before);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-cv-01: print shows only the CV sheet and Download PDF names the file; TR", async ({ page }) => {
    const errors = await openSite(page, "site-cv-01");
    await page.emulateMedia({ media: "print" });
    const printed = await page.evaluate(() => ({
      sheet: [...document.querySelectorAll("[data-cv-sheet]")].some((e) => getComputedStyle(e).display !== "none"),
      main: getComputedStyle(document.querySelector("main")!.closest(".print\\:hidden") ?? document.querySelector("main")!).display,
    }));
    expect(printed.sheet).toBe(true);
    expect(printed.main).toBe("none");
    await page.emulateMedia({ media: "screen" });
    await page.evaluate(() => {
      window.print = () => {
        (window as unknown as { __title: string }).__title = document.title;
      };
    });
    await page.getByRole("button", { name: "Download PDF" }).first().click();
    expect(await page.evaluate(() => (window as unknown as { __title: string }).__title)).toBe("Deniz-Arcan-CV-2026");
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-law-01: hovering a practice row fills its numeral and the row opens the practice page; TR", async ({ page }) => {
    const errors = await openSite(page, "site-law-01");
    const rows = page.locator("[data-practice-row]");
    await expect(rows).toHaveCount(6);
    await rows.nth(3).scrollIntoViewIfNeeded();
    await rows.nth(3).hover();
    await expect(rows.nth(3)).toHaveAttribute("data-active", "");
    await rows.nth(1).click();
    await expect(page).toHaveURL(/page=practice-disputes/);
    await expect(page.locator("h1:visible")).toContainText("Disputes");
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  /* Batch B ------------------------------------------------------------------------------------ */

  test("site-ai-01: the typing demo writes a draft, a new tone re-types it; TR", async ({ page }) => {
    const errors = await openSite(page, "site-ai-01");
    const demo = page.locator("#demo");
    await demo.scrollIntoViewIfNeeded();
    await expect(demo.locator('[data-demo-status="done"]')).toHaveCount(1, { timeout: 25_000 });
    const out = () => demo.locator('[role="region"]').first().innerText();
    const first = await out();
    await page.getByRole("radio", { name: "Brief" }).click();
    await expect(demo.locator('[data-demo-status="done"]')).toHaveCount(1, { timeout: 25_000 });
    await expect.poll(out).not.toBe(first);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-devtool-01: one language tab switches every sample and the install line; TR", async ({ page }) => {
    const errors = await openSite(page, "site-devtool-01");
    const python = page.getByRole("tab", { name: "Python" });
    expect(await python.count()).toBeGreaterThan(1);
    await python.first().click();
    await expect.poll(async () => [...new Set(await page.locator('[role=tab][aria-selected=true]').allInnerTexts())].filter((t) => /cURL|Node|Python|Go|Ruby/.test(t))).toEqual(["Python"]);
    await expect(page.getByText("pip install relay-webhooks").first()).toBeVisible();
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-changelog-01: type filters narrow the releases and a release opens as an entry; TR", async ({ page }) => {
    const errors = await openSite(page, "site-changelog-01");
    const releases = page.locator("[data-release]");
    const all = await releases.count();
    expect(all).toBeGreaterThan(3);
    await page.getByRole("button", { name: /Features/ }).click();
    await page.getByRole("button", { name: /Improvements/ }).click();
    await expect.poll(() => releases.count()).toBeLessThan(all);
    await page.getByRole("button", { name: /Features/ }).click();
    await page.getByRole("button", { name: /Improvements/ }).click();
    await expect.poll(() => releases.count()).toBe(all);
    await page.getByRole("link", { name: "Read the v4.9 notes" }).click();
    await expect(page).toHaveURL(/page=entry/);
    await expect(page.locator("h1:visible")).toContainText("4.9");
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-status-01: uptime bars show a tooltip per day, arrows move, Enter opens the incident; TR", async ({ page }) => {
    const errors = await openSite(page, "site-status-01");
    const bars = page.locator('[aria-label="REST API, last 90 days"]').locator("button");
    await expect(bars).toHaveCount(90);
    await bars.nth(70).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.mouse.move(5, 5);
    await bars.nth(89).focus();
    for (let i = 0; i < 28; i++) await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tooltip")).toContainText(/Enter for the timeline/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/page=incident/);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-waitlist-01: validated sign-up shows the position, an invite moves it up; TR", async ({ page }) => {
    const errors = await openSite(page, "site-waitlist-01");
    const form = page.locator("#join form");
    const join = form.getByRole("button", { name: "Join the waitlist" });
    await join.click();
    await expect(page.getByText("Enter your email to join.")).toBeVisible();
    await form.getByRole("textbox").fill("deniz.k@example.com");
    await join.click();
    await expect(page).toHaveURL(/page=joined/);
    const position = async () => Number((await page.getByTestId("position").innerText()).replace(/[^0-9]/g, ""));
    await expect.poll(position, { timeout: 10_000 }).toBe(12409);
    const invite = page.getByRole("form", { name: "Invite a friend" });
    await invite.getByRole("textbox").fill("ada@example.com");
    await invite.getByRole("button", { name: "Invite" }).click();
    await expect.poll(position, { timeout: 10_000 }).toBe(12159);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-help-01: typing shows instant results with the match marked, Enter opens the article; TR", async ({ page }) => {
    const errors = await openSite(page, "site-help-01");
    await page.getByRole("combobox").first().click();
    await page.keyboard.type("frost", { delay: 30 });
    const panel = page.locator("[data-search-open] [cmdk-list]");
    await expect(panel.getByRole("option").first()).toContainText(/frost/i);
    expect(await panel.locator("mark").count()).toBeGreaterThan(0);
    await page.keyboard.type(" dat", { delay: 30 });
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/page=article/);
    await expect(page.locator("h1:visible")).toContainText(/frost/i);
    await page.getByRole("button", { name: "Yes" }).click();
    await expect(page.getByText("Glad it helped")).toBeVisible();
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  /* Batch G ------------------------------------------------------------------------------------ */

  test("site-store-02: the drop countdown ticks and quick-add puts a size in the bag; TR", async ({ page }) => {
    const errors = await openSite(page, "site-store-02");
    const seconds = page.locator('[data-countdown] [data-unit="seconds"]').first();
    const a = await seconds.textContent();
    await expect.poll(() => seconds.textContent(), { timeout: 5_000 }).not.toBe(a);
    await expect(page.locator('[role="timer"]').first()).toHaveAttribute("aria-label", /opens in \d+ days/);
    await page.getByRole("button", { name: "Add Ferry Line Hoodie, size M" }).click();
    await page.locator('a[href="#bag"]').first().click();
    await expect(page.getByRole("dialog").getByText("Ferry Line Hoodie")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-portfolio-02: the G key and the toggle show the grid, captions follow figures, register filters; TR", async ({ page }) => {
    const errors = await openSite(page, "site-portfolio-02", "project-kara");
    const overlay = page.locator("[data-grid-overlay]");
    const toggle = page.locator("[data-grid-toggle]");
    await toggle.click();
    await expect(overlay).toHaveAttribute("data-grid-overlay", "on");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.locator("body").press("g");
    await expect(overlay).toHaveAttribute("data-grid-overlay", "off");
    const caption = page.locator('aside a[href="#fig-kara-03"]');
    await caption.click();
    await expect(caption).toHaveAttribute("aria-current", "true");
    await page.goto(urlOf("site-portfolio-02"));
    await waitForHydration(page);
    const index = page.locator("#index");
    const rows = async () => (await index.innerText()).match(/(\d+) of (\d+)/i)?.slice(1).map(Number);
    await page.getByRole("radio", { name: "Civic" }).click();
    await expect.poll(rows).toEqual([3, 8]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-blog-02: one language tab switches every code sample in the post; TR", async ({ page }) => {
    const errors = await openSite(page, "site-blog-02", "post");
    const main = page.locator("main");
    await main.getByRole("tab", { name: "Rust" }).first().click();
    await expect.poll(async () => [...new Set(await main.locator("[role=tab][aria-selected=true]").allInnerTexts())]).toEqual(["Rust"]);
    await expect(main.getByRole("radio", { name: "Rust" })).toHaveAttribute("aria-checked", "true");
    await main.getByRole("radio", { name: "TS" }).click();
    await expect.poll(async () => [...new Set(await main.locator("[role=tab][aria-selected=true]").allInnerTexts())]).toEqual(["TypeScript"]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-app-02: the goal planner re-projects the balance as goal and sliders change; TR", async ({ page }) => {
    const errors = await openSite(page, "site-app-02");
    const planner = page.locator("#planner");
    await planner.scrollIntoViewIfNeeded();
    const balance = () => planner.locator("dl dd").first().textContent();
    const start = await balance();
    await planner.getByRole("radio", { name: "Home deposit" }).click();
    const monthly = planner.getByRole("slider").first();
    await monthly.focus();
    await page.keyboard.press("End");
    await expect.poll(balance).not.toBe(start);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  /* Batch C ------------------------------------------------------------------------------------ */

  test("site-nonprofit-01: a gift amount fills the shelf with books and carries to the donate form; TR", async ({ page }) => {
    const errors = await openSite(page, "site-nonprofit-01");
    const gift = page.locator("#give");
    await gift.scrollIntoViewIfNeeded();
    await expect(gift.getByTestId("gift-books")).toContainText("30 books");
    await gift.getByRole("radio", { name: "Other" }).click();
    await gift.getByRole("spinbutton").fill("13650");
    await expect(gift.getByTestId("gift-books")).toContainText("151 books");
    await expect(gift.getByTestId("gift-shelf").locator("span")).toHaveCount(151);
    await gift.getByRole("radio", { name: "Monthly" }).click();
    await gift.getByRole("radio", { name: "₺600" }).click();
    await gift.getByRole("link", { name: /Give ₺600 a month/ }).click();
    await expect(page).toHaveURL(/page=donate/);
    const go = page.getByRole("button", { name: /Continue — ₺600 a month/ });
    await go.click();
    await expect(page.getByText("Tell us your name").first()).toBeVisible();
    await page.getByLabel("Full name").fill("Elif Yıldız");
    await page.getByLabel("Email").fill("elif@example.com");
    await go.click();
    await expect(page.getByTestId("donate-done")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-podcast-01: play advances the clock, chapters jump, a transcript line seeks; TR", async ({ page }) => {
    const errors = await openSite(page, "site-podcast-01");
    const play = page.getByTestId("play").first();
    await play.click();
    await expect.poll(() => page.getByTestId("player-time").first().innerText(), { timeout: 5_000 }).not.toMatch(/^0:00/);
    await play.click();
    await page.getByRole("button", { name: /Salt as a contract/ }).first().click();
    await expect(page.getByTestId("chapter-title").first()).toContainText("Salt");
    await page.getByRole("searchbox", { name: "Search episodes" }).fill("bakery");
    await expect(page.getByTestId("episode-count")).toContainText(/^1 of 8/);
    await page.getByRole("searchbox", { name: "Search episodes" }).fill("");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    await page.goto(urlOf("site-podcast-01", "episode"));
    await waitForHydration(page);
    const lines = page.getByTestId("transcript-line");
    await lines.nth(13).click();
    await expect(lines.nth(13)).toHaveAttribute("aria-current", "true");
    await expect(page.getByTestId("chapter-title").first()).toContainText("spoon");
    expect(errors).toEqual([]);
  });

  test("site-artist-01: tour dates group by month, region filter and hide sold out narrow them; TR", async ({ page }) => {
    const errors = await openSite(page, "site-artist-01", "tour");
    const count = page.getByTestId("tour-count");
    await expect(count).toContainText(/^18/);
    await expect(page.getByTestId("tour-month")).toHaveCount(3);
    await page.getByRole("radio", { name: "Europe" }).click();
    await expect(count).toContainText(/^6/);
    await page.getByRole("radio", { name: "All dates" }).click();
    await page.getByRole("switch", { name: /Hide sold out/ }).click();
    await expect(count).toContainText(/^13/);
    await page.getByRole("switch", { name: /Hide sold out/ }).click();
    const waitlist = page.getByTestId("waitlist").first();
    await waitlist.click();
    await expect(waitlist).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    await expect(page.getByTestId("tour-month").first()).toContainText(/ocak/i);
    expect(errors).toEqual([]);
  });

  test("site-wedding-01: RSVP finds the invitation, plus-one and dietary clash hint, reply sent; TR", async ({ page }) => {
    const errors = await openSite(page, "site-wedding-01", "rsvp");
    const shell = page.locator("[data-site-shell]");
    await shell.getByLabel("Your full name").fill("selin aksoy");
    await shell.getByRole("button", { name: "Find my invitation" }).click();
    await expect(shell.getByRole("heading", { name: "Who’s coming?" })).toBeVisible();
    await shell.getByRole("radio", { name: "Joyfully accepts" }).click();
    await shell.getByRole("checkbox", { name: /bringing a guest/ }).click();
    await shell.getByRole("button", { name: "Continue" }).click();
    await expect(shell.getByText("Please add your guest’s name.")).toBeVisible();
    await shell.getByLabel("Your guest’s full name").fill("Emre Tan");
    await shell.getByRole("button", { name: "Continue" }).click();
    await expect(shell.getByRole("heading", { name: "Dinner at the long table" })).toBeVisible();
    const sets = shell.locator("fieldset");
    await expect(sets).toHaveCount(2);
    await sets.nth(0).getByRole("radio", { name: /lamb/i }).click();
    await sets.nth(0).getByRole("checkbox", { name: "Vegan" }).click();
    await expect(shell.getByText(/Vegan is ticked/)).toBeVisible();
    await shell.getByRole("button", { name: "Switch to the dolma" }).click();
    await expect(shell.getByText(/Vegan is ticked/)).toBeHidden();
    await sets.nth(1).getByRole("radio", { name: /Sea bass/ }).click();
    await shell.getByRole("button", { name: "Continue" }).click();
    await shell.getByRole("button", { name: "Send our reply" }).click();
    await expect(shell.getByRole("heading", { name: /see you under the olive tree/ })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  /* Batch D ------------------------------------------------------------------------------------ */

  test("site-autoservice-01: the service picker re-times and re-prices the job card and carries it to booking; TR", async ({ page }) => {
    const errors = await openSite(page, "site-autoservice-01", "services");
    const card = page.locator("aside[aria-labelledby=gl-jobcard-services]");
    const ready = () => card.getByTestId("gl-ready").textContent();
    const total = () => card.getByTestId("gl-total").textContent();
    const [r0, t0] = [await ready(), await total()];
    await page.getByRole("checkbox", { name: "Front brake pads" }).click();
    await expect.poll(ready).not.toBe(r0);
    await expect.poll(total).not.toBe(t0);
    const t1 = await total();
    await page.getByRole("radio", { name: /SUV/ }).click();
    await expect.poll(total).not.toBe(t1);
    await card.getByRole("button", { name: "Book this job" }).click();
    await expect(page).toHaveURL(/page=booking/);
    await expect(page.locator("main li").filter({ hasText: "Front brake pads" }).first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-vet-01: the pet switch swaps the service list and survives a page change; TR", async ({ page }) => {
    const errors = await openSite(page, "site-vet-01");
    const hero = page.locator("section[aria-labelledby=pb-hero-title]");
    await expect(hero.getByText("Puppy course (3 visits)")).toBeVisible();
    await hero.getByRole("radio", { name: "Cat" }).click();
    await expect(hero.getByText("Cat-friendly consultation")).toBeVisible();
    await page.locator("header").getByRole("link", { name: "Services & fees" }).first().click();
    await expect(page).toHaveURL(/page=services/);
    await expect(page.getByText("8 services for cats")).toBeVisible();
    await page.locator("main").getByRole("radio", { name: "Bird" }).first().click();
    await expect(page.getByRole("heading", { name: "Avian consultation" })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    await expect(page.getByRole("heading", { name: "Kuş muayenesi" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("site-preschool-01: the daily rhythm timeline answers clicks, arrows and a group switch; TR", async ({ page }) => {
    const errors = await openSite(page, "site-preschool-01");
    const tabs = page.locator("[role=tablist]:visible").first().getByRole("tab");
    await expect(tabs).toHaveCount(11);
    await tabs.nth(3).click();
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Project time (in English)" })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Garden" })).toBeVisible();
    await page.locator("#day").getByRole("radio", { name: /Orchard/ }).first().click();
    await expect(tabs).toHaveCount(12);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-driving-01: licence and pace re-price the comparison, differences-only hides rows, the pick carries to sign-up; TR", async ({ page }) => {
    const errors = await openSite(page, "site-driving-01", "courses");
    const price = () => page.getByTestId("cr-price-standard").textContent();
    const p0 = await price();
    await page.getByRole("radio", { name: "Motorcycle A2" }).click();
    await expect.poll(price).not.toBe(p0);
    const rows = await page.locator("tbody tr").count();
    await page.getByRole("switch", { name: "Only show differences" }).click();
    await expect.poll(() => page.locator("tbody tr").count()).toBeLessThan(rows);
    await page.getByRole("button", { name: /Choose\s+Intensive/ }).click();
    await expect(page.getByRole("button", { name: /Chosen\s+Intensive/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Sign up", exact: true }).last().click();
    await expect(page).toHaveURL(/page=signup/);
    await expect(page.getByRole("radio", { name: /Intensive/ })).toBeChecked();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-movers-01: the hero estimate and the quote steps move the price range; TR", async ({ page }) => {
    const errors = await openSite(page, "site-movers-01");
    const from = () => page.getByTestId("tf-hero-from").textContent();
    const f0 = await from();
    await page.getByRole("radio", { name: "4+1" }).click();
    await expect.poll(from).not.toBe(f0);
    await page.getByRole("button", { name: "Get my exact quote" }).click();
    await expect(page).toHaveURL(/page=quote/);
    const range = () => page.getByTestId("tf-range").textContent();
    const r0 = await range();
    await page.locator("select[name=fromFloor]").selectOption("5");
    await page.getByRole("switch", { name: "Lift we can use" }).first().click();
    await expect.poll(range).not.toBe(r0);
    const r1 = await range();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("checkbox", { name: /Piano/ }).click();
    await expect.poll(range).not.toBe(r1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-florist-01: bouquet and size carry to the order, the card preview follows the message; TR", async ({ page }) => {
    const errors = await openSite(page, "site-florist-01", "bouquets");
    const shell = page.locator("[data-site-shell]");
    await shell.getByRole("radio", { name: "Large" }).click();
    await shell.getByRole("link", { name: /Order · Large/ }).nth(1).click();
    await expect(shell.getByRole("heading", { name: /Send flowers/ })).toBeVisible();
    await expect(shell.getByRole("combobox").first()).toContainText("Blue Hour");
    await expect(shell.getByRole("radio", { name: "Large", checked: true })).toHaveCount(1);
    await shell.getByRole("button", { name: "Congratulations" }).click();
    await expect(shell.locator("aside")).toContainText("Congratulations. We always knew.");
    await shell.getByRole("checkbox", { name: /anonymously/ }).click();
    await expect(shell.locator("aside")).toContainText("someone who thinks of you");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-studio-01: the package builder re-quotes and carries the package to booking; TR", async ({ page }) => {
    const errors = await openSite(page, "site-studio-01", "packages");
    const sheet = page.locator("aside[aria-labelledby=lr-sheet]");
    const total = async () => (await sheet.locator(".font-display").first().innerText()).trim();
    const t0 = await total();
    await page.getByRole("radio", { name: /Team headshots/ }).click();
    await expect.poll(total).not.toBe(t0);
    const t1 = await total();
    await page.getByRole("checkbox", { name: /48-hour delivery/ }).click();
    await expect(sheet.getByText("48-hour delivery")).toBeVisible();
    await expect.poll(total).not.toBe(t1);
    await sheet.getByRole("button", { name: "Book this package" }).click();
    await expect(page).toHaveURL(/page=booking/);
    await expect(page.locator("aside[aria-labelledby=lr-pkg-h]")).toContainText(/team headshots/i);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-venue-01: layout and head count light rooms on the plan, a combination preselects the enquiry; TR", async ({ page }) => {
    const errors = await openSite(page, "site-venue-01");
    const shell = page.locator("[data-site-shell]");
    const filled = () => shell.locator('#finder svg rect[fill="var(--accent)"]').count();
    await expect.poll(filled).toBe(2);
    const guests = shell.getByRole("textbox", { name: "Number of guests" });
    await shell.getByRole("radio", { name: "Theatre" }).click();
    await guests.fill("400");
    await guests.press("Enter");
    await expect.poll(filled).toBe(1);
    await shell.getByRole("radio", { name: "Banquet" }).click();
    await guests.fill("400");
    await guests.press("Enter");
    await expect.poll(filled).toBe(0);
    await shell.getByRole("button", { name: /Grain Hall \+ Mill Race Terrace/ }).click();
    await expect(shell.getByRole("heading", { name: /Tell us about/ })).toBeVisible();
    await expect(shell.getByRole("checkbox", { name: /Grain Hall/ })).toBeChecked();
    await expect(shell.getByRole("checkbox", { name: /Mill Race Terrace/ })).toBeChecked();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });
  test("site-therapy-01: the receipt panel follows the form, voicemail only for phone, in-person hides the message, send and clear; TR", async ({ page }) => {
    const errors = await openSite(page, "site-therapy-01", "contact");
    const receipt = page.locator("[data-qh-receipt]");
    await page.locator("#qh-name").fill("Deniz");
    await expect(receipt).toContainText("Deniz");
    await expect(page.getByRole("switch", { name: /voicemail/ })).toHaveCount(0);
    await page.getByRole("radio", { name: "Phone call" }).click();
    await expect(page.getByRole("switch", { name: /voicemail/ })).toBeVisible();
    await page.getByRole("radio", { name: "Email" }).click();
    await page.locator("#qh-contact").fill("deniz@example.com");
    await expect(receipt).toContainText("deniz@example.com");
    await expect(page.getByRole("textbox", { name: /A few words/ })).toBeVisible();
    await page.getByRole("switch", { name: /explain in person/ }).click();
    await expect(page.getByRole("textbox", { name: /A few words/ })).toHaveCount(0);
    await page.getByRole("checkbox", { name: /Use these details/ }).click();
    await page.getByRole("button", { name: "Send privately" }).click();
    await expect(page.locator("main [role=status]").first()).toBeVisible();
    await page.getByRole("button", { name: /Clear this page/ }).first().click();
    await expect(page.locator("#qh-name")).toHaveValue("");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-dietitian-01: goal, support and place re-price the recommendation, booking is pre-filled; TR keeps the pick", async ({ page }) => {
    const errors = await openSite(page, "site-dietitian-01");
    const result = page.locator("[data-gp-result]").first();
    await result.scrollIntoViewIfNeeded();
    const text = () => result.innerText();
    const r0 = await text();
    await page.getByRole("radio", { name: /Fuel training and races/ }).first().click();
    await expect(result).toHaveAttribute("data-gp-result", "performance");
    await expect.poll(text).not.toBe(r0);
    const r1 = await text();
    await page.getByRole("radio", { name: "Close", exact: true }).first().click();
    await expect.poll(text).not.toBe(r1);
    const r2 = await text();
    await page.getByRole("radio", { name: /Online/ }).first().click();
    await expect.poll(text).not.toBe(r2);
    await result.getByRole("link", { name: "Book this programme" }).click();
    await expect(page).toHaveURL(/page=booking/);
    await expect(page.locator("main").getByRole("combobox").first()).toContainText("Performance");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    await expect(page.locator("main").getByRole("combobox").first()).toContainText("Performans");
    expect(errors).toEqual([]);
  });

  test("site-physio-01: chips and figure hotspots pick the area, the area carries into booking and a slot books; TR", async ({ page }) => {
    const errors = await openSite(page, "site-physio-01");
    const main = page.locator("main");
    await main.getByRole("radio", { name: "Knee", exact: true }).first().click();
    await expect(main.getByRole("link", { name: "Book for knee" }).first()).toBeVisible();
    // The lower back only has a hotspot on the back of the figure: choosing it turns the figure round.
    await main.getByRole("radio", { name: "Lower back", exact: true }).first().click();
    await expect(main.getByRole("radio", { name: "Back", exact: true }).first()).toHaveAttribute("aria-checked", "true");
    await expect(main.locator('button[data-area="back"]')).toHaveCount(1);
    // A hotspot is the pointer shortcut: knee on the back view, then back to the lower back.
    await main.locator('button[data-area="knee"]').first().click();
    await expect(main.getByRole("radio", { name: "Knee", exact: true }).first()).toHaveAttribute("aria-checked", "true");
    await main.locator('button[data-area="back"]').first().click();
    await expect(main.getByRole("link", { name: "Book for lower back" }).first()).toBeVisible();
    await main.getByRole("link", { name: "Book for lower back" }).first().click();
    await expect(page).toHaveURL(/page=booking/);
    await expect(main.getByRole("radio", { name: "Lower back", exact: true })).toHaveAttribute("aria-checked", "true");
    await main.locator("button[data-slot-free]").first().click();
    await page.locator("#ml-name").fill("Ece Yalın");
    await main.getByRole("textbox", { name: /Mobile/ }).fill("5320000000");
    await page.getByRole("checkbox", { name: /KVKK/ }).click();
    await page.getByRole("button", { name: "Book this slot" }).click();
    await expect(main.locator("[role=status]").first()).toContainText(/lower back/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-accounting-01: company type, invoices, payroll and an extra move the fee statement; TR", async ({ page }) => {
    const errors = await openSite(page, "site-accounting-01", "services");
    const total = () => page.getByTestId("lg-total").textContent();
    const t0 = await total();
    await page.getByRole("radio", { name: /Joint-stock company/ }).click();
    await expect.poll(total).not.toBe(t0);
    const t1 = await total();
    await page.getByRole("radio", { name: "201–600" }).click();
    await expect.poll(total).not.toBe(t1);
    const t2 = await total();
    await page.getByRole("slider").first().focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect.poll(total).not.toBe(t2);
    const t3 = await total();
    const ref = await page.getByTestId("lg-ref").textContent();
    await page.getByRole("checkbox", { name: /Audit-ready year end/ }).click();
    await expect.poll(total).not.toBe(t3);
    await expect.poll(() => page.getByTestId("lg-ref").textContent()).not.toBe(ref);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-factory-01: product, size and unit system drive the spec table; the datasheet downloads as CSV; TR", async ({ page }) => {
    const errors = await openSite(page, "site-factory-01", "products");
    const detail = page.getByTestId("os-detail");
    await page.getByRole("button", { name: /Slip-on flange PN10/ }).click();
    await expect(detail.getByRole("heading", { name: "Slip-on flange PN10" })).toBeVisible();
    await page.getByTestId("os-row-2").getByRole("button").click();
    await expect(page.getByTestId("os-row-2").getByRole("button")).toHaveAttribute("aria-pressed", "true");
    const head = () => detail.locator("thead").innerText();
    await expect.poll(head).toContain("mm");
    await detail.getByRole("radio", { name: "Imperial" }).click();
    await expect.poll(head).toContain("in");
    await expect.poll(head).not.toContain("(mm)");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("os-download").click()]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    const body = await (await import("node:fs/promises")).readFile((await download.path())!, "utf8");
    expect(body.charCodeAt(0)).toBe(0xfeff);
    expect(body).toContain(";");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-construction-01: the projects filter counts, the progress timeline scrubs months and changes the diary; TR", async ({ page }) => {
    const errors = await openSite(page, "site-construction-01", "projects");
    const count = () => page.getByTestId("sb-count").textContent();
    const c0 = await count();
    await page.getByRole("radiogroup", { name: "Status" }).getByRole("radio", { name: "Completed", exact: true }).click();
    await expect.poll(count).not.toBe(c0);
    await page.goto(urlOf("site-construction-01", "project-kuzey-yaka"));
    await waitForHydration(page);
    const overall = () => page.getByTestId("sb-overall").textContent();
    const diary = () => page.getByTestId("sb-diary").textContent();
    const o0 = await overall();
    const d0 = await diary();
    for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Previous month" }).click();
    await expect.poll(overall).not.toBe(o0);
    await expect.poll(diary).not.toBe(d0);
    await page.getByRole("button", { name: "Back to today" }).click();
    await expect.poll(overall).toBe(o0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-public-01: the toolbar sets largest text, high contrast and underlined links, kept after reload and on TR; reset", async ({ page }) => {
    const errors = await openSite(page, "site-public-01");
    const bar = page.locator("[data-a11y-toolbar]");
    const root = page.locator("[data-a11y-size]").first();
    const fontSize = () => page.evaluate(() => document.documentElement.style.fontSize);
    await bar.getByRole("radio", { name: "Largest text" }).click();
    await expect.poll(fontSize).toBe("130%");
    await bar.getByRole("radio", { name: "High" }).click();
    await expect(root).toHaveAttribute("data-a11y-contrast", "high");
    await bar.getByRole("switch", { name: "Underline links" }).click();
    await expect(root).toHaveAttribute("data-a11y-underline", "");
    await page.reload();
    await waitForHydration(page);
    await expect(root).toHaveAttribute("data-a11y-size", "larger");
    await expect(root).toHaveAttribute("data-a11y-contrast", "high");
    await switchToTurkish(page);
    await expect(root).toHaveAttribute("data-a11y-size", "larger");
    await bar.getByRole("button", { name: "Sıfırla" }).click();
    await expect(root).toHaveAttribute("data-a11y-size", "standard");
    await expect.poll(fontSize).toBe("");
    expect(errors).toEqual([]);
  });

  test("site-department-01: the course finder searches, filters, sorts and opens details; TR", async ({ page }) => {
    const errors = await openSite(page, "site-department-01", "programmes");
    const count = () => page.locator('p[role="status"] .tabular-nums').first().innerText();
    const all = await count();
    await page.locator("#cf-q").fill("housing");
    await expect.poll(count).toBe("3");
    await page.locator("#cf-q").fill("");
    await expect.poll(count).toBe(all);
    await page.locator('[aria-labelledby="cf-level"]').getByRole("radio", { name: /Master/ }).click();
    await expect.poll(count).toBe("6");
    await page.locator('[aria-labelledby="cf-format"]').getByRole("button", { name: "Studio" }).click();
    await expect.poll(count).toBe("2");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByRole("switch", { name: "Free seats only" }).click();
    await expect.poll(count).toBe("18");
    await page.locator("#cf-sort").selectOption("ects");
    const list = page.locator("main ol").filter({ hasText: "URB 502" }).first();
    await expect(list.locator("li").first()).toContainText("URB 502");
    const details = list.locator("li").first().getByRole("button", { name: "Details" });
    await details.click();
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-club-01: team, competition and venue filters change the board; results show the record; a fixture downloads as .ics; TR", async ({ page }) => {
    const errors = await openSite(page, "site-club-01", "fixtures");
    const rows = () => page.locator("[role=tabpanel][data-state=active] [data-match]").count();
    await expect.poll(rows).toBeGreaterThan(1);
    const before = await rows();
    await page.locator("[data-venue-filter]").getByRole("radio").nth(1).click();
    await expect.poll(rows).toBeLessThan(before);
    await page.locator("[data-venue-filter]").getByRole("radio").first().click();
    await expect.poll(rows).toBe(before);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("[data-ics]").first().click()]);
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    const ics = await (await import("node:fs/promises")).readFile((await download.path())!, "utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    await page.locator('[data-tab="results"]').click();
    await expect(page.locator("[data-record]")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-community-01: sorting, unanswered, the category rail, paging, a like and a reply; TR", async ({ page }) => {
    const errors = await openSite(page, "site-community-01", "topics");
    const rows = page.locator("main [data-topic]");
    const rail = page.getByRole("navigation", { name: "Categories" });
    const sort = page.getByRole("radiogroup", { name: "Sort topics" });
    await sort.getByRole("radio", { name: "Latest" }).click();
    await expect(rows.first()).toHaveAttribute("data-topic", "guidelines");
    await sort.getByRole("radio", { name: "Unanswered" }).click();
    await expect.poll(async () => (await rows.evaluateAll((els) => els.map((e) => e.getAttribute("data-topic")))).sort()).toEqual(["first-weld", "plaster"]);
    await sort.getByRole("radio", { name: "Latest" }).click();
    await rail.getByRole("button", { name: /All categories/ }).click();
    await page.getByRole("button", { name: /^(Go to )?page 2$/i }).first().click();
    await expect(rows).toHaveCount(6);
    // The home page's category links deep-link into the topics rail.
    await page.goto(urlOf("site-community-01"));
    await waitForHydration(page);
    await page.locator('main a[href*="#cat-metal"]').first().click();
    await expect(page).toHaveURL(/page=topics.*#cat-metal/);
    await expect(rail.getByRole("button", { name: /Metalwork/ })).toHaveAttribute("aria-pressed", "true");
    await expect(rows).toHaveCount(2);
    await page.goto(urlOf("site-community-01", "thread"));
    await waitForHydration(page);
    const like = page.locator("main article button[aria-pressed]").first();
    const n0 = Number((await like.innerText()).match(/\d+/)![0]);
    await like.click();
    await expect(like).toHaveAttribute("aria-pressed", "true");
    await expect(like).toContainText(String(n0 + 1));
    await page.locator("#reply-body").fill("Two layers of 18 mm birch, glued and screwed from below, worked for me.");
    await page.getByRole("button", { name: "Post reply" }).click();
    await expect(page.getByRole("article", { name: "Your reply" })).toContainText("Two layers of 18 mm birch");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-game-01: the trailer facade loads a video on click; a press file downloads on its own; TR", async ({ page }) => {
    const errors = await openSite(page, "site-game-01");
    const trailer = page.locator("[data-trailer]").first();
    await expect(trailer.locator("video, iframe")).toHaveCount(0);
    await trailer.getByRole("button").first().click();
    await expect(trailer.locator("video, iframe")).toHaveCount(1);
    await page.goto(urlOf("site-game-01", "press"));
    await waitForHydration(page);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator('[data-download="logo-dark"]').click()]);
    expect(download.suggestedFilename()).toBe("ember-atlas-logo-on-dark.svg");
    const svg = await (await import("node:fs/promises")).readFile((await download.path())!, "utf8");
    expect(svg).toContain("<svg");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-clinic-02: a birth date lights the check-up path and Book carries the visit to the booking page; TR", async ({ page }) => {
    const errors = await openSite(page, "site-clinic-02");
    await page.getByRole("button", { name: "Try a 7-month-old" }).click();
    const board = page.getByRole("list", { name: /Check-ups from two weeks/ });
    await expect(board.locator('button[aria-current="step"]')).toHaveCount(1);
    await page.getByRole("button", { name: /^Book the .+ check-up/ }).click();
    await expect(page).toHaveURL(/page=book/);
    await expect(page.getByRole("complementary", { name: "Your visit" })).toContainText("Ada");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-estate-02: the floor plan and arrows change the room photograph and caption; TR", async ({ page }) => {
    const errors = await openSite(page, "site-estate-02", "residence");
    const plan = page.locator("#plan [role=group]").first();
    const pressed = () => plan.locator('button[aria-pressed="true"]').innerText();
    const caption = () => page.locator("#plan figcaption p").first().innerText();
    const c0 = await caption();
    const p0 = await pressed();
    await page.getByRole("button", { name: "Next room" }).click();
    await expect.poll(caption).not.toBe(c0);
    await expect.poll(pressed).not.toBe(p0);
    await plan.locator("button").nth(0).click();
    await expect.poll(pressed).toBe(await plan.locator("button").nth(0).innerText());
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-saas-02: metric and channel re-run the query console and its compiled SQL; TR", async ({ page }) => {
    const errors = await openSite(page, "site-saas-02");
    await page.getByRole("tab", { name: "SQL" }).click();
    const sql = () => page.getByLabel("Compiled SQL").innerText();
    const s0 = await sql();
    await page.locator('[aria-labelledby="qc-metric"]').getByRole("radio").nth(1).click();
    await expect.poll(sql).not.toBe(s0);
    const s1 = await sql();
    await page.locator('[aria-labelledby="qc-segment"]').getByRole("radio").nth(1).click();
    await expect.poll(sql).not.toBe(s1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-agency-02: the colour stage takes a client's colour; the brief totals weeks and price live; TR", async ({ page }) => {
    const errors = await openSite(page, "site-agency-02");
    const stage = page.locator('section[aria-labelledby="tt-hero-title"]');
    const bg = () => stage.evaluate((el) => getComputedStyle(el).backgroundColor);
    const b0 = await bg();
    await stage.locator('[aria-labelledby="tt-stage-label"]').getByRole("radio").nth(2).click();
    await expect(stage).toContainText(/Now showing: /);
    await expect.poll(bg, { timeout: 5_000 }).not.toBe(b0);
    await page.goto(urlOf("site-agency-02", "contact"));
    await waitForHydration(page);
    const summary = page.locator('[aria-live="polite"]').filter({ hasText: "Your brief so far" });
    const services = page.locator("#tt-services").getByRole("button");
    const text = () => summary.innerText();
    const t0 = await text();
    await services.nth(0).click();
    await expect.poll(text).not.toBe(t0);
    await expect(summary).toContainText("Naming");
    for (const b of await services.all()) if ((await b.getAttribute("aria-pressed")) === "true") await b.click();
    await expect(summary).toContainText("Nothing yet");
    await services.nth(0).click();
    await expect(summary).toContainText("3 weeks");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-wholesale-01: search narrows the catalogue, add to quote, the toast opens the quote with the line; TR", async ({ page }) => {
    const errors = await openSite(page, "site-wholesale-01", "catalogue");
    const lines = page.locator("main article");
    const all = await lines.count();
    expect(all).toBeGreaterThan(3);
    const search = page.getByRole("searchbox", { name: "Search by name, size or SKU" });
    await search.fill("mailer");
    await expect.poll(() => lines.count()).toBeLessThan(all);
    const first = lines.first();
    const name = (await first.locator("h2, h3").first().innerText()).trim();
    await first.getByRole("button", { name: "Add to quote" }).click();
    await expect(first.getByText(/In quote · \d+ cases/)).toBeVisible();
    await page.getByRole("button", { name: "Open quote" }).click();
    await expect(page).toHaveURL(/page=quote/);
    await expect(page.locator("main")).toContainText(name);
    await page.goto(urlOf("site-wholesale-01", "catalogue"));
    await waitForHydration(page);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-careers-01: search narrows the open roles to an empty state and back; the apply form validates; TR", async ({ page }) => {
    const errors = await openSite(page, "site-careers-01", "jobs");
    const count = () => page.getByTestId("job-count").innerText().then((s) => Number(s.match(/\d+/)?.[0] ?? -1));
    const all = await count();
    expect(all).toBeGreaterThan(1);
    const search = page.getByRole("searchbox");
    await search.fill("zzqx-nothing");
    await expect.poll(count).toBe(0);
    await page.getByRole("button", { name: "Show all roles" }).click();
    await expect.poll(count).toBe(all);
    await page.goto(urlOf("site-careers-01", "job"));
    await waitForHydration(page);
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText("Tell us your name.")).toBeVisible();
    await expect(page.getByText("Attach your CV as a PDF.")).toBeVisible();
    await expect(page.getByTestId("apply-done")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-digital-01: the live preview switches device and colour mode; TR", async ({ page }) => {
    const errors = await openSite(page, "site-digital-01", "product");
    const region = page.getByRole("region", { name: /^Live preview of / }).first();
    await expect(region).toHaveAttribute("aria-label", /Desktop, 1280 px/);
    await page.getByRole("radio", { name: "Phone, 390 px" }).first().click();
    await expect(region).toHaveAttribute("aria-label", /Phone, 390 px/);
    const mode = page.getByRole("radiogroup", { name: "Colour mode" }).first();
    const target = (await region.getAttribute("aria-label"))!.includes("Dark") ? "Light" : "Dark";
    await mode.getByRole("radio", { name: target }).click();
    await expect(region).toHaveAttribute("aria-label", new RegExp(`, ${target}, `));
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-subbox-01: picking another cell of the plan grid reprices the box, start places the order; TR", async ({ page }) => {
    const errors = await openSite(page, "site-subbox-01", "plans");
    const price = () => page.getByTestId("box-price").innerText();
    const p0 = await price();
    const cells = page.locator("main table").first().locator("input[type=radio]");
    await expect(cells).toHaveCount(9);
    const target = (await cells.nth(0).isChecked()) ? 8 : 0;
    await page.locator(`label[for="${await cells.nth(target).getAttribute("id")}"]`).click();
    await expect(cells.nth(target)).toBeChecked();
    await expect.poll(price).not.toBe(p0);
    await page.getByRole("button", { name: /^Start for / }).click();
    await expect(page.getByTestId("box-order")).toContainText("Subscription started");
    await page.evaluate(() => window.scrollTo(0, 0));
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-market-01: a search adds a removable chip and narrows the results; TR", async ({ page }) => {
    const errors = await openSite(page, "site-market-01", "search");
    const h1 = page.locator("h1:visible");
    const t0 = await h1.innerText();
    await page.getByRole("searchbox").first().fill("oak");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(h1).toHaveText("Results for “oak”");
    const chips = page.getByRole("list", { name: "Filters" });
    await expect(chips).toContainText("“oak”");
    await chips.getByRole("button", { name: /Remove filter/ }).first().click();
    await expect(h1).toHaveText(t0);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });

  test("site-newsletter-01: the subscribe form fixes a typo and reaches double opt-in; the archive search counts matches; TR", async ({ page }) => {
    const errors = await openSite(page, "site-newsletter-01");
    const form = page.getByRole("form", { name: "Subscribe to The Slow Desk" }).first();
    const email = form.getByRole("textbox", { name: "Your email" });
    await form.getByRole("button", { name: /Subscribe/ }).click();
    await expect(form).toContainText("That doesn’t look like an email address yet.");
    await email.fill("reader@gmial.com");
    await form.getByRole("button", { name: "reader@gmail.com" }).click();
    await expect(email).toHaveValue("reader@gmail.com");
    await form.getByRole("button", { name: /Subscribe/ }).click();
    await expect(page.getByTestId("subscribed").first()).toContainText("reader@gmail.com");
    await page.goto(urlOf("site-newsletter-01", "archive"));
    await waitForHydration(page);
    const count = page.getByTestId("archive-count");
    await expect(count).toContainText("Showing");
    await page.keyboard.press("/");
    await expect(page.locator("#sd-archive-q")).toBeFocused();
    await page.keyboard.type("ferry");
    await expect(count).toContainText(/\d+ letters? match/);
    await switchToTurkish(page);
    expect(errors).toEqual([]);
  });
});
