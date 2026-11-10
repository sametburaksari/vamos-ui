import { test, expect } from "@playwright/test";
import { THEME_MATRIX, setTheme, readTheme, visitAllComponentPages, blockPages, collectConsoleErrors, seriousA11y, stubExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/** Every docs component page and every block must load in light/dark × glass/solid without console errors. */
// Serial: four workers hitting the Turbopack dev server's on-demand compile at once time out.
test.describe.serial("theme matrix", () => {
for (const theme of THEME_MATRIX) {
  test(`component pages + blocks render (${theme.name})`, async ({ page }) => {
    // ~145 component pages + ~45 blocks (wave 4); first visits compile on demand in the dev server,
    // and a dev-server restart under memory pressure costs a minute or two.
    test.setTimeout(1_500_000);
    const results = await visitAllComponentPages(page, { blocks: true, theme });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.status, r.href).toBe(200);
      expect(r.errors, `${r.href} (${theme.name})`).toEqual([]);
    }
  });
}
});

test("setTheme is applied before first paint", async ({ page }) => {
  await setTheme(page, { dark: true, material: "solid", density: "compact" });
  await page.goto("/");
  const t = await readTheme(page);
  expect(t).toMatchObject({ dark: true, material: "solid", density: "compact" });
});

test("blocks index lists previews", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  expect((await blockPages(page)).length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("docs pages have no serious a11y violations", async ({ page }) => {
  for (const href of ["/", "/docs", "/docs/theming", "/docs/components", "/blocks"]) {
    await page.goto(href);
    expect(await seriousA11y(page), href).toEqual([]);
  }
});
