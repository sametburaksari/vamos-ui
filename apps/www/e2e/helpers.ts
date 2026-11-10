/**
 * Shared Playwright helpers for the docs site. See docs/testing/PLAN.md.
 */
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export type ThemeAxes = {
  dark?: boolean;
  material?: "glass" | "solid";
  accent?: "lime" | "ocean" | "ember" | "rose" | "graphite" | (string & {});
  density?: "comfortable" | "compact";
  font?: string;
};

/** The 2 × 2 matrix every docs page and block is smoke-tested in. */
export const THEME_MATRIX: (ThemeAxes & { name: string })[] = [
  { name: "light-glass", dark: false, material: "glass" },
  { name: "light-solid", dark: false, material: "solid" },
  { name: "dark-glass", dark: true, material: "glass" },
  { name: "dark-solid", dark: true, material: "solid" },
];

/**
 * Seeds localStorage "vamos-theme" before any page script runs (the layout's boot script reads it).
 * Call before page.goto(). Calling again replaces the earlier seed: init scripts run in order, last wins.
 */
export async function setTheme(page: Page, axes: ThemeAxes) {
  const state = { dark: false, material: "glass", accent: "lime", density: "comfortable", font: "editorial", ...axes };
  await page.addInitScript((s) => {
    try { localStorage.setItem("vamos-theme", JSON.stringify(s)); } catch {}
  }, state);
}

/** Reads the axes the page actually applied to <html>, to assert setTheme took effect. */
export async function readTheme(page: Page): Promise<Required<ThemeAxes>> {
  return page.evaluate(() => {
    const h = document.documentElement;
    return {
      dark: h.classList.contains("dark"),
      material: (h.dataset.material ?? "glass") as "glass" | "solid",
      accent: h.dataset.accent ?? "lime",
      density: (h.dataset.density ?? "comfortable") as "comfortable" | "compact",
      font: h.dataset.font ?? "editorial",
    };
  });
}

/** Messages that are noise, not bugs (dev-only HMR chatter, React DevTools hint). */
const IGNORED = [/Download the React DevTools/i, /\[HMR\]/, /\[Fast Refresh\]/];

/**
 * Starts collecting page errors and console.error messages. Returns a live array plus `stop()`.
 * Attach before page.goto().
 */
export function collectConsoleErrors(page: Page, ignore: RegExp[] = []) {
  const errors: string[] = [];
  const skip = [...IGNORED, ...ignore];
  const onPageError = (e: Error) => errors.push(`pageerror: ${e.message}`);
  const onConsole = (m: import("@playwright/test").ConsoleMessage) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (!skip.some((r) => r.test(t))) errors.push(t);
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  // Non-enumerable so `expect(errors).toEqual([])` still compares as a plain array.
  Object.defineProperty(errors, "stop", {
    enumerable: false,
    value() {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    },
  });
  return errors as string[] & { stop(): void };
}

/** All docs component page hrefs, read from the /docs/components index. */
export async function componentPages(page: Page): Promise<string[]> {
  await page.goto("/docs/components");
  const hrefs = await page
    .locator('main a[href^="/docs/components/"]')
    .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!.split("#")[0]!));
  return [...new Set(hrefs)].filter((h) => h !== "/docs/components");
}

/** All block preview routes (/view/<name>), read from the /blocks index. */
export async function blockPages(page: Page): Promise<string[]> {
  await page.goto("/blocks");
  const srcs = await page.locator("iframe[src^='/view/']").evaluateAll((fs) => fs.map((f) => f.getAttribute("src")!));
  return [...new Set(srcs)];
}

export interface VisitResult { href: string; status: number | undefined; errors: string[] }

/**
 * Visits every component page (and optionally every block) once, asserting a 200, a visible h1
 * (component pages) and no console errors. `onPage` runs after load for extra checks (axe, screenshot).
 */
export async function visitAllComponentPages(
  page: Page,
  opts: { blocks?: boolean; theme?: ThemeAxes; onPage?: (href: string) => Promise<void> } = {},
): Promise<VisitResult[]> {
  const comps = await componentPages(page);
  const blocks = opts.blocks ? await blockPages(page) : [];
  if (opts.theme) await setTheme(page, opts.theme);
  const out: VisitResult[] = [];
  for (const href of [...comps, ...blocks]) {
    const errors = collectConsoleErrors(page);
    const res = await page.goto(href, { waitUntil: "load" });
    if (!href.startsWith("/view/")) await expect(page.locator("h1").first(), href).toBeVisible();
    opts.onPage && (await opts.onPage(href));
    errors.stop();
    out.push({ href, status: res?.status(), errors: [...errors] });
  }
  return out;
}

/** Serious + critical axe violations on the current page, as "rule: count" strings. */
export async function seriousA11y(page: Page, disable: string[] = ["color-contrast"]) {
  const r = await new AxeBuilder({ page }).disableRules(disable).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.length} [${v.nodes.map((n) => n.target.join(" ")).join(" | ")}]`);
}
