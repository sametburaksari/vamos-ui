import { test, expect, type Page } from "@playwright/test";
import { onlyRestartNoise, openDocsPage, seriousA11y, waitForServer, stubExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Wave 2: selects & pickers, dates, advanced inputs, data table + filters, shell & navigation,
 * command & notifications, media, blocks API. Each docs page renders its demo and every example
 * without console errors or serious axe violations, plus one key interaction per interactive
 * component (real Chrome: portals, focus return, keyboard maps that jsdom cannot prove).
 */

const PAGES: Record<string, string[]> = {
  // Selects & pickers
  select: ["groups", "rich-items", "clearable", "states", "composed", "native", "form"],
  combobox: ["multiple", "async", "creatable", "locale-search", "rich-items", "inline"],
  "tag-input": ["suggestions", "emails", "max", "paste", "states"],
  "input-otp": ["groups", "auto-submit"],
  "color-picker": ["swatches", "alpha", "contrast", "inline", "states"],
  "record-picker": ["multiple", "create", "browse", "card", "initial-values", "states"],
  "user-picker": ["avatars", "teams", "me", "inline"],
  "status-picker": ["transitions", "confirm", "async", "field"],
  "tree-select": ["multiple", "lazy", "search", "inline"],
  "tree-view": ["checkbox", "lazy", "filter", "virtual", "sidebar"],
  // Dates
  "date-picker": ["button-trigger", "min-max", "natural-input", "dropdown-caption", "date-time", "form", "states"],
  "date-range-picker": ["apply", "limits", "custom-presets", "input", "states"],
  "time-picker": ["slots", "twelve-hour", "range", "states"],
  calendar: ["booking", "range-with-absences", "activity", "holidays", "year", "week-numbers"],
  // Advanced inputs
  "formatted-input": ["currency", "number", "phone", "iban", "national-id", "mask", "states", "form"],
  "address-field": ["multi-country", "compact", "region-select", "read-only"],
  "slug-input": ["field", "unique", "locales", "states"],
  "file-upload": ["button", "image", "restrictions", "existing", "form"],
  "signature-pad": ["form", "read-only"],
  // Data
  "data-table": ["server-mode", "filters-views", "inline-edit", "columns", "virtual", "mobile", "states", "headless"],
  "filter-bar": ["quick-facets", "async-options", "relative-dates", "board", "states"],
  "saved-views": ["team-scope", "select-variant", "with-data-table"],
  // Shell, navigation, command
  "app-shell": ["multi-app", "workspaces", "mobile", "next-router", "topnav"],
  sidebar: ["composed", "collapsed", "nested", "badges", "permissions", "surface"],
  "top-bar": ["with-breadcrumb", "mobile", "user-menu"],
  "page-header": ["with-breadcrumb", "record", "with-tabs", "sizes", "loading"],
  command: ["dialog", "register", "async-source", "nested-pages", "locale-search"],
  "notification-center": ["inline-actions", "live", "page", "multi-app"],
  // Media
  image: ["aspect", "focal-point", "placeholder", "loader", "next", "figure", "error"],
  carousel: ["hero", "gallery-thumbs", "responsive", "vertical", "marquee", "controlled", "use-carousel"],
  gallery: ["masonry", "justified", "captions", "editable", "responsive-columns"],
  lightbox: ["zoom", "video", "controlled", "info-panel"],
  "video-player": ["captions", "youtube-lite", "background", "hls"],
  "link-previews": ["search-desktop-mobile", "social-cards", "fallbacks", "length-meter"],
  "image-cropper": ["avatar", "presets", "save-copy"],
  // Blocks
  "blocks-api": ["json-page", "section-theme", "localized", "define-block", "heading-emphasis", "rich-text", "lint", "json-schema"],
};

/** The demo preview at the top of the page (rendered before the Examples sections). */
const demo = (page: Page) => page.locator('main [role="tabpanel"]').first();
/** The live preview panel of one example section (not the Code tab). */
const preview = (page: Page, id: string) => page.locator(`section#${id} [role="tabpanel"]`).first();

/** Extra console noise to ignore on wave-2 pages (external requests are stubbed in beforeEach). */
const IGNORE: RegExp[] = [];

/** Press and hold a key briefly (Radix acts on focus moves in a setTimeout after keydown). */
async function hold(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}

/** Opens a docs page (200, h1, hydrated; survives a dev-server restart) and returns its console errors. */
const open = (page: Page, slug: string) => openDocsPage(page, slug, IGNORE);

test.describe("wave 2 — docs pages", () => {
  for (const [slug, examples] of Object.entries(PAGES)) {
    test(`${slug}: demo + every example render, no console errors, no serious axe`, async ({ page }) => {
      test.setTimeout(120_000);
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

test.describe("wave 2 — selects & pickers", () => {
  test("select: keyboard opens, arrows move, Enter selects, focus returns", async ({ page }) => {
    const errors = await open(page, "select");
    const trigger = demo(page).getByRole("combobox", { name: "Status" });
    await expect(trigger).toHaveText(/Draft/);
    await trigger.focus();
    await hold(page, "ArrowDown");
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    await expect(page.getByRole("option", { name: "Draft" })).toHaveAttribute("aria-selected", "true");
    await hold(page, "ArrowDown");
    await expect(page.getByRole("option", { name: "In review" })).toBeFocused();
    await hold(page, "Enter");
    await expect(list).toHaveCount(0);
    await expect(trigger).toHaveText(/In review/);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("combobox: typing a keyword filters, Enter picks it", async ({ page }) => {
    const errors = await open(page, "combobox");
    const trigger = demo(page).getByRole("combobox", { name: "Billing country" });
    await trigger.click();
    const search = page.getByPlaceholder("Search countries…");
    await expect(search).toBeFocused();
    // Other examples on the page render inline lists: scope to the list this input controls.
    const list = page.locator(`[id="${await search.getAttribute("aria-controls")}"]`);
    // "Deutschland" is a keyword of Germany, not its label.
    await search.fill("deutsch");
    await expect(list.getByRole("option")).toHaveCount(1);
    await expect(list.getByRole("option", { name: "Germany" })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveText(/Germany/);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("tag input: Enter and comma add, Backspace on empty input removes the last tag", async ({ page }) => {
    const errors = await open(page, "tag-input");
    const input = demo(page).getByRole("textbox", { name: "Tags" });
    const tags = demo(page).getByRole("list", { name: "Tags" }).getByRole("listitem");
    await expect(tags).toHaveCount(2);
    await input.fill("Pricing");
    await page.keyboard.press("Enter");
    await input.pressSequentially("Retail,");
    await expect(tags).toHaveCount(4);
    await expect(tags.nth(3)).toContainText("Retail");
    await expect(input).toHaveValue("");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await expect(tags).toHaveCount(3);
    expect(errors).toEqual([]);
  });

  test("input OTP: typing fills the code; one-time-code autocomplete", async ({ page }) => {
    const errors = await open(page, "input-otp");
    const input = demo(page).getByRole("textbox", { name: "Verification code" });
    await expect(input).toHaveAttribute("autocomplete", "one-time-code");
    await input.click();
    await page.keyboard.type("482915");
    await expect(input).toHaveValue("482915");
    await page.keyboard.press("Backspace");
    await expect(input).toHaveValue("48291");
    expect(errors).toEqual([]);
  });

  test("color picker: opens a dialog, a typed hex value updates the trigger", async ({ page }) => {
    const errors = await open(page, "color-picker");
    const trigger = demo(page).getByRole("button", { name: "Brand color" });
    await expect(trigger).toContainText("#2f6fd6");
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Pick a color" });
    await expect(dialog).toBeVisible();
    const value = dialog.getByRole("textbox", { name: "Color value" });
    await value.fill("#16a34a");
    await value.press("Enter");
    await expect(trigger).toContainText(/#16a34a/i);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("record picker: async search, pick a company", async ({ page }) => {
    const errors = await open(page, "record-picker");
    const trigger = demo(page).getByRole("button", { name: "Company" });
    await trigger.click();
    const search = page.getByRole("combobox", { name: "Search companies…" });
    await expect(search).toBeFocused();
    await search.fill("roast");
    const option = page.getByRole("option", { name: /Kadıköy Roasters/ });
    await expect(option).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText("Kadıköy Roasters");
    expect(errors).toEqual([]);
  });

  test("user picker: deactivated people are listed but disabled; pick someone else", async ({ page }) => {
    const errors = await open(page, "user-picker");
    const trigger = demo(page).getByRole("button", { name: "Assignee" });
    await expect(trigger).toContainText("Priya Raman");
    await trigger.click();
    await expect(page.getByRole("option", { name: /Jonas Weber/ })).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("option", { name: /Tom Hollis/ }).click();
    await expect(trigger).toContainText("Tom Hollis");
    expect(errors).toEqual([]);
  });

  test("status picker: change a task's status from the list", async ({ page }) => {
    const errors = await open(page, "status-picker");
    const trigger = demo(page).getByRole("combobox", { name: "Status: To do. Change" });
    await trigger.click();
    await page.getByRole("option", { name: /^In progress/ }).click();
    await expect(demo(page).getByRole("combobox", { name: "Status: In progress. Change" })).toHaveCount(2);
    expect(errors).toEqual([]);
  });

  test("tree select: search finds a nested category and picks it", async ({ page }) => {
    const errors = await open(page, "tree-select");
    const trigger = demo(page).getByRole("button", { name: "Category" });
    await expect(trigger).toContainText("Espresso machines");
    await trigger.click();
    await page.getByPlaceholder("Search categories…").fill("monit");
    await page.getByRole("treeitem", { name: /Monitors/ }).click();
    await expect(trigger).toContainText("Monitors");
    expect(errors).toEqual([]);
  });

  test("tree view: arrows move, ← collapses, → expands (APG tree)", async ({ page }) => {
    const errors = await open(page, "tree-view");
    const tree = demo(page).getByRole("tree", { name: "Site pages" });
    const careers = tree.getByRole("treeitem", { name: /^Careers/ });
    await expect(careers).toHaveAttribute("aria-selected", "true");
    await expect(careers).toHaveAttribute("aria-level", "2");
    await careers.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(careers).toHaveAttribute("aria-expanded", "false");
    await expect(tree.getByRole("treeitem", { name: /^Frontend engineer/ })).toHaveCount(0);
    await page.keyboard.press("ArrowRight");
    await expect(careers).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await expect(tree.getByRole("treeitem", { name: /^Frontend engineer/ })).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 2 — dates", () => {
  test("date picker: calendar opens on the value, arrows + Enter pick a day, Esc-free close", async ({ page }) => {
    const errors = await open(page, "date-picker");
    await demo(page).getByRole("button", { name: "Open calendar" }).click();
    const selected = page.getByRole("button", { name: /December 4, 2026, selected/ });
    await expect(selected).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: /December 5, 2026/ })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(demo(page).getByText("value: 2026-12-05")).toBeVisible();
    await expect(demo(page).getByRole("textbox", { name: "Invoice due date" })).toHaveValue("12/05/2026");
    expect(errors).toEqual([]);
  });

  test("date picker: typed natural input is parsed to YYYY-MM-DD", async ({ page }) => {
    const errors = await open(page, "date-picker");
    const input = demo(page).getByRole("textbox", { name: "Invoice due date" });
    await input.fill("01/15/2027");
    await input.press("Tab");
    await expect(demo(page).getByText("value: 2027-01-15")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("date range picker: a preset sets the range", async ({ page }) => {
    const errors = await open(page, "date-range-picker");
    const trigger = demo(page).getByRole("button", { name: /^Report period/ });
    await trigger.click();
    await page.getByRole("option", { name: "Last 7 days" }).click();
    await expect(demo(page).getByText(/\(7 days\)/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("time picker: ↑ on the hour segment steps the value", async ({ page }) => {
    const errors = await open(page, "time-picker");
    const hour = demo(page).getByRole("spinbutton", { name: "Hour" });
    await hour.focus();
    await page.keyboard.press("ArrowUp");
    await expect(hour).toHaveAttribute("aria-valuenow", "15");
    await expect(demo(page).getByText("value: 15:30")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("calendar: clicking a day selects it; arrows move by day and week", async ({ page }) => {
    const errors = await open(page, "calendar");
    const grid = demo(page).getByRole("grid", { name: "November 2026" });
    await grid.getByRole("button", { name: /November 12, 2026/ }).click();
    await expect(demo(page).getByRole("heading", { name: "1 scheduled" })).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(grid.getByRole("button", { name: /November 19, 2026/ })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(grid.getByRole("button", { name: /November 18, 2026/ })).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 2 — inputs", () => {
  test("formatted input: currency formats on blur, value stays a decimal", async ({ page }) => {
    const errors = await open(page, "formatted-input");
    const total = demo(page).getByRole("textbox", { name: "Invoice total" });
    await expect(total).toHaveValue("4,280.00");
    await total.fill("12500.5");
    await total.press("Tab");
    await expect(total).toHaveValue("12,500.50");
    expect(errors).toEqual([]);
  });

  test("address field: picking a province loads its districts", async ({ page }) => {
    const errors = await open(page, "address-field");
    const group = demo(page).getByRole("group", { name: "Shipping address" });
    const province = group.getByRole("combobox", { name: /^Province/ });
    const district = group.getByRole("combobox", { name: /^District/ });
    await province.selectOption({ label: "İstanbul" });
    await expect.poll(() => district.locator("option").count()).toBeGreaterThan(10);
    await district.selectOption({ label: "Kadıköy" });
    await expect(district).toHaveValue("Kadıköy");
    expect(errors).toEqual([]);
  });

  test("slug input: follows the title until edited", async ({ page }) => {
    const errors = await open(page, "slug-input");
    const title = demo(page).getByRole("textbox", { name: "Title" });
    await title.fill("Çağrı İş & Ölçüm");
    await expect(demo(page).getByRole("link", { name: /journal\/cagri-is-and-olcum$/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("file upload: a chosen file uploads and is announced", async ({ page }) => {
    const errors = await open(page, "file-upload");
    const input = demo(page).locator('input[type="file"]');
    await input.setInputFiles({ name: "signed-contract.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 test") });
    await expect(demo(page).getByText("signed-contract.pdf")).toBeVisible();
    await expect(demo(page).getByText("Uploaded", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[aria-live]").filter({ hasText: "signed-contract.pdf uploaded" })).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("signature pad: Type mode signs with the keyboard", async ({ page }) => {
    const errors = await open(page, "signature-pad");
    const group = demo(page).getByRole("group", { name: "Received by" });
    await group.getByRole("tab", { name: "Type" }).click();
    await group.getByRole("textbox", { name: "Full name" }).fill("Deniz Arslan");
    await expect(group.getByRole("button", { name: "Clear" })).toBeEnabled();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 2 — data", () => {
  test("data table: sort header sets aria-sort; selecting rows shows the bulk bar", async ({ page }) => {
    const errors = await open(page, "data-table");
    const table = demo(page).getByRole("table", { name: "Posts" });
    await table.getByRole("button", { name: "Sort by Title" }).click();
    await expect(table.getByRole("columnheader", { name: /^Sort by Title/ })).toHaveAttribute("aria-sort", /ascending|descending/);
    const rowBoxes = table.getByRole("checkbox", { name: /^Select / });
    await rowBoxes.nth(1).check();
    await rowBoxes.nth(2).check();
    await expect(demo(page).getByText(/2 selected/).first()).toBeVisible();
    await expect(demo(page).getByRole("button", { name: /Publish/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("filter bar: removing a filter updates the result count", async ({ page }) => {
    const errors = await open(page, "filter-bar");
    await expect(demo(page).getByText("88 of 400 deals match.")).toBeVisible();
    await demo(page).getByRole("button", { name: "Remove filter Deal value" }).click();
    await expect(demo(page).getByText("88 of 400 deals match.")).toHaveCount(0);
    await expect(demo(page).getByRole("button", { name: "Remove filter Deal value" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("saved views: picking a view swaps the filters", async ({ page }) => {
    const errors = await open(page, "saved-views");
    const tabs = demo(page).getByRole("tablist", { name: "Views" });
    await tabs.getByRole("tab", { name: /^Hot leads/ }).click();
    await expect(tabs.getByRole("tab", { name: /^Hot leads/ })).toHaveAttribute("aria-selected", "true");
    await expect(demo(page).getByRole("button", { name: /^Deal value at least/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 2 — shell & command", () => {
  test("sidebar: collapse button toggles the rail", async ({ page }) => {
    const errors = await open(page, "sidebar");
    const toggle = demo(page).getByRole("button", { name: /Collapse|Expand/ }).last();
    const before = await toggle.getAttribute("aria-expanded");
    await toggle.click();
    await expect(toggle).not.toHaveAttribute("aria-expanded", before ?? "");
    expect(errors).toEqual([]);
  });

  test("sidebar: app switcher opens the app list", async ({ page }) => {
    const errors = await open(page, "sidebar");
    await demo(page).getByRole("button", { name: "Switch app, current: Site" }).click();
    await expect(page.getByRole("dialog", { name: "Apps" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Apps" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("top bar: account menu opens from the keyboard, Esc returns focus", async ({ page }) => {
    const errors = await open(page, "top-bar");
    const trigger = demo(page).getByRole("button", { name: "Account menu for Ada Lovelace" });
    await trigger.focus();
    await hold(page, "Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("app shell: in the narrow preview the menu opens as a sheet and a link changes the route", async ({ page }) => {
    const errors = await open(page, "app-shell");
    const main = demo(page).getByRole("main");
    await expect(main.getByRole("code")).toHaveText("/site");
    const menu = demo(page).getByRole("button", { name: "Open menu" });
    await menu.click();
    const sheet = page.getByRole("dialog", { name: "Navigation" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    await sheet.getByRole("link", { name: "Posts", exact: true }).click();
    await expect(main.getByRole("code")).toHaveText("/site/posts");
    expect(errors).toEqual([]);
  });

  test("command: typing filters (folded), Enter runs the active item", async ({ page }) => {
    const errors = await open(page, "command");
    const input = demo(page).getByRole("combobox", { name: "Command palette" });
    // Matches labels, keywords and descriptions ("Posts · Content"). Typing that lands before the
    // palette hydrates is lost, so retype until the list filters.
    await expect(async () => {
      await input.fill("cont");
      await expect(demo(page).getByRole("option")).toHaveCount(3, { timeout: 2_000 });
    }).toPass({ timeout: 20_000 });
    await expect(demo(page).getByRole("option", { name: /^Upload media/ })).toHaveCount(0);
    await expect(demo(page).getByRole("option", { name: /^New contact/ })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(demo(page).getByRole("option", { name: /^New contact/ })).toHaveAttribute("aria-selected", "false");
    await input.fill("zzzz");
    await expect(demo(page).getByRole("option")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("command palette: ⌘K / Ctrl+K opens it as a dialog", async ({ page }) => {
    const errors = await open(page, "command");
    await page.locator("body").click({ position: { x: 5, y: 300 } });
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog").filter({ has: page.getByRole("combobox") });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("notification center: opens the inbox, mark as read lowers the count", async ({ page }) => {
    const errors = await open(page, "notification-center");
    const trigger = demo(page).getByRole("button", { name: "Notifications, 4 unread" });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: /Notifications/ });
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: /Mark as read/ }).first().click();
    await expect(demo(page).getByRole("button", { name: "Notifications, 3 unread" })).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("wave 2 — media", () => {
  test("lightbox: opens on the clicked photo, → browses, Esc closes and focus returns", async ({ page }) => {
    const errors = await open(page, "lightbox");
    const trigger = demo(page).getByRole("button", { name: "Enlarge image: Reception with a wooden counter" });
    await trigger.click();
    const viewer = page.getByRole("dialog", { name: /Image viewer|Reception/ });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/Image 2 of 4/).first()).toBeAttached();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText(/Image 3 of 4/).first()).toBeAttached();
    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("gallery: a tile opens the lightbox", async ({ page }) => {
    const errors = await open(page, "gallery");
    await demo(page).getByRole("button", { name: /^Enlarge image: Wood-fired pizza/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/Image 5 of/).first()).toBeAttached();
    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("carousel: slides are labelled groups; a dot moves to another slide", async ({ page }) => {
    const errors = await open(page, "carousel");
    const region = demo(page).getByRole("region", { name: "Featured stays" });
    await expect(region.getByRole("group", { name: "1 of 5" })).toBeAttached();
    const dots = demo(page).getByRole("group", { name: "Choose slide" }).getByRole("button", { name: /^Go to slide/ });
    // The dots appear once the carousel engine has measured the slides.
    await expect(dots.nth(1)).toBeVisible();
    await dots.last().click();
    await expect(dots.last()).toHaveAttribute("aria-current", /true|step/);
    expect(errors).toEqual([]);
  });

  test("video player: the facade turns into the player with named controls", async ({ page }) => {
    const errors = await open(page, "video-player");
    const group = demo(page).getByRole("group", { name: /^Video player/ });
    await group.getByRole("button", { name: /^Play video/ }).click();
    await expect(group.getByRole("button", { name: /^(Pause|Play)$/ })).toBeVisible();
    await expect(group.getByRole("slider", { name: "Seek" })).toBeVisible();
    await group.getByRole("button", { name: "Mute" }).click();
    await expect(group.getByRole("button", { name: "Unmute" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("image cropper: arrow keys move the crop and report a new rect", async ({ page }) => {
    // The external-request stub answers images with a 1×1 PNG: nothing to crop. Serve a real-size one.
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067"><rect width="1600" height="1067" fill="#8a9"/></svg>';
    await page.route(/images\.unsplash\.com\/photo-1600596542815/, (r) => r.fulfill({ contentType: "image/svg+xml", body: svg }));
    const errors = await open(page, "image-cropper");
    const area = demo(page).getByRole("application", { name: "Crop area" });
    const out = demo(page).getByText(/^crops\.og = /);
    const before = await out.textContent();
    await demo(page).getByRole("button", { name: "Zoom in" }).click();
    await area.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => out.textContent()).not.toBe(before);
    await demo(page).getByRole("button", { name: "Square 1:1" }).click();
    await expect(demo(page).getByRole("button", { name: "Square 1:1" })).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });

  test("link previews: tabs switch between search and social cards", async ({ page }) => {
    const errors = await open(page, "link-previews");
    const tabs = demo(page).getByRole("tablist", { name: "Preview" });
    await tabs.getByRole("tab", { name: "Facebook" }).click();
    await expect(tabs.getByRole("tab", { name: "Facebook" })).toHaveAttribute("aria-selected", "true");
    await expect(demo(page).getByRole("figure", { name: /Facebook link preview/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
