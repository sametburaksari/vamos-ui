import { test, expect, type Page } from "@playwright/test";
import { onlyRestartNoise, openDocsPage, seriousA11y, waitForServer, stubExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Wave 3: business flows (line items, wizards, approvals, import/export, permissions), drag and
 * drop (kanban, sortable tree, hierarchy chart), scheduler/gantt/time tracking, page layouts,
 * data display (comments, attachments, audit log, versions, tasks, entity cards), media library,
 * the block editor and the site blocks. Each docs page renders its demo and every example without
 * console errors or serious axe violations, plus one key interaction per interactive component.
 */

const PAGES: Record<string, string[]> = {
  // Flows & business
  "line-items": ["tr-kdv", "tax-inclusive", "discounts", "item-picker", "read-only", "mobile"],
  "multi-step-form": ["conditional", "dialog", "draft", "vertical"],
  "approval-flow": ["parallel", "conditional", "actions", "compact"],
  "import-wizard": ["validation", "templates", "encoding"],
  export: ["xlsx", "background-job", "personal-data", "locale-csv"],
  "setup-checklist": ["sidebar", "locked", "dismiss", "states"],
  "permission-matrix": ["scoped", "inherited", "compare", "diff", "plans"],
  // Drag and drop
  kanban: ["content-workflow", "swimlanes", "rules", "with-filter-bar", "virtualized", "states"],
  "sortable-list": ["list", "grid", "category-tree", "territories"],
  "hierarchy-chart": ["partner-network", "reparent", "list-view", "large", "export"],
  // Calendar & time
  scheduler: ["month", "drag", "business-hours", "list", "publishing", "time-zone"],
  "resource-calendar": ["absences", "rules", "hours", "codes", "virtual"],
  gantt: ["dependencies", "scales", "read-only", "large"],
  "time-tracker": ["timesheet", "to-line-items", "attendance", "parse-duration"],
  // Page layouts
  "list-layout": ["states", "bulk", "grid", "mobile"],
  "record-detail-layout": ["resizable", "pager", "responsive", "states"],
  "editor-layout": ["save-status", "panel-tabs", "focus-mode", "mobile"],
  "settings-layout": ["save-bar", "split", "danger-zone", "states"],
  // Data display
  "entity-card": ["organization", "product", "header", "chip-hover", "compact"],
  "comment-thread": ["mentions", "attachments", "optimistic", "resolve", "compact"],
  "attachment-list": ["grid", "upload-states", "chips"],
  "audit-log": ["event-detail", "server-mode", "record-scope"],
  "version-history": ["text-diff", "field-diff", "large-diff"],
  "task-list": ["checklist", "subtasks", "reorder"],
  // Media
  "media-library": ["list-view", "folders", "bulk", "filters", "upload-queue", "readonly", "empty"],
  "media-picker": ["multiple", "imperative", "url-tab", "require-alt"],
  "image-field": ["avatar", "social-image", "focal-point", "crop-modes", "in-form"],
  // Editor
  "block-editor": ["rich-text", "custom-block", "inspector", "allowed-blocks", "render", "paste", "readonly"],
  // Site blocks
  "announcement-bar": ["dismissible", "warning", "scheduled"],
  navbar: ["split-restaurant", "minimal-overlay", "rail-saas", "mega"],
  hero: ["split-media-spa", "full-bleed-restaurant", "product-saas", "statement", "font-presets"],
  "page-intro": ["with-media", "ruled"],
  "feature-grid": ["grid-icons", "tabs-saas", "sticky-media"],
  "media-text": ["overlap", "bleed-video", "alternating"],
  "rich-text-section": ["aside-heading", "two-column"],
  "stats-band": ["with-text", "ledger", "locale-tr"],
  steps: ["horizontal", "split"],
  "logo-strip": ["marquee", "grid"],
  testimonials: ["wall", "carousel", "reviews"],
  team: ["list-hover", "feature-founder"],
  "gallery-section": ["filmstrip", "grid-lightbox", "split-caption"],
  "menu-list": ["photo", "service-list-spa", "qr-page"],
  "pricing-table": ["rows-agency", "single", "quote-only"],
  "comparison-table": ["versus", "mobile"],
  faq: ["stacked", "columns"],
  cta: ["split", "minimal", "newsletter", "booking-whatsapp", "service-booking", "booking-embed"],
  "contact-form": ["stacked-quote", "minimal", "server-action", "states"],
  "map-hours": ["info", "branches", "special-days"],
  "blog-list": ["list", "grid", "compact-related", "empty-loading"],
  "article-layout": ["wide-cover", "minimal", "prose-elements"],
  footer: ["wordmark", "minimal", "ecommerce-legal"],
  "consent-banner": ["box", "preferences", "consent-mode", "gate-embed"],
  "contact-dock": ["fab", "bar-restaurant"],
  "not-found": ["links-search", "error-500"],
};

/** The demo preview at the top of the page (rendered before the Examples sections). */
const demo = (page: Page) => page.locator('main [role="tabpanel"]').first();
/** The live preview panel of one example section (not the Code tab). */
const preview = (page: Page, id: string) => page.locator(`section#${id} [role="tabpanel"]`).first();

/** Extra console noise to ignore on wave-3 pages (external requests are stubbed in beforeEach). */
const IGNORE: RegExp[] = [];

/** Opens a docs page (200, h1, hydrated; survives a dev-server restart) and returns its console errors. */
const open = (page: Page, slug: string) => openDocsPage(page, slug, IGNORE);

test.describe("wave 3 — docs pages", () => {
  for (const [slug, examples] of Object.entries(PAGES)) {
    test(`${slug}: demo + every example render, no console errors, no serious axe`, async ({ page }) => {
      test.setTimeout(150_000);
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

/** Press and hold a key briefly (Radix acts on focus moves in a setTimeout after keydown). */
async function hold(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}

test.describe("wave 3 — flows & business", () => {
  test("line items: Add item appends a row; editing quantity updates the amount", async ({ page }) => {
    const errors = await open(page, "line-items");
    const table = demo(page).getByRole("table").first();
    const rows = table.locator("tbody tr");
    const before = await rows.count();
    await demo(page).getByRole("button", { name: "Add item" }).click();
    await expect(rows).toHaveCount(before + 1);
    await expect(demo(page).getByRole("textbox", { name: `Description, row ${before + 1}` })).toBeFocused();
    const qty = demo(page).getByRole("spinbutton", { name: "Qty, row 1" });
    await qty.fill("3");
    await qty.press("Tab");
    await expect(rows.first()).toContainText("€4,350.00");
    expect(errors).toEqual([]);
  });

  test("multi-step form: Next validates the step, then moves focus to the next step heading", async ({ page }) => {
    const errors = await open(page, "multi-step-form");
    const next = demo(page).getByRole("button", { name: "Next" });
    await next.click();
    await expect(demo(page).getByRole("alert").first()).toContainText(/highlighted fields/);
    await expect(demo(page).getByRole("heading", { name: /Step 1 of 4: Identity/ })).toBeVisible();
    await demo(page).getByRole("textbox", { name: "First name" }).fill("Deniz");
    await demo(page).getByRole("textbox", { name: "Last name" }).fill("Aydın");
    await next.click();
    const heading = demo(page).getByRole("heading", { name: /Step 2 of 4: Contact/ });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await demo(page).getByRole("button", { name: "Back" }).click();
    await expect(demo(page).getByRole("textbox", { name: "First name" })).toHaveValue("Deniz");
    expect(errors).toEqual([]);
  });

  test("approval flow: approving with a note marks the stage approved", async ({ page }) => {
    const errors = await open(page, "approval-flow");
    const panel = preview(page, "actions");
    await panel.getByRole("button", { name: "Approve" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox").first().fill("Looks good.");
    await dialog.getByRole("button", { name: /Approve request/ }).click();
    await expect(dialog).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("import wizard: a CSV upload moves on to column mapping", async ({ page }) => {
    const errors = await open(page, "import-wizard");
    const input = demo(page).locator('input[type="file"]');
    await input.setInputFiles({ name: "contacts.csv", mimeType: "text/csv", buffer: Buffer.from("Name,Email,Phone\nAyşe Kaya,ayse@example.com,+90 532 000 00 00\nJonas Weber,jonas@example.com,+49 30 1234567\n") });
    await expect(demo(page)).toContainText(/2 rows · 3 columns/);
    await demo(page).getByRole("button", { name: "Next" }).click();
    await expect(demo(page).getByRole("heading", { name: /Step 2 of 4: Map columns/ })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("export: the dialog opens with column choices and closes with Escape, focus returns", async ({ page }) => {
    const errors = await open(page, "export");
    const trigger = demo(page).getByRole("button", { name: "Export" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("checkbox").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("setup checklist: a step header toggles its details", async ({ page }) => {
    const errors = await open(page, "setup-checklist");
    const step = demo(page).getByRole("button", { name: /Add your domain/ });
    await expect(step).toHaveAttribute("aria-expanded", "false");
    await step.click();
    await expect(step).toHaveAttribute("aria-expanded", "true");
    expect(errors).toEqual([]);
  });

  test("permission matrix: Space toggles a cell, arrows move between cells", async ({ page }) => {
    const errors = await open(page, "permission-matrix");
    const cell = demo(page).getByRole("checkbox", { name: "Posts, Delete: Not allowed" });
    await cell.focus();
    await page.keyboard.press("Space");
    await expect(demo(page).getByRole("checkbox", { name: /^Posts, Delete: Allowed/ })).toBeChecked();
    await page.keyboard.press("ArrowLeft");
    await expect(demo(page).getByRole("checkbox", { name: /^Posts, Publish/ })).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 3 — drag and drop", () => {
  test("kanban: the card menu moves a deal to another stage", async ({ page }) => {
    const errors = await open(page, "kanban");
    const board = demo(page).getByRole("region", { name: "Sales pipeline" });
    await board.getByRole("button", { name: "Actions for Northwind Traders — Website relaunch" }).click();
    await page.getByRole("menuitem", { name: /^Discovery/ }).click();
    await expect(board.getByRole("group", { name: /^Discovery, 3 items/ })).toBeVisible();
    await expect(board.getByRole("group", { name: /^Discovery/ }).getByRole("article", { name: /Website relaunch/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("sortable tree: Alt+ArrowDown moves an item and announces it", async ({ page }) => {
    const errors = await open(page, "sortable-list");
    const tree = demo(page).getByRole("tree", { name: "Header navigation" });
    const home = tree.getByRole("treeitem", { name: /^Home/ });
    await home.focus();
    await page.keyboard.press("Alt+ArrowDown");
    await expect(tree.getByRole("treeitem").first()).toHaveAccessibleName(/^Services/);
    await expect(tree.getByRole("treeitem", { name: /^Home/ })).toBeFocused();
    await expect(demo(page).getByRole("status").filter({ hasText: /Home moved/ })).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("hierarchy chart: arrow keys move between nodes in the tree", async ({ page }) => {
    const errors = await open(page, "hierarchy-chart");
    const tree = demo(page).getByRole("tree", { name: "Organization" });
    const selected = tree.locator('[role="treeitem"][tabindex="0"]');
    await selected.focus();
    const first = await selected.getAttribute("aria-label").then((l) => l ?? "");
    await page.keyboard.press("ArrowDown");
    await expect(tree.locator('[role="treeitem"]:focus')).toHaveCount(1);
    expect(await tree.locator('[role="treeitem"]:focus').innerText()).not.toEqual(first);
    expect(errors).toEqual([]);
  });
});

test.describe("wave 3 — calendar & time", () => {
  test("scheduler: the view switch shows the month grid and the list view", async ({ page }) => {
    const errors = await open(page, "scheduler");
    const cal = demo(page).getByRole("region").first();
    await cal.getByRole("radio", { name: "Month" }).click();
    await expect(cal.getByRole("radio", { name: "Month" })).toBeChecked();
    await expect(cal.getByRole("grid").first()).toBeVisible();
    await cal.getByRole("radio", { name: "List" }).click();
    await expect(cal.getByRole("heading", { level: 3 }).first()).toBeVisible();
    await cal.getByRole("button", { name: "Next" }).click();
    expect(errors).toEqual([]);
  });

  test("resource calendar: arm a template, Enter assigns it to the active cell", async ({ page }) => {
    const errors = await open(page, "resource-calendar");
    const grid = demo(page).getByRole("grid");
    const empty = grid.getByRole("gridcell", { name: /^Ayşe Demir, .*\. empty$/ }).first();
    const name = (await empty.textContent()) ?? "";
    await demo(page).getByRole("button", { name: /^Evening/ }).click();
    await empty.click();
    await expect(grid.getByRole("gridcell", { name: /^Ayşe Demir, .*Evening/ }).first()).toBeVisible();
    expect(name).toContain("empty");
    expect(errors).toEqual([]);
  });

  test("gantt: zoom radio switches the scale", async ({ page }) => {
    const errors = await open(page, "gantt");
    const month = demo(page).getByRole("radio", { name: "Month" });
    await month.click();
    await expect(month).toBeChecked();
    await expect(demo(page).getByRole("treegrid", { name: "Project plan" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("time tracker: start and stop the timer", async ({ page }) => {
    const errors = await open(page, "time-tracker");
    const start = demo(page).getByRole("button", { name: "Start timer for Mobile app" }).last();
    await start.click();
    const stop = demo(page).getByRole("button", { name: "Stop timer for Mobile app" }).last();
    await expect(stop).toHaveAttribute("aria-pressed", "true");
    await stop.click();
    await expect(demo(page).getByRole("button", { name: "Start timer for Mobile app" }).last()).toHaveAttribute("aria-pressed", "false");
    expect(errors).toEqual([]);
  });
});

test.describe("wave 3 — layouts & data display", () => {
  test("list layout: select-all checks every row on the page", async ({ page }) => {
    const errors = await open(page, "list-layout");
    await demo(page).getByRole("checkbox", { name: "Select all on this page" }).check();
    await expect(demo(page).getByRole("checkbox", { name: "Select Laura Callahan" })).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("record detail layout: tabs switch with arrow keys", async ({ page }) => {
    const errors = await open(page, "record-detail-layout");
    const activity = demo(page).getByRole("tab", { name: "Activity" });
    await activity.focus();
    await hold(page, "ArrowRight");
    await expect(demo(page).getByRole("tab", { name: /^Deals/ })).toHaveAttribute("aria-selected", "true");
    expect(errors).toEqual([]);
  });

  test("editor layout: the settings panel toggles", async ({ page }) => {
    const errors = await open(page, "editor-layout");
    const toggle = demo(page).getByRole("button", { name: "Settings panel" });
    // The docs preview may be narrow enough for the sheet layout: assert a toggle either way.
    await page.waitForTimeout(300);
    const before = await toggle.getAttribute("aria-expanded");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", before === "true" ? "false" : "true");
    expect(errors).toEqual([]);
  });

  test("settings layout: an edit shows the save bar, Discard hides it", async ({ page }) => {
    const errors = await open(page, "settings-layout");
    await demo(page).getByRole("textbox", { name: "Tagline" }).fill("Stories from the harbour");
    const discard = demo(page).getByRole("button", { name: "Discard" });
    await expect(discard).toBeVisible();
    await discard.click();
    await expect(demo(page).getByRole("textbox", { name: "Tagline" })).toHaveValue("Stories from the harbour kitchen");
    expect(errors).toEqual([]);
  });

  test("comment thread: typing enables Comment and posts the comment", async ({ page }) => {
    const errors = await open(page, "comment-thread");
    const box = demo(page).getByRole("textbox", { name: "Write a comment… Use @ to mention" });
    const submit = demo(page).getByRole("button", { name: "Comment", exact: true });
    await expect(submit).toBeDisabled();
    await box.click();
    await page.keyboard.type("Sent the revised quote this morning.");
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(demo(page).getByText("Sent the revised quote this morning.")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("audit log: a row expands to show the event details", async ({ page }) => {
    const errors = await open(page, "audit-log");
    const expand = demo(page).getByRole("button", { name: "Show details for Changed role by Ayşe Kaya" });
    await expand.click();
    await expect(expand).toHaveAttribute("aria-expanded", "true");
    await expect(demo(page).getByText("Event ID").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("task list: a checkbox completes a task", async ({ page }) => {
    const errors = await open(page, "task-list");
    const task = demo(page).getByRole("checkbox", { name: "Confirm SSO requirements with IT" });
    await task.check();
    await expect(task).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("version history: restore asks for confirmation, Escape cancels", async ({ page }) => {
    const errors = await open(page, "version-history");
    const restore = demo(page).getByRole("button", { name: "Restore this version" });
    await restore.click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(restore).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 3 — media & editor", () => {
  test("media picker: the dialog opens on the library and closes with Escape", async ({ page }) => {
    const errors = await open(page, "media-picker");
    const trigger = demo(page).getByRole("button", { name: "Set featured image" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("tab", { name: "Library" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("media library: the type filter narrows the files", async ({ page }) => {
    const errors = await open(page, "media-library");
    const kind = demo(page).getByRole("combobox", { name: "File type" });
    await kind.selectOption({ label: "Documents" });
    await expect(kind).toHaveValue(/document/);
    expect(errors).toEqual([]);
  });

  test("image field: Edit alt text opens the alt editor", async ({ page }) => {
    const errors = await open(page, "image-field");
    await demo(page).getByRole("button", { name: "Edit alt text" }).click();
    await expect(page.getByRole("textbox", { name: /Alt text/ }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("block editor: Add block opens the inserter, Escape closes it", async ({ page }) => {
    const errors = await open(page, "block-editor");
    const add = demo(page).getByRole("button", { name: "Add block" });
    await add.click();
    const search = page.getByRole("combobox", { name: /Search blocks/ }).or(page.getByRole("textbox", { name: /Search blocks/ }));
    await expect(search.first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(search).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("wave 3 — site blocks", () => {
  test("FAQ: opening a question closes the open one (exclusive details)", async ({ page }) => {
    const errors = await open(page, "faq");
    const items = demo(page).locator("details");
    await expect(items.first()).toHaveAttribute("open", "");
    await items.nth(1).locator("summary").click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.first()).not.toHaveAttribute("open", "");
    expect(errors).toEqual([]);
  });

  test("consent banner: Preferences opens the dialog, Escape closes it and focus returns", async ({ page }) => {
    const errors = await open(page, "consent-banner");
    const prefs = demo(page).getByRole("button", { name: "Preferences" });
    await prefs.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Reject all" }).or(dialog.getByRole("checkbox").first()).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(prefs).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("contact form: submitting empty shows the errors", async ({ page }) => {
    const errors = await open(page, "contact-form");
    const name = demo(page).getByRole("textbox", { name: "Full name" });
    await demo(page).getByRole("button", { name: /Send|Submit|Request/ }).first().click();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    expect(errors).toEqual([]);
  });

  test("pricing table: Yearly switches the billing period", async ({ page }) => {
    const errors = await open(page, "pricing-table");
    // Hidden radios styled through their labels (no JS): click the visible label.
    const yearly = demo(page).getByRole("radio", { name: /Yearly/ });
    await demo(page).locator("label", { hasText: "Yearly" }).click();
    await expect(yearly).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("gallery section: a tile opens the lightbox, Escape closes it", async ({ page }) => {
    const errors = await open(page, "gallery-section");
    const tile = demo(page).getByRole("button", { name: "Open image 1 of 7" });
    await tile.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("map & hours: the map loads only after Load map", async ({ page }) => {
    const errors = await open(page, "map-hours");
    await expect(demo(page).locator("iframe")).toHaveCount(0);
    await demo(page).getByRole("button", { name: "Load map" }).click();
    await expect(demo(page).locator("iframe")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
