import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, onlyRestartNoise, openDocsPage, seriousA11y, waitForServer, stubExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Wave 1: overlays & feedback, form basics, navigation, data display, charts, fonts, sortable.
 * Each docs page renders its demo and every example without console errors or serious axe
 * violations, plus one key interaction per interactive component (real Chrome: portals,
 * focus return, keyboard maps that jsdom cannot prove).
 */

const PAGES: Record<string, string[]> = {
  // Overlays & feedback
  tooltip: ["shortcut", "sides", "disabled-trigger", "tones", "table-actions"],
  popover: ["trigger-width", "schedule", "loading", "nested"],
  "hover-card": ["entity", "mention"],
  "dropdown-menu": ["row-actions", "checkbox-radio", "submenu", "user-menu", "action-menu", "async-item"],
  "context-menu": ["grid", "shared-actions"],
  dialog: ["sizes", "scroll-body", "form-dirty", "submitting", "mobile", "nested"],
  "alert-dialog": ["danger", "use-confirm", "require-text", "async"],
  sheet: ["sides", "record-preview", "mobile-filters", "drawer"],
  toast: ["action-undo", "promise", "update-by-id"],
  alert: ["variants", "with-actions", "banner", "form-error"],
  progress: ["sizes-tones", "indeterminate", "quota", "upload-list", "circle"],
  "empty-state": ["no-results", "in-table", "forbidden", "error", "sizes"],
  // Form basics & foundations
  checkbox: ["indeterminate", "group", "card", "form", "states"],
  "radio-group": ["card", "segmented", "horizontal", "states"],
  switch: ["settings-row", "async", "table", "states"],
  slider: ["range", "marks", "commit", "states"],
  "button-group": ["split", "with-input", "pagination", "vertical", "toggle-group", "toolbar"],
  avatar: ["sizes", "status", "group", "locale-initials", "contact-list"],
  typography: ["text", "prose", "numeric", "page-header"],
  "font-picker": ["categories", "states", "inline", "pairings", "brand-settings", "provider"],
  // Navigation & layout
  accordion: ["variants", "side-panel", "persisted"],
  tabs: ["variants", "with-count", "segmented", "vertical", "url-sync", "link-tabs", "overflow"],
  breadcrumb: ["collapsed", "with-menu", "sizes", "compound", "website"],
  pagination: ["bar", "variants", "links", "cursor", "loading"],
  "navigation-menu": ["mega", "floating", "mobile"],
  stepper: ["vertical", "clickable", "states", "variants"],
  resizable: ["split-view", "nested", "collapsible"],
  "scroll-area": ["horizontal", "code", "in-panel"],
  // Data display
  item: ["leading", "actions", "selectable", "link-rows", "states"],
  table: ["density", "sticky", "numeric", "states", "empty"],
  stat: ["currency-compact", "intent", "target", "plain-grid", "delta", "states", "locale"],
  "description-list": ["grid", "copyable", "inline-edit", "groups", "states"],
  "activity-timeline": ["grouped", "steps", "with-body", "live", "load-more"],
  sparkline: ["in-table", "reference", "fluid"],
  sortable: ["grid", "multi-container", "move-menu", "horizontal", "states", "composable", "virtualized", "pointer-drag"],
  // Charts
  chart: ["chart-card", "config-tokens", "formatters", "states", "table-toggle", "legend-toggle", "drill-down", "raw-recharts"],
  "area-chart": ["stacked", "percent", "compare-period", "reference-line"],
  "bar-chart": ["grouped", "stacked", "horizontal", "negative", "highlight", "bar-list"],
  "line-chart": ["end-labels", "step"],
  "combo-chart": ["stacked", "end-axis-hidden"],
  "donut-chart": ["half", "others", "center-custom", "pie"],
  funnel: ["amount", "compare", "vertical"],
  gauge: ["ring", "thresholds", "target"],
  heatmap: ["matrix-hours", "diverging", "categorical"], // "calendar" is the demo
};

