import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, gotoWithRetry, onlyRestartNoise, seriousA11y, setTheme, stubExternalRequests, waitForServer } from "./helpers";

/**
 * Showcase websites (the few finished site blocks kept as references). For every site: a smoke pass over all of its pages
 * (HTTP 200, one visible h1, a main landmark, no console or page errors, no serious/critical axe
 * finding with colour contrast on, no sideways scroll at 1440 and 390 px) and one test of its
 * signature interaction plus the EN → TR switch.
 *
 * Smoke runs in light + solid, where the testing plan checks contrast (glass is judged on token pairs).
 */

const SITES: Record<string, string[]> = {
  "site-store-01": ["home", "shop", "product", "checkout"],
  "site-estate-01": ["home", "listings", "listing"],
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

});
