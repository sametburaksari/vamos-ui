/**
 * Shared Playwright helpers for the docs site. See docs/testing/PLAN.md.
 */
import { expect, test, type Page } from "@playwright/test";
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
const IGNORED = [/Download the React DevTools/i, /\[HMR\]/, /\[Fast Refresh\]/, /_next\/webpack-hmr/];

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
  const visit = async (href: string) => {
    const errors = collectConsoleErrors(page);
    const res = await gotoWithRetry(page, href);
    if (!href.startsWith("/view/")) await expect(page.locator("h1").first(), href).toBeVisible();
    errors.stop();
    return { res, errors: [...errors] };
  };
  for (const href of [...comps, ...blocks]) {
    let { res, errors } = await visit(href);
    // The dev server sometimes serves the first, freshly compiled render of a page from a stale
    // SSR module graph, so it hydrates with a mismatch once and never again (PLAN §11). Reload
    // once; a mismatch that survives the reload is a real bug and still fails.
    if (errors.length && errors.every((e) => HYDRATION.test(e))) {
      test.info().annotations.push({ type: "flaky-hydration", description: href });
      ({ res, errors } = await visit(href));
    }
    // A dev-server restart mid-load (only network errors, nothing from the page itself): wait for
    // it and visit again. Anything the page logs on the second visit still fails.
    if (errors.length && errors.some((e) => SERVER_RESTART.test(e)) && errors.every((e) => SERVER_RESTART.test(e) || /^Failed to load resource/.test(e))) {
      test.info().annotations.push({ type: "dev-server-restart", description: href });
      await waitForServer(page);
      ({ res, errors } = await visit(href));
    }
    opts.onPage && (await opts.onPage(href));
    out.push({ href, status: res?.status(), errors });
  }
  return out;
}

const HYDRATION = /Hydration failed|didn't match the client|hydration mismatch/i;
/**
 * What a page logs when the dev server restarts itself under it (heap past its memory threshold,
 * common on an 8 GB machine with two dev servers): the HTML arrived, the chunks were refused.
 */
const SERVER_RESTART = /ERR_CONNECTION_REFUSED|ERR_INCOMPLETE_CHUNKED_ENCODING|ERR_EMPTY_RESPONSE|ERR_CONNECTION_RESET|ChunkLoadError|Loading chunk .* failed/i;

/** Waits (up to ~35 s) until the dev server answers again. */
export async function waitForServer(page: Page) {
  for (let i = 0; i < 30; i++) {
    const up = await page.request.get("/", { timeout: 5_000 }).then((r) => r.ok(), () => false);
    if (up) return;
    await page.waitForTimeout(1_000);
  }
}

/** Serious + critical axe violations on the current page, as "rule: count" strings. */
export async function seriousA11y(page: Page, disable: string[] = ["color-contrast"]) {
  const r = await new AxeBuilder({ page }).disableRules(disable).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.length} [${v.nodes.map((n) => n.target.join(" ")).join(" | ")}]`);
}

const PNG_1X1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/**
 * Keeps the smoke tests hermetic: requests to other hosts (example photos on images.unsplash.com,
 * Google Fonts previews) are answered locally. A stalled external image kept the `load` event
 * from ever firing on /docs/components/avatar and timed out a whole theme-matrix cell.
 * Images get a 1×1 PNG (hosts ending in `.invalid` get an undecodable body, so "broken image →
 * initials" demos still fall back, without a console error); stylesheets get empty CSS.
 * Set PW_EXTERNAL=1 to let real network through (e.g. a font-rendering check).
 */
export async function stubExternalRequests(page: Page) {
  if (process.env.PW_EXTERNAL === "1") return;
  await page.route(
    (url) => !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      const host = new URL(req.url()).hostname;
      switch (req.resourceType()) {
        case "image":
          return host.endsWith(".invalid")
            ? route.fulfill({ status: 200, contentType: "image/png", body: "not an image" })
            : route.fulfill({ status: 200, contentType: "image/png", body: PNG_1X1 });
        case "stylesheet":
          return route.fulfill({ status: 200, contentType: "text/css", body: "" });
        default:
          return route.fulfill({ status: 204, body: "" });
      }
    },
  );
}

/**
 * `page.goto` that retries once. The Turbopack dev server occasionally never fires `load` for a
 * page (an on-demand compile or a Fast Refresh reload racing the navigation); a second attempt
 * loads it in ~1 s. Real failures (500, console errors) still fail on the retry.
 */
export async function gotoWithRetry(page: Page, href: string, timeout = 30_000) {
  try {
    return await page.goto(href, { waitUntil: "load", timeout });
  } catch (e) {
    // Also: the dev server restarts itself when its heap passes 80% ("approaching the used memory
    // threshold"), refusing connections for a few seconds.
    if (!/Timeout|ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_EMPTY_RESPONSE/i.test(String(e))) throw e;
    await waitForServer(page);
    return page.goto(href, { waitUntil: "load", timeout });
  }
}

/** True when every collected error is network noise from a dev-server restart (nothing from the page). */
export function onlyRestartNoise(errors: string[]) {
  return errors.length > 0 && errors.some((e) => SERVER_RESTART.test(e)) && errors.every((e) => SERVER_RESTART.test(e) || /^Failed to load resource/.test(e));
}

/**
 * Opens a docs component page for an interaction test: 200, visible h1, hydrated. Returns the live
 * console-error array. If the dev server restarted under the load (chunks refused, so the page never
 * hydrates), waits for it, clears that noise and loads the page once more; real errors still fail.
 */
export async function openDocsPage(page: Page, slug: string, ignore: RegExp[] = []) {
  const errors = collectConsoleErrors(page, ignore);
  const href = `/docs/components/${slug}`;
  const load = async () => {
    const res = await gotoWithRetry(page, href);
    expect(res?.status(), slug).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    return waitForHydration(page).then(() => true, () => false);
  };
  let hydrated = await load();
  if (!hydrated || onlyRestartNoise(errors)) {
    test.info().annotations.push({ type: "dev-server-restart", description: href });
    await waitForServer(page);
    errors.length = 0;
    hydrated = await load();
  }
  if (!hydrated) throw new Error(`${slug}: page never hydrated. Console: ${errors.join(" | ")}`);
  return errors;
}

/** `load` fires before React has hydrated a heavy docs page; wait for the demo tabs' React props. */
export async function waitForHydration(page: Page, timeout = 30_000) {
  await page.waitForFunction(
    () => {
      const tab = document.querySelector('main [role="tablist"] [role="tab"]');
      return !!tab && Object.keys(tab).some((k) => k.startsWith("__reactProps"));
    },
    undefined,
    { timeout },
  );
}
