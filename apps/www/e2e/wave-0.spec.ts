import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, seriousA11y, stubExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Wave 0 (foundations): Kbd, Separator, Spinner, Skeleton, Input/Textarea/Field, Button, Badge, Card.
 * Each docs page renders every example without console errors or serious axe violations,
 * plus one key interaction per interactive component.
 */

const PAGES: Record<string, string[]> = {
  kbd: ["platform", "sizes", "in-menu", "search-hint", "help-sheet"],
  separator: ["label", "toolbar", "tones"],
  spinner: ["inline", "refresh", "button"],
  skeleton: ["text", "list", "table", "loading-state"],
  input: ["field", "sizes", "adornments", "clearable", "count", "states", "layouts", "textarea"],
  button: ["variants", "sizes", "with-icon", "icon-button", "loading", "as-link", "as-link-disabled", "pill"],
  badge: ["tones", "status", "removable", "count", "custom-color", "as-link"],
  card: ["stat", "composition", "variants", "interactive-link", "loading", "nested-inset"],
};

/** The live preview panel of one example section (not the Code tab). */
const preview = (page: Page, id: string) => page.locator(`section#${id} [role="tabpanel"]`).first();

async function open(page: Page, slug: string) {
  const errors = collectConsoleErrors(page);
  const res = await page.goto(`/docs/components/${slug}`, { waitUntil: "load" });
  expect(res?.status(), slug).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  return errors;
}

test.describe("wave 0 — docs pages", () => {
  for (const [slug, examples] of Object.entries(PAGES)) {
    test(`${slug}: every example renders, no console errors, no serious axe`, async ({ page }) => {
      const errors = await open(page, slug);
      for (const id of examples) {
        const panel = preview(page, id);
        await expect(panel, `${slug}#${id}`).toBeVisible();
        // The example produced real content, not an empty frame.
        expect((await panel.innerHTML()).length, `${slug}#${id} is empty`).toBeGreaterThan(40);
      }
      expect(await seriousA11y(page), slug).toEqual([]);
      errors.stop();
      expect(errors, slug).toEqual([]);
    });
  }
});

test.describe("wave 0 — interactions", () => {
  test("input: typing, clear button, Esc clears, count updates", async ({ page }) => {
    const errors = await open(page, "input");

    const search = preview(page, "clearable").getByRole("textbox", { name: "Search contacts" });
    await expect(search).toHaveValue("Ayşe");
    await preview(page, "clearable").getByRole("button", { name: "Clear" }).click();
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    await search.fill("Mehmet");
    await expect(preview(page, "clearable").getByRole("button", { name: "Clear" })).toBeVisible();
    await search.press("Escape");
    await expect(search).toHaveValue("");

    const seo = preview(page, "count").getByRole("textbox", { name: "SEO title" });
    const before = (await seo.inputValue()).length;
    await expect(preview(page, "count")).toContainText(`${before}`);
    await seo.press("End");
    await seo.pressSequentially(" now");
    const after = (await seo.inputValue()).length;
    expect(after).toBe(Math.min(before + 4, 60));
    await expect(preview(page, "count")).toContainText(`${after}`);

    // Field: label points at the control and the hint is in aria-describedby.
    const field = preview(page, "field").getByRole("textbox").first();
    await expect(field).toHaveAttribute("id", /.+/);
    const id = await field.getAttribute("id");
    await expect(preview(page, "field").locator(`label[for="${id}"]`)).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test("badge: removable chip by click and by keyboard", async ({ page }) => {
    const errors = await open(page, "badge");
    const panel = preview(page, "removable");
    await panel.getByRole("button", { name: /Remove Brunch/ }).click();
    await expect(panel).not.toContainText("Brunch");
    const vegan = panel.getByRole("button", { name: /Remove Vegan/ });
    await vegan.focus();
    await page.keyboard.press("Enter");
    await expect(panel).not.toContainText("Vegan");
    // Count badges cap at max ("99+").
    await expect(preview(page, "count")).toContainText("99+");
    expect(errors).toEqual([]);
  });

  test("button: loading is busy + disabled; disabled link leaves tab order", async ({ page }) => {
    const errors = await open(page, "button");
    const loading = preview(page, "loading");
    const busy = loading.locator('[aria-busy="true"]');
    expect(await busy.count()).toBeGreaterThanOrEqual(3);
    await expect(busy.first()).toBeDisabled();
    await expect(loading).toContainText("Publishing…");

    const links = preview(page, "as-link-disabled").getByRole("link");
    await expect(links).toHaveCount(2);
    for (const l of await links.all()) {
      await expect(l).toHaveAttribute("aria-disabled", "true");
      await expect(l).toHaveAttribute("tabindex", "-1");
    }
    // Keyboard: Enter on an enabled button activates it (focus visible + no error).
    const first = preview(page, "variants").getByRole("button").first();
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Enter");
    expect(errors).toEqual([]);
  });

  test("skeleton: loading → content toggles aria-busy", async ({ page }) => {
    const errors = await open(page, "skeleton");
    const panel = preview(page, "loading-state");
    const group = panel.locator('[data-slot="skeleton-group"]');
    await expect(group).toHaveAttribute("aria-busy", "true");
    await panel.getByRole("button", { name: "Show content" }).click();
    await expect(group).not.toHaveAttribute("aria-busy", "true");
    await expect(panel).toContainText("Twelve new dishes");
    await panel.getByRole("button", { name: "Show loading" }).click();
    await expect(group).toHaveAttribute("aria-busy", "true");
    expect(errors).toEqual([]);
  });

  test("card: interactive card is one keyboard-reachable link", async ({ page }) => {
    const errors = await open(page, "card");
    const panel = preview(page, "interactive-link");
    const links = panel.getByRole("link");
    await expect(links).toHaveCount(2);
    await expect(links.first()).toHaveAttribute("data-slot", "card");
    await expect(links.first()).toHaveAttribute("href", /\/docs\/components\/card/);
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    await expect(preview(page, "loading").locator('[aria-busy="true"]').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("kbd: mod resolves to the platform after hydration", async ({ page }) => {
    const errors = await open(page, "kbd");
    const isMac = await page.evaluate(() => /Mac|iPhone|iPad/.test(navigator.platform));
    const demo = page.locator("kbd").first();
    await expect(demo).toBeVisible();
    await expect(page.locator("main")).toContainText(isMac ? "⌘" : "Ctrl");
    expect(errors).toEqual([]);
  });

  test("separator and spinner semantics", async ({ page }) => {
    let errors = await open(page, "separator");
    const seps = preview(page, "label").locator('[data-slot="separator"], [role="separator"], hr');
    expect(await seps.count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    errors.stop();

    errors = await open(page, "spinner");
    await expect(page.getByRole("status").first()).toBeAttached();
    expect(errors).toEqual([]);
  });
});

test("blocks: Field ids hydrate when client chunks arrive late", async ({ page }) => {
  // Regression: random chunk latency made useId-based Field ids hydrate differently (login-01, dashboard-01).
  const errors = collectConsoleErrors(page);
  await page.route(/\/_next\/static\/chunks\/.*\.js/, async (route) => {
    await new Promise((r) => setTimeout(r, Math.random() * 400));
    await route.continue();
  });
  for (const href of ["/view/login-01", "/view/dashboard-01"]) {
    await page.goto(href, { waitUntil: "load" });
    await expect(page.getByRole("textbox").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