/** The demo preview at the top of the page (rendered before the Examples sections). */
const demo = (page: Page) => page.locator('main [role="tabpanel"]').first();
/** The live preview panel of one example section (not the Code tab). */
const preview = (page: Page, id: string) => page.locator(`section#${id} [role="tabpanel"]`).first();

/** Extra console noise to ignore on wave-1 pages (external requests are stubbed in beforeEach). */
const IGNORE: RegExp[] = [];

/**
 * Press and hold a key briefly. Radix radio groups and menus act on focus moves that happen in a
 * setTimeout after keydown and check that the key is still down; Playwright's press() releases
 * it in the same tick, which a real keyboard never does.
 */
async function hold(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}

/** Opens a docs page (200, h1, hydrated; survives a dev-server restart) and returns its console errors. */
const open = (page: Page, slug: string) => openDocsPage(page, slug, IGNORE);

test.describe("wave 1 — docs pages", () => {
  for (const [slug, examples] of Object.entries(PAGES)) {
    test(`${slug}: demo + every example render, no console errors, no serious axe`, async ({ page }) => {
      const check = async () => {
        const errors = await open(page, slug);
        await expect(demo(page), `${slug} demo`).toBeVisible();
        expect((await demo(page).innerHTML()).length, `${slug} demo is empty`).toBeGreaterThan(40);
        for (const id of examples) {
          const panel = preview(page, id);
          await expect(panel, `${slug}#${id}`).toBeVisible();
          expect((await panel.innerHTML()).length, `${slug}#${id} is empty`).toBeGreaterThan(40);
        }
        const axe = await seriousA11y(page);
        errors.stop();
        return { axe, errors: [...errors] };
      };
      let r = await check();
      // The dev server restarted while the page was open (only refused/aborted chunks): check again.
      if (onlyRestartNoise(r.errors)) {
        test.info().annotations.push({ type: "dev-server-restart", description: slug });
        await waitForServer(page);
        r = await check();
      }
      expect(r.axe, slug).toEqual([]);
      expect(r.errors, slug).toEqual([]);
    });
  }
});

test.describe("wave 1 — overlays", () => {
  test("tooltip: opens on keyboard focus, Esc hides it", async ({ page }) => {
    const errors = await open(page, "tooltip");
    const bold = demo(page).getByRole("button", { name: "Bold" });
    await bold.focus();
    const tip = page.getByRole("tooltip");
    await expect(tip).toContainText("Bold");
    await page.keyboard.press("Escape");
    await expect(tip).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("tooltip: a disabled trigger (server-rendered child) is wrapped and still explains itself", async ({ page }) => {
    const errors = await open(page, "tooltip");
    // In a production build the server-rendered Button reaches Tooltip without readable props;
    // Tooltip falls back to a DOM check. This test guards that path (it crashed the prerender).
    const wrapper = preview(page, "disabled-trigger").locator('[data-slot="tooltip-disabled-trigger"]');
    await expect(wrapper).toHaveCount(1);
    // Reach it with the keyboard (Radix opens on keyboard focus, not on a programmatic focus()).
    await wrapper.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(wrapper).toBeFocused();
    await expect(page.getByRole("tooltip")).toContainText("Add a featured image before publishing");
    expect(errors).toEqual([]);
  });

  test("popover: opens inside the preview scope, Esc closes and focus returns", async ({ page }) => {
    const errors = await open(page, "popover");
    const trigger = demo(page).getByRole("button", { name: "Add tag" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Tag contact" });
    await expect(dialog).toBeVisible();
    // Portalled into the preview's ThemeScope, so it follows the preview's theme toggle.
    await expect(demo(page).getByRole("dialog", { name: "Tag contact" })).toHaveCount(1);
    await dialog.getByRole("textbox", { name: "Tag name" }).fill("Enterprise");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("popover: follows the preview's own dark theme", async ({ page }) => {
    const errors = await open(page, "popover");
    const stage = page.locator(".preview-stage").first();
    const pageDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    await page.getByRole("button", { name: "Toggle theme in this preview" }).first().click();
    await expect(stage).toHaveClass(pageDark ? /\blight\b/ : /\bdark\b/);
    await demo(page).getByRole("button", { name: "Add tag" }).click();
    const dialog = page.getByRole("dialog", { name: "Tag contact" });
    await expect(dialog).toBeVisible();
    const inStage = await dialog.evaluate((el, cls) => !!el.closest(`.preview-stage.${cls}`), pageDark ? "light" : "dark");
    expect(inStage).toBe(true);
    expect(errors).toEqual([]);
  });

  test("glass surfaces actually blur (backdrop-filter survives the CSS build)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("vamos-theme", JSON.stringify({ material: "glass" })));
    await open(page, "popover");
    await demo(page).getByRole("button", { name: "Add tag" }).click();
    const dialog = page.getByRole("dialog", { name: "Tag contact" });
    await expect(dialog).toBeVisible();
    const filter = await dialog.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(filter).toContain("blur(");
  });

  test("hover card: opens on hover with the author bio", async ({ page }) => {
    const errors = await open(page, "hover-card");
    await demo(page).getByRole("link", { name: "Leyla Aksoy" }).hover();
    await expect(page.getByText("Food editor. Writes the weekly market report")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("dropdown menu: keyboard open, arrows, Esc returns focus, Enter activates", async ({ page }) => {
    const errors = await open(page, "dropdown-menu");
    const trigger = demo(page).getByRole("button", { name: "New" });
    await trigger.focus();
    await hold(page, "Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // Radix focuses the first item only while it believes the keyboard is in use; a synthetic
    // pointermove (layout shift under the resting mouse) can leave focus on the menu itself.
    // Home moves to the first item either way.
    await expect.poll(() => menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Home");
    await expect(page.getByRole("menuitem", { name: /^Post/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: /^Page/ })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("menuitem", { name: /^From template/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await hold(page, "ArrowDown");
    await expect(menu).toBeVisible();
    await expect.poll(() => menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Enter");
    await expect(menu).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("context menu: right-click opens, disabled item skipped, Esc closes", async ({ page }) => {
    const errors = await open(page, "context-menu");
    await demo(page).getByText("Right-click here").click({ button: "right" });
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Paste/ })).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("dialog: focus moves in, Tab is trapped, Esc closes and focus returns", async ({ page }) => {
    const errors = await open(page, "dialog");
    const trigger = demo(page).getByRole("button", { name: "New contact" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "New contact" });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 10; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    // Tabbing past the Close IconButton flashes its tooltip. It must close instantly, or it stays
    // the top dismissable layer and swallows this Esc (fixed in wave-1 QA).
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("dialog: the overlay covers the sticky site header", async ({ page }) => {
    await open(page, "dialog");
    await demo(page).getByRole("button", { name: "New contact" }).click();
    await expect(page.getByRole("dialog", { name: "New contact" })).toBeVisible();
    // The top-left corner sits on the header; with the dialog open the overlay must be on top.
    const onHeader = await page.evaluate(() => !!document.elementFromPoint(8, 8)?.closest("header"));
    expect(onHeader).toBe(false);
  });

  test("alert dialog (danger): initial focus on Cancel, Cancel closes", async ({ page }) => {
    const errors = await open(page, "alert-dialog");
    await preview(page, "danger").getByRole("button", { name: "Delete permanently" }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("sheet: opens from the end edge, Esc closes", async ({ page }) => {
    const errors = await open(page, "sheet");
    const trigger = demo(page).getByRole("button", { name: "Quick edit" });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Quick edit" });
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    expect(box!.x + box!.width).toBeGreaterThan(1200);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("toast: a success toast appears with its description", async ({ page }) => {
    const errors = await open(page, "toast");
    await demo(page).getByRole("button", { name: "Success" }).click();
    const toastEl = page.locator("[data-sonner-toast]").filter({ hasText: "Leave approved" });
    await expect(toastEl).toBeVisible();
    await expect(toastEl).toContainText("Elif Demir · Dec 22 – Dec 31");
    expect(errors).toEqual([]);
  });
});

test.describe("wave 1 — forms", () => {
  test("checkbox: click and Space toggle", async ({ page }) => {
    const errors = await open(page, "checkbox");
    const box = demo(page).getByRole("checkbox", { name: "Allow comments" });
    await expect(box).toBeChecked();
    await box.click();
    await expect(box).not.toBeChecked();
    await page.keyboard.press("Space");
    await expect(box).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("radio group: arrows move and select", async ({ page }) => {
    const errors = await open(page, "radio-group");
    const pub = demo(page).getByRole("radio", { name: /^Public/ });
    await expect(pub).toBeChecked();
    await pub.focus();
    await hold(page, "ArrowDown");
    const priv = demo(page).getByRole("radio", { name: /^Private/ });
    await expect(priv).toBeChecked();
    await expect(priv).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("switch: Space toggles", async ({ page }) => {
    const errors = await open(page, "switch");
    const sw = demo(page).getByRole("switch", { name: "Accept online bookings" });
    await expect(sw).toBeChecked();
    await sw.focus();
    await page.keyboard.press("Space");
    await expect(sw).not.toBeChecked();
    expect(errors).toEqual([]);
  });

  test("slider: arrows step, Home/End jump to the ends", async ({ page }) => {
    const errors = await open(page, "slider");
    const thumb = demo(page).getByRole("slider").first();
    await expect(thumb).toHaveAttribute("aria-valuenow", "60");
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    await expect(thumb).toHaveAttribute("aria-valuenow", "65");
    await page.keyboard.press("Home");
    await expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await page.keyboard.press("End");
    await expect(thumb).toHaveAttribute("aria-valuenow", "100");
    expect(errors).toEqual([]);
  });

  test("font picker: search, pick a family, trigger shows it", async ({ page }) => {
    const errors = await open(page, "font-picker");
    // The trigger is named by its Field label and shows the current family.
    const trigger = demo(page).getByRole("button", { name: "Heading font" });
    await expect(trigger).toContainText("Fraunces");
    // Other examples on the page render the inline list with the same search box: scope to the popover.
    const popover = page.getByRole("dialog", { name: "Fonts" });
    const search = popover.getByRole("combobox", { name: "Search fonts" });
    // On this heavy page the picker can hydrate after the docs tabs: a click that lands first is
    // lost, so click until the popover is open.
    await expect(async () => {
      if (!(await popover.isVisible())) await trigger.click();
      await expect(search).toBeFocused({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });
    await search.fill("lora");
    const option = popover.getByRole("option", { name: /^Lora/ });
    await expect(option).toBeVisible();
    await option.click();
    await expect(trigger).toContainText("Lora");
    expect(errors).toEqual([]);
  });
});

test.describe("wave 1 — navigation & layout", () => {
  test("accordion: opening another item closes the first (single)", async ({ page }) => {
    const errors = await open(page, "accordion");
    // defaultValue="item-1": the refunds question starts open.
    const refunds = demo(page).getByRole("button", { name: /refunds/ });
    const nonProfit = demo(page).getByRole("button", { name: /non-profits/ });
    await expect(refunds).toHaveAttribute("aria-expanded", "true");
    await expect(nonProfit).toHaveAttribute("aria-expanded", "false");
    await nonProfit.focus();
    await page.keyboard.press("Enter");
    await expect(nonProfit).toHaveAttribute("aria-expanded", "true");
    await expect(demo(page).getByText("Registered non-profits get 40% off")).toBeVisible();
    await expect(refunds).toHaveAttribute("aria-expanded", "false");
    expect(errors).toEqual([]);
  });

  test("tabs: arrows move selection, Home/End", async ({ page }) => {
    const errors = await open(page, "tabs");
    const activity = demo(page).getByRole("tab", { name: "Activity" });
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await activity.focus();
    await page.keyboard.press("ArrowRight");
    const deals = demo(page).getByRole("tab", { name: /Deals/ });
    await expect(deals).toHaveAttribute("aria-selected", "true");
    await expect(demo(page).getByText("4 open deals")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(demo(page).getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(errors).toEqual([]);
  });

  test("pagination: next page moves aria-current", async ({ page }) => {
    const errors = await open(page, "pagination");
    const nav = demo(page).getByRole("navigation");
    await expect(nav.locator('[aria-current="page"]')).toHaveText("6");
    await nav.getByRole("button", { name: /^Next/ }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("7");
    expect(errors).toEqual([]);
  });

  test("breadcrumb: last item is the current page", async ({ page }) => {
    const errors = await open(page, "breadcrumb");
    const nav = demo(page).getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav.locator('[aria-current="page"]')).toHaveText("Team");
    expect(errors).toEqual([]);
  });

  test("navigation menu: Solutions opens its panel", async ({ page }) => {
    const errors = await open(page, "navigation-menu");
    // Keyboard only: with the mouse resting on the trigger, hover intent would reopen it after Esc.
    const trigger = demo(page).getByRole("button", { name: "Solutions" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(demo(page).getByRole("link", { name: /Restaurants/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(demo(page).getByRole("link", { name: /Restaurants/ })).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("stepper: current step is announced", async ({ page }) => {
    const errors = await open(page, "stepper");
    await expect(demo(page).locator('[aria-current="step"]').first()).toContainText("Map columns");
    expect(errors).toEqual([]);
  });

  test("resizable: arrow keys resize the panels", async ({ page }) => {
    const errors = await open(page, "resizable");
    const handle = demo(page).getByRole("separator", { name: "Resize folders" });
    const before = Number(await handle.getAttribute("aria-valuenow"));
    await handle.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(async () => Number(await handle.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
    expect(errors).toEqual([]);
  });
});

test.describe("wave 1 — data & charts", () => {
  test("sortable: keyboard pick up, move, drop reorders the list", async ({ page }) => {
    const errors = await open(page, "sortable");
    const handle = demo(page).getByRole("button", { name: "Reorder Services" });
    await handle.focus();
    // dnd-kit's keyboard sensor measures between steps: wait for each announcement before the next
    // key (fixed sleeps missed the pick-up under parallel load).
    const live = (text: string) => page.locator("[aria-live]").filter({ hasText: text });
    await hold(page, "Space");
    await expect(live("Picked up Services.")).toHaveCount(1);
    await hold(page, "ArrowDown");
    await expect(live("Services moved to position 3 of 6.")).toHaveCount(1);
    await hold(page, "Space");
    await expect(page.locator("[aria-live]").filter({ hasText: "Services dropped at position 3 of 6." })).toHaveCount(1);
    const order = await demo(page).locator("li").allTextContents();
    expect(order.findIndex((t) => t.startsWith("Services"))).toBeGreaterThan(order.findIndex((t) => t.startsWith("Case studies")));
    expect(errors).toEqual([]);
  });

  test("chart: table toggle shows the data as a table", async ({ page }) => {
    const errors = await open(page, "chart");
    const panel = preview(page, "table-toggle");
    const toggle = panel.getByRole("button", { name: "View as table" });
    await toggle.click();
    await expect(panel.getByRole("table")).toBeVisible();
    await expect(panel.getByRole("button", { name: "View as chart" })).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });
});

test("fonts page: renders, no console errors", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const res = await page.goto("/docs/fonts");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  errors.stop();
  expect(errors).toEqual([]);
});
