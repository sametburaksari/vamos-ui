import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, gotoWithRetry, onlyRestartNoise, seriousA11y, stubExternalRequests, waitForServer } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Admin blocks, batch 1: app shells 05–12, dashboards 06–09 and the second auth set (2FA setup,
 * passkey, SSO lookup, invite, lockout, session expired, story sign-in). Each block renders at 1440
 * and 390 without console errors, serious axe violations or sideways page scroll, and its main
 * interaction works end to end.
 */

const BLOCKS = [
  "shell-05", "shell-06", "shell-07", "shell-08", "shell-09", "shell-10", "shell-11", "shell-12",
  "dashboard-06", "dashboard-07", "dashboard-08", "dashboard-09",
  "auth-2fa-setup-01", "auth-passkey-01", "auth-sso-01", "auth-invite-01", "auth-locked-01", "auth-session-01", "login-03",
];

const HYDRATION = /Hydration failed|didn't match the client|hydration mismatch/i;

/** Waits until the block's client tree has hydrated (React props on the first interactive element). */
async function waitForBlockHydration(page: Page, timeout = 30_000) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("button, a[href], input, [role='tab']");
      return !el || Object.keys(el).some((k) => k.startsWith("__reactProps"));
    },
    undefined,
    { timeout },
  );
}

/** Opens /view/<name>: 200, hydrated, restart noise and a one-off stale-SSR mismatch retried once. */
async function openBlock(page: Page, name: string) {
  const errors = collectConsoleErrors(page);
  const load = async () => {
    const res = await gotoWithRetry(page, `/view/${name}`);
    expect(res?.status(), name).toBe(200);
    const hydrated = await waitForBlockHydration(page).then(() => true, () => false);
    // A dev-server restart mid-load can leave Next's "Application error" screen (chunks refused).
    return hydrated && !(await page.getByText(/^Application error/).count());
  };
  let ok = await load();
  if (!ok || onlyRestartNoise(errors)) {
    test.info().annotations.push({ type: "dev-server-restart", description: name });
    await waitForServer(page);
    errors.length = 0;
    ok = await load();
  }
  if (!ok) throw new Error(`${name}: never hydrated. Console: ${errors.join(" | ")}`);
  // React logs a hydration mismatch just after the tree attaches; give it a moment to arrive.
  await page.waitForTimeout(400);
  if (errors.length && errors.every((e) => HYDRATION.test(e))) {
    test.info().annotations.push({ type: "flaky-hydration", description: name });
    errors.length = 0;
    if (!(await load())) throw new Error(`${name}: never hydrated after reload. Console: ${errors.join(" | ")}`);
  }
  return errors;
}

/** Document width beyond the viewport, in px (0 = no horizontal page scroll). */
const overflowX = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

/**
 * Admin blocks, batch 2: dashboards 10–16 (support SLA, project portfolio, marketing, inventory,
 * SaaS metrics, realtime analytics, dispatch console) and the template first-run screen.
 */
const BLOCKS_2 = ["dashboard-10", "dashboard-11", "dashboard-12", "dashboard-13", "dashboard-14", "dashboard-15", "dashboard-16", "empty-03"];

/**
 * Admin blocks, batch 3: lists and details (activity feed, tree list, tasks in three views,
 * customer 360, order detail with refunds, employee file, product information editor).
 */
const BLOCKS_3 = ["list-11", "list-12", "list-13", "detail-04", "detail-05", "detail-06", "detail-07"];

/**
 * Admin blocks, batch 4: settings (plan & billing, API keys & webhooks, notification preferences,
 * integrations, security & sessions) and the campaign wizard form.
 */
const BLOCKS_4 = ["settings-03", "settings-04", "settings-05", "settings-06", "settings-07", "form-02"];

for (const [title, blocks] of [["admin blocks 1 — previews", BLOCKS], ["admin blocks 2 — previews", BLOCKS_2], ["admin blocks 3 — previews", BLOCKS_3], ["admin blocks 4 — previews", BLOCKS_4]] as const)
test.describe(title, () => {
  for (const name of blocks) {
    test(`${name}: 1440 and 390 render with a landmark, no console errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(150_000);
      const check = async () => {
        const out: { width: number; axe: string[]; overflow: number }[] = [];
        let errors: string[] & { stop(): void } = Object.assign([], { stop() {} });
        for (const [width, height] of [[1440, 900], [390, 844]] as const) {
          await page.setViewportSize({ width, height });
          errors = await openBlock(page, name);
          const text = (await page.locator("body").innerText()).trim();
          expect(text.length, `${name} is empty at ${width}`).toBeGreaterThan(40);
          await expect(page.locator("main, [role='main'], [role='dialog'], h1").first(), `${name} has a landmark at ${width}`).toBeAttached();
          out.push({ width, axe: await seriousA11y(page), overflow: await overflowX(page) });
          errors.stop();
          if (errors.length) break;
        }
        return { out, errors: [...errors] };
      };
      let r = await check();
      if (r.errors.length && r.errors.every((e) => HYDRATION.test(e))) {
        test.info().annotations.push({ type: "flaky-hydration", description: name });
        r = await check();
      }
      if (onlyRestartNoise(r.errors)) {
        test.info().annotations.push({ type: "dev-server-restart", description: name });
        await waitForServer(page);
        r = await check();
      }
      expect(r.errors, name).toEqual([]);
      for (const o of r.out) {
        expect(o.axe, `${name} axe at ${o.width}`).toEqual([]);
        expect(o.overflow, `${name} overflows at ${o.width}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

/** Opens a block at a width for an interaction test and returns the live console errors. */
async function open(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
  return openBlock(page, name);
}

/**
 * No console errors, apart from refused requests while the dev server restarts itself under memory
 * pressure mid-test (the page keeps working; nothing the block logs is ignored).
 */
function expectClean(errors: string[]) {
  expect(errors.filter((e) => !/^Failed to load resource: net::(ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_EMPTY_RESPONSE)/.test(e))).toEqual([]);
}

const toast = (page: Page, text: string | RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: text }).first();

test.describe("admin blocks 1 — shells", () => {
  test.describe.configure({ timeout: 120_000 });

  test("shell-05: multi-select delete with confirm, then alt text saves from the inspector", async ({ page }) => {
    const errors = await open(page, "shell-05");
    const main = page.getByRole("main");
    const boxes = main.getByRole("checkbox", { name: /^Select (?!all)/ });
    const before = await boxes.count();
    await boxes.nth(0).check({ force: true });
    await boxes.nth(1).check({ force: true });
    await expect(page.getByText("2 selected")).toBeVisible();
    await page.getByRole("region", { name: "Selection" }).getByRole("button", { name: /Delete/ }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete files" }).click();
    await expect(boxes).toHaveCount(before - 2);
    await main.getByRole("button", { name: /^Open / }).first().click();
    await page.getByRole("textbox", { name: /Alt text/ }).fill("Stoneware on a linen cloth");
    await page.getByRole("button", { name: "Save alt text" }).click();
    await expect(toast(page, "Alt text saved")).toBeVisible();
    expectClean(errors);
  });

  test("shell-06: '/' menu filter, stock adjustment and a purchase order from two selected rows", async ({ page }) => {
    const errors = await open(page, "shell-06");
    await page.getByRole("textbox", { name: "Filter menu" }).fill("receipt");
    await expect(page.getByRole("link", { name: /Goods receipts/ })).toBeVisible();
    await page.getByRole("textbox", { name: "Filter menu" }).fill("");
    await page.getByRole("button", { name: /^Actions for / }).first().click();
    await page.getByRole("menuitem", { name: /Adjust stock/ }).click();
    await page.getByRole("dialog").getByRole("textbox").first().fill("12");
    await page.getByRole("button", { name: "Post adjustment" }).click();
    await expect(toast(page, /Stock adjusted/)).toBeVisible();
    const boxes = page.getByRole("main").getByRole("checkbox", { name: /^Select KL-/ });
    await boxes.nth(0).check();
    await boxes.nth(1).check();
    await page.getByRole("button", { name: /Reorder 2/ }).click();
    await page.getByRole("button", { name: "Create and send" }).click();
    await expect(toast(page, /PO-\d+ sent/)).toBeVisible();
    await expect(page.getByText(/on order/).first()).toBeVisible();
    expectClean(errors);
  });

  test("shell-07: bulk 'Mark as fulfilled' removes the row, and an order opens in a sheet", async ({ page }) => {
    const errors = await open(page, "shell-07");
    const rows = page.getByRole("main").getByRole("checkbox", { name: /^Select order/ });
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);
    await rows.first().check();
    await page.getByRole("button", { name: "Mark as fulfilled" }).click();
    await expect(rows).toHaveCount(before - 1);
    await page.getByRole("link", { name: /^All orders/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("All orders");
    await page.getByRole("main").getByRole("button", { name: /^#KL-/ }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expectClean(errors);
  });

  test("shell-08: approve a deal registration, view a portal as the client, Ctrl+5 to the partner portal", async ({ page }) => {
    const errors = await open(page, "shell-08");
    await page.getByRole("button", { name: /^Approve Orchard/ }).click();
    await expect(toast(page, "Orchard & Oak Furniture approved")).toBeVisible();
    await page.getByRole("button", { name: /Open portal/ }).first().click();
    await expect(page.getByText(/Agency only/).first()).toBeVisible();
    await page.getByRole("switch").click();
    await expect(page.getByText(/Agency only/)).toHaveCount(0);
    await page.keyboard.press("Control+5");
    await expect(page.getByRole("heading", { level: 1, name: "Meridyen Digital" })).toBeVisible();
    await page.getByRole("button", { name: "Register a deal" }).click();
    await page.getByRole("dialog").getByRole("textbox").first().fill("Harbourline Ceramics");
    await page.getByRole("dialog").getByRole("textbox").nth(1).fill("18000");
    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByRole("cell", { name: "Harbourline Ceramics" })).toBeVisible();
    expectClean(errors);
  });

  test("shell-09 (phone): a job needs the checklist and a signature before it can be completed", async ({ page }) => {
    const errors = await open(page, "shell-09", 390);
    await page.getByRole("button", { name: /Open job/ }).first().click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    for (const box of await sheet.getByRole("checkbox").all()) await box.click();
    const canvas = sheet.locator("[data-slot=signature-pad-canvas]").first();
    await canvas.scrollIntoViewIfNeeded();
    const b = (await canvas.boundingBox())!;
    await page.mouse.move(b.x + 20, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + 80, b.y + 20, { steps: 5 });
    await page.mouse.move(b.x + 160, b.y + b.height - 20, { steps: 5 });
    await page.mouse.up();
    await sheet.getByRole("button", { name: "Complete job" }).click();
    await expect(toast(page, /FS-20418 complete/)).toBeVisible();
    expectClean(errors);
  });

  test("shell-10: ⌘K jumps to API keys, 'c' creates a key and its secret is shown once", async ({ page }) => {
    const errors = await open(page, "shell-10");
    await page.locator("body").click({ position: { x: 5, y: 300 } });
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.type("api keys");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "API keys" })).toBeVisible();
    await page.keyboard.press("c");
    await page.getByRole("textbox", { name: /Name/ }).fill("Shopfront sync");
    await page.getByRole("button", { name: "Create key" }).last().click();
    await expect(page.getByText(/Copy your new key/)).toBeVisible();
    expectClean(errors);
  });

  test("shell-11: reply to a ticket, then bulk-solve two tickets", async ({ page }) => {
    const errors = await open(page, "shell-11");
    await page.locator("[data-ticket]").nth(1).click();
    await page.getByRole("textbox", { name: "Reply" }).fill("Thanks — I've re-sent the invoice to the new tax number.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(toast(page, /Reply sent to/)).toBeVisible();
    await page.getByRole("checkbox", { name: /^Select #/ }).nth(0).click();
    await page.getByRole("checkbox", { name: /^Select #/ }).nth(2).click();
    await page.getByRole("button", { name: "Solve", exact: true }).click();
    await expect(toast(page, /2 tickets solved/)).toBeVisible();
    expectClean(errors);
  });

  test("shell-12: editing a heading updates the canvas and ⌘Z undoes it", async ({ page }) => {
    const errors = await open(page, "shell-12");
    const heading = page.locator('[data-section="s-cta"] h2');
    const original = await heading.innerText();
    await page.locator('[data-section="s-cta"] > button').click();
    await page.getByRole("textbox", { name: "Heading" }).fill("Letters from the kiln");
    await expect(heading).toHaveText("Letters from the kiln");
    await page.locator("main").first().click({ position: { x: 4, y: 4 } });
    await page.keyboard.press("ControlOrMeta+z");
    await expect(heading).toHaveText(original);
    expectClean(errors);
  });
});

test.describe("admin blocks 1 — dashboards", () => {
  test.describe.configure({ timeout: 120_000 });

  test("dashboard-06: a stage filters the deal list and 'Mark won' moves the deal with a toast", async ({ page }) => {
    const errors = await open(page, "dashboard-06");
    await page.getByRole("button", { name: /^Qualified/ }).click();
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    await rows.first().locator("button").first().click();
    await page.getByRole("button", { name: "Mark won" }).click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-07: approve one leave request, decline the other with a reason", async ({ page }) => {
    const errors = await open(page, "dashboard-07");
    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(toast(page, /Leave approved for/)).toBeVisible();
    await page.getByRole("button", { name: "Decline" }).first().click();
    await page.getByLabel("Reason (sent to the employee)").fill("Year-end close");
    await page.getByRole("button", { name: "Decline request" }).click();
    await expect(toast(page, /Leave declined for/)).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-08: select every order in the lane and mark them picked", async ({ page }) => {
    const errors = await open(page, "dashboard-08");
    await page.getByRole("checkbox", { name: "Select all" }).click();
    await page.getByRole("button", { name: "Mark picked" }).click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
    await page.getByRole("button", { name: /^03\s*Packing/ }).click();
    await expect(page.getByRole("button", { name: /^#KL-/ }).first()).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-09: a scenario changes the runway and 'Paid' moves cash at once", async ({ page }) => {
    const errors = await open(page, "dashboard-09");
    const runway = page.getByText(/months$/).first();
    const before = await runway.innerText();
    await page.getByRole("radio", { name: "Hire 4 in Q1" }).click();
    await expect(runway).not.toHaveText(before);
    await page.getByRole("button", { name: /^Paid INV-/ }).first().click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
    expectClean(errors);
  });
});

test.describe("admin blocks 1 — auth", () => {
  test.describe.configure({ timeout: 120_000 });

  test("auth-2fa-setup-01: a wrong code is rejected, the right one leads to backup codes and 'on'", async ({ page }) => {
    const errors = await open(page, "auth-2fa-setup-01");
    await page.getByRole("button", { name: /scanned it/i }).click();
    await page.locator("input[name=code]").fill("000000");
    await expect(page.getByText(/didn’t match/i)).toBeVisible();
    await page.locator("input[name=code]").fill("482913");
    await expect(page.getByRole("heading", { name: /backup codes/i })).toBeVisible();
    await page.getByRole("checkbox").first().click();
    await page.getByRole("button", { name: /turn on two-step/i }).click();
    await expect(page.getByRole("heading", { name: /is on/i })).toBeVisible();
    expectClean(errors);
  });

  test("auth-passkey-01: passkey sign-in, then a new passkey is added", async ({ page }) => {
    const errors = await open(page, "auth-passkey-01");
    await page.getByRole("button", { name: /sign in with a passkey/i }).click();
    await expect(page.getByText(/signed in as/i).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /add a passkey/i }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: /create passkey/i }).click();
    await expect(page.getByText(/passkey added/i).first()).toBeVisible({ timeout: 10_000 });
    expectClean(errors);
  });

  test("auth-sso-01: the email domain finds the organisation, an unknown one gets the no-match path", async ({ page }) => {
    const errors = await open(page, "auth-sso-01");
    const email = page.locator("input[name=email]");
    await email.fill("someone@nowhere.example.org");
    await expect(page.getByText(/no single sign-on/i).first()).toBeVisible();
    await email.fill("ruth@tidewell.example.com");
    await expect(page.getByText(/Tidewell Logistics/).first()).toBeVisible();
    await page.getByRole("button", { name: /continue to tidewell/i }).click();
    await expect(page.getByText(/redirecting/i).first()).toBeVisible();
    expectClean(errors);
  });

  test("auth-invite-01: a weak password is refused, a strong one accepts the invite", async ({ page }) => {
    const errors = await open(page, "auth-invite-01");
    await page.getByLabel(/^password/i).first().fill("short");
    await page.getByRole("button", { name: /accept invite/i }).click();
    await expect(page.locator("input[aria-invalid=true]").first()).toBeVisible();
    await page.getByLabel(/^password/i).first().fill("Linen-kiln-2026!");
    await page.getByRole("button", { name: /accept invite/i }).click();
    await expect(page.getByText(/you’re in/i).first()).toBeVisible();
    expectClean(errors);
  });

  test("auth-locked-01: emailed code, then a new password unlocks the account", async ({ page }) => {
    const errors = await open(page, "auth-locked-01");
    await page.getByRole("button", { name: /email me an unlock code/i }).click();
    await page.locator("input[name=code]").fill("381604");
    await page.getByLabel(/new password/i).first().fill("Kiln-and-linen-2026");
    await page.getByRole("button", { name: /set password and unlock/i }).click();
    await expect(page.getByText(/unlocked/i).first()).toBeVisible();
    expectClean(errors);
  });

  test("auth-session-01: the dialog survives Escape and closes after the right password", async ({ page }) => {
    const errors = await open(page, "auth-session-01");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^password/i).fill("wrong");
    await dialog.getByRole("button", { name: /^sign in/i }).click();
    await expect(page.getByText(/incorrect/i).first()).toBeVisible();
    await dialog.getByLabel(/^password/i).fill("correct-horse-42");
    await dialog.getByRole("button", { name: /^sign in/i }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/welcome back/i).first()).toBeVisible();
    expectClean(errors);
  });

  test("login-03: email first, then a password step that rejects a wrong password", async ({ page }) => {
    const errors = await open(page, "login-03");
    await page.getByLabel(/work email/i).fill("defne.kaya@example.com");
    await page.getByRole("button", { name: /^continue$/i }).click();
    await page.getByLabel(/^password/i).first().fill("abc");
    await page.getByRole("button", { name: /^sign in/i }).click();
    await expect(page.getByText(/incorrect/i).first()).toBeVisible();
    await page.getByLabel(/^password/i).first().fill("long-enough-pass");
    await page.getByRole("button", { name: /^sign in/i }).click();
    await expect(page.getByText(/signed in/i).first()).toBeVisible();
    expectClean(errors);
  });
});

test.describe("admin blocks 2 — dashboards", () => {
  test.describe.configure({ timeout: 120_000 });

  test("dashboard-10: a first reply stops the clock, two tickets are bulk-assigned, a horizon marker selects its ticket", async ({ page }) => {
    const errors = await open(page, "dashboard-10");
    await page.getByRole("button", { name: /^Reply/ }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Send reply" }).click();
    await expect(toast(page, /First reply sent on/)).toBeVisible();
    const boxes = page.getByRole("checkbox", { name: /Select ticket/ });
    await boxes.nth(0).click();
    await boxes.nth(1).click();
    await page.getByRole("button", { name: "Assign", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Assign", exact: true }).click();
    await expect(toast(page, /2 tickets assigned to/)).toBeVisible();
    const marker = page.locator('[aria-labelledby="horizon-title"] li button').first();
    await marker.click();
    await expect(marker).toHaveAttribute("aria-pressed", "true");
    expectClean(errors);
  });

  test("dashboard-11: the side sheet ticks a milestone and refuses an empty risk; Resolve clears a risk", async ({ page }) => {
    const errors = await open(page, "dashboard-11");
    await page.getByRole("button", { name: /Fleet tracking dashboard/ }).first().click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    const last = sheet.getByRole("checkbox").last();
    const was = await last.isChecked();
    await last.click();
    await expect(last).toBeChecked({ checked: !was });
    await sheet.getByRole("button", { name: "Log risk" }).click();
    await expect(sheet.getByText("Describe the risk in a few words.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await page.getByRole("button", { name: /^Resolve/ }).first().click();
    await expect(toast(page, "Risk resolved")).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-12: 90 days changes the KPIs, a campaign pauses, and a budget below spend is refused", async ({ page }) => {
    const errors = await open(page, "dashboard-12");
    const kpis = page.getByRole("main").locator("[data-slot=card]").first();
    const before = await kpis.innerText();
    await page.getByRole("radio", { name: "90 days" }).click();
    await expect(kpis).not.toHaveText(before);
    await page.getByRole("switch").first().click();
    await expect(toast(page, / (paused|resumed)/)).toBeVisible();
    await page.getByRole("button", { name: /^Budget/ }).first().click();
    const dialog = page.getByRole("dialog");
    const amount = dialog.getByRole("textbox").first();
    await amount.fill("1");
    await expect(dialog.getByText(/already spent/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Save budget" })).toBeDisabled();
    await amount.fill("999999");
    await dialog.getByRole("button", { name: "Save budget" }).click();
    await expect(toast(page, /Budget updated/)).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-13: checked reorder lines become purchase orders, and a received movement validates then posts", async ({ page }) => {
    const errors = await open(page, "dashboard-13");
    await page.getByRole("button", { name: /Create PO/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^Send \d+ orders?/ }).click();
    await expect(toast(page, /sent/)).toBeVisible();
    await page.getByRole("button", { name: "Record", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Record movement" }).click();
    await expect(dialog.getByText("Choose a product.")).toBeVisible();
    await dialog.getByRole("combobox").click();
    await page.getByRole("option").first().click();
    await dialog.getByRole("spinbutton").fill("12");
    await dialog.getByRole("button", { name: "Record movement" }).click();
    await expect(page.getByText(/^\+12 ×/).first()).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-14: a play is logged with undo, and an expansion account is snoozed", async ({ page }) => {
    const errors = await open(page, "dashboard-14");
    await page.getByRole("button", { name: /Save play/ }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Log play" }).click();
    await expect(toast(page, /Play logged for/)).toBeVisible();
    await page.getByRole("tab", { name: /Ready to expand/ }).click();
    await page.getByRole("button", { name: /^Snooze/ }).first().click();
    await expect(toast(page, /snoozed for 14 days/)).toBeVisible();
    expectClean(errors);
  });

  test("dashboard-15: the feed advances on its own and Pause stops it", async ({ page }) => {
    const errors = await open(page, "dashboard-15");
    const top = page.locator("[role=log] li").first();
    const first = (await top.textContent()) ?? "";
    await expect(top).not.toHaveText(first, { timeout: 15_000 });
    await page.getByRole("button", { name: "Pause updates" }).click();
    await expect(page.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "true");
    const paused = (await top.textContent()) ?? "";
    await page.waitForTimeout(5_000);
    await expect(top).toHaveText(paused);
    expectClean(errors);
  });

  test("dashboard-16: assigning a technician puts the job on the way", async ({ page }) => {
    const errors = await open(page, "dashboard-16");
    await page.getByRole("button", { name: "Assign technician" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Assign and notify" }).click();
    await expect(page.getByText(/is on the way/).first()).toBeVisible();
    expectClean(errors);
  });

  test("empty-03: a nameless project is refused; sample data loads and is removed again", async ({ page }) => {
    const errors = await open(page, "empty-03");
    await page.getByRole("button", { name: /Create from/ }).click();
    await expect(page.getByText("Give the project a name.")).toBeVisible();
    await page.getByRole("button", { name: "Load sample data" }).click();
    await expect(page.getByText("You are looking at sample data")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Remove sample data" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page.getByText(/Choose how you want to begin/)).toBeVisible();
    expectClean(errors);
  });
});

test.describe("admin blocks 3 — lists and details", () => {
  test.describe.configure({ timeout: 120_000 });

  test("list-11: live events wait behind the pill, Pause stops the stream, scrolling loads older events", async ({ page }) => {
    const errors = await open(page, "list-11");
    const main = page.getByRole("main");
    const items = main.locator("li");
    const before = await items.count();
    const pill = page.getByRole("button", { name: /^\d+ new events?$/ });
    await expect(pill).toBeVisible({ timeout: 20_000 });
    await pill.click();
    await expect(pill).toHaveCount(0);
    expect(await items.count()).toBeGreaterThan(before);
    await page.getByRole("button", { name: "Pause stream" }).click();
    await expect(page.getByRole("button", { name: "Resume stream" })).toBeVisible();
    await expect(page.getByText("Paused", { exact: true }).first()).toBeVisible();
    const shown = await items.count();
    await page.getByRole("button", { name: "Load older events" }).scrollIntoViewIfNeeded();
    await expect.poll(() => items.count(), { timeout: 15_000 }).toBeGreaterThan(shown);
    expectClean(errors);
  });

  test("list-12: a row selects with aria-selected, Alt+ArrowUp moves it with undo, then the Departments tree shows", async ({ page }) => {
    const errors = await open(page, "list-12");
    const tree = page.getByRole("tree", { name: "Catalogue categories" });
    const rows = tree.getByRole("treeitem");
    const kitchen = rows.filter({ hasText: /^Kitchen/ }).first();
    await kitchen.click();
    await expect(kitchen).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: /Kitchen/ }).first()).toBeVisible();
    const order = async () => (await rows.allInnerTexts()).map((x) => x.split("\n")[0]!.trim());
    const was = await order();
    await kitchen.focus();
    await page.keyboard.press("Alt+ArrowUp");
    await expect.poll(order).not.toEqual(was);
    await toast(page, /Kitchen/).getByRole("button", { name: "Undo" }).click();
    await expect.poll(order).toEqual(was);
    await page.getByRole("radio", { name: "Departments" }).click();
    await expect(page.getByRole("tree", { name: "Departments" })).toBeVisible();
    expectClean(errors);
  });

  test("list-13: completing a task offers undo, and the board and calendar views show the same set", async ({ page }) => {
    const errors = await open(page, "list-13");
    const main = page.getByRole("main");
    const complete = main.getByRole("checkbox", { name: /^Complete / }).first();
    const name = ((await complete.getAttribute("aria-label")) ?? "").replace(/^Complete /, "");
    await complete.click();
    await expect(toast(page, "Completed")).toBeVisible();
    // A done task moves into the collapsed Done group.
    await expect(main.getByRole("checkbox", { name: `Complete ${name}` })).toHaveCount(0);
    await toast(page, "Completed").getByRole("button", { name: "Undo" }).click();
    await expect(main.getByRole("checkbox", { name: `Complete ${name}` })).toBeAttached();
    await page.getByRole("radio", { name: "Board" }).click();
    await expect(page.getByRole("region", { name: "Tasks by status" }).or(page.getByLabel("Tasks by status")).first()).toBeVisible();
    await page.getByRole("radio", { name: "Calendar" }).click();
    await expect(main.getByText(name).first()).toBeAttached();
    // The first radio named "List" is the view switch (the calendar has its own Month/List toggle).
    await page.getByRole("radio", { name: "List" }).first().click();
    await main.getByRole("button", { name }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expectClean(errors);
  });

  test("detail-04: a deal stage change offers undo, and a note saves into the history", async ({ page }) => {
    const errors = await open(page, "detail-04");
    const stage = page.getByRole("combobox", { name: /^Stage of / }).first();
    await stage.click();
    await page.getByRole("option", { name: "Negotiation" }).click();
    await expect(toast(page, "Moved to Negotiation")).toBeVisible();
    const note = "Asked for the Q1 volume forecast before the renewal call.";
    await page.getByRole("textbox", { name: "Add a note" }).fill(note);
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(toast(page, "Note saved")).toBeVisible();
    await expect(page.getByText(note).first()).toBeVisible();
    expectClean(errors);
  });

  test("detail-05: a one-unit refund goes processing to succeeded and the order becomes partially refunded", async ({ page }) => {
    const errors = await open(page, "detail-05");
    await page.getByRole("button", { name: "Refund", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /^One more / }).first().click();
    await dialog.getByRole("button", { name: /^Refund / }).click();
    await expect(dialog).toHaveCount(0);
    await expect(toast(page, "refunded")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Partially refunded").first()).toBeVisible();
    expectClean(errors);
  });

  test("detail-06: a leave request is sent for approval, and a pending request withdraws with undo", async ({ page }) => {
    const errors = await open(page, "detail-06");
    await page.getByRole("tab", { name: /^Time off/ }).click();
    const withdraw = page.getByRole("button", { name: "Withdraw request" });
    const was = await withdraw.count();
    await page.getByRole("button", { name: "Request leave" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/working days? ·/)).toBeVisible();
    await dialog.getByRole("button", { name: "Send request" }).click();
    await expect(toast(page, "Request sent")).toBeVisible();
    await expect(withdraw).toHaveCount(was + 1);
    const n = was + 1;
    await withdraw.first().click();
    await expect(withdraw).toHaveCount(n - 1);
    await toast(page, "Request withdrawn").getByRole("button", { name: "Undo" }).click();
    await expect(withdraw).toHaveCount(n);
    expectClean(errors);
  });

  test("detail-07: a Turkish meta description completes a check, and Save shows the saved state", async ({ page }) => {
    const errors = await open(page, "detail-07");
    const ring = page.getByRole("img", { name: /checks complete$/ }).or(page.getByLabel(/checks complete$/)).first();
    const before = (await ring.getAttribute("aria-label")) ?? "";
    await page.getByRole("radio", { name: "Türkçe" }).click();
    await page.getByRole("textbox", { name: "Meta description" }).fill("Taş yıkamalı keten nevresim, üç ölçü. Nefes alır, ilk günden yumuşak. 1.500 TL üzeri ücretsiz kargo.");
    await expect.poll(() => ring.getAttribute("aria-label")).not.toBe(before);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(toast(page, "Product saved")).toBeVisible({ timeout: 10_000 });
    expectClean(errors);
  });
});

test.describe("admin blocks 4 — settings and forms", () => {
  test.describe.configure({ timeout: 120_000 });

  test("settings-03: a plan change confirms, then invoices select for ZIP and one opens its line items", async ({ page }) => {
    const errors = await open(page, "settings-03");
    await page.getByRole("button", { name: "Change plan" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("radio", { name: /Business/ }).click();
    await expect(dialog.getByText("Due today, before VAT")).toBeVisible();
    await dialog.getByRole("button", { name: "Confirm change" }).click();
    await expect(page.getByText("You're on Business now").first()).toBeVisible({ timeout: 5_000 });
    await page.getByRole("checkbox", { name: "Select all invoices" }).click();
    await expect(page.getByRole("button", { name: "Download as ZIP" })).toBeVisible();
    await page.getByRole("button", { name: /October 2026/ }).click();
    await expect(page.getByRole("dialog").getByText("Extra orders")).toBeVisible();
    expectClean(errors);
  });

  test("settings-04: a new key shows its secret once, and a failed delivery resends to a 401", async ({ page }) => {
    const errors = await open(page, "settings-04");
    await page.getByRole("button", { name: "Create key" }).first().click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name").fill("Courier labels");
    await dialog.getByRole("checkbox", { name: "Stock levels: Write" }).click();
    await dialog.getByRole("button", { name: "Create key" }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/vk_live_/).first()).toBeVisible();
    const done = dialog.getByRole("button", { name: "Done" });
    await expect(done).toBeDisabled();
    await dialog.getByRole("checkbox", { name: /stored the secret/ }).click();
    await done.click();
    await expect(page.getByText("Courier labels", { exact: true }).first()).toBeVisible();
    await page.getByRole("tab", { name: /Failed/ }).click();
    await page.getByRole("button", { name: /stock\.low/ }).first().click();
    await expect(page.getByRole("dialog").getByText("invalid_signature").first()).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Resend" }).click();
    await expect(page.getByText(/answered 401/).first()).toBeVisible({ timeout: 5_000 });
    expectClean(errors);
  });

  test("settings-05: a matrix cell counts as a change, SMS unlocks after the code, and Save confirms", async ({ page }) => {
    const errors = await open(page, "settings-05");
    await page.getByRole("button", { name: /^New order/ }).click();
    await page.getByRole("checkbox", { name: "New order: Email" }).click();
    await expect(page.getByText(/1 unsaved change/).first()).toBeVisible();
    await page.getByRole("button", { name: "Verify" }).first().click();
    await page.getByRole("dialog").getByRole("textbox").fill("482913");
    await expect(page.getByText("Phone verified").first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("checkbox", { name: "SLA about to breach: SMS" })).toBeEnabled();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Notification preferences saved").first()).toBeVisible({ timeout: 5_000 });
    expectClean(errors);
  });

  test("settings-06: a bad key is refused, a good one connects; the sheet saves; a search can come up empty", async ({ page }) => {
    const errors = await open(page, "settings-06");
    await page.getByRole("button", { name: "Connect Postwren" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /Authorize/ }).click();
    await expect(dialog.getByText(/Enter a valid API key/)).toBeVisible();
    await dialog.getByRole("textbox").fill("sk_live_ab12cd34ef");
    await dialog.getByRole("button", { name: /Authorize/ }).click();
    await expect(dialog).toHaveCount(0, { timeout: 5_000 });
    await expect(page.getByRole("button", { name: "Configure Postwren" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Configure Bazaarline" }).first().click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("switch", { name: "Customer questions" }).click();
    await sheet.getByRole("button", { name: "Save changes" }).click();
    await expect(sheet).toHaveCount(0, { timeout: 5_000 });
    await page.getByRole("searchbox", { name: "Search integrations" }).fill("zzz");
    await expect(page.getByText(/Nothing matches/).first()).toBeVisible();
    expectClean(errors);
  });

  test("settings-07: sign out a device, validate the allow list, block an IP, enrol an authenticator", async ({ page }) => {
    const errors = await open(page, "settings-07");
    await page.getByRole("button", { name: "Sign out of Unknown device" }).click();
    await expect(page.getByRole("button", { name: "Sign out of Unknown device" })).toHaveCount(0);
    const addr = page.getByRole("textbox", { name: "Address or range" });
    await addr.fill("300.1.1.1");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(/Use an IPv4 address/).first()).toBeVisible();
    await addr.fill("192.0.2.0/28");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("192.0.2.0/28", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Block IP" }).first().click();
    await expect(page.getByRole("button", { name: /Unblock 192\.0\.2\.77/ })).toBeVisible();
    await page.getByRole("button", { name: "Move to a new phone" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("svg").first()).toBeVisible();
    await page.keyboard.type("481920");
    await expect(dialog).toHaveCount(0, { timeout: 5_000 });
    expectClean(errors);
  });

  test("form-02: an empty segment is refused, then the four steps lead to a scheduled campaign", async ({ page }) => {
    const errors = await open(page, "form-02");
    const next = page.getByRole("button", { name: /^Continue to/ });
    await next.click();
    await expect(page.getByText("Choose who gets this campaign.").first()).toBeVisible();
    await page.getByRole("radio", { name: /Regulars/ }).click();
    await next.click();
    await expect(page.getByRole("heading", { name: "Write the message" })).toBeVisible();
    await page.getByRole("radio", { name: /SMS/ }).click();
    await expect(page.getByText(/segment/).first()).toBeVisible();
    await page.getByRole("radio", { name: /Email/ }).click();
    await next.click();
    await expect(page.getByRole("heading", { name: "Decide when it goes" })).toBeVisible();
    await next.click();
    await expect(page.getByRole("heading", { name: "Check and launch" })).toBeVisible();
    await page.getByRole("button", { name: "Schedule campaign" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Schedule" }).click();
    await expect(page.getByRole("heading", { name: "Campaign scheduled" })).toBeVisible({ timeout: 5_000 });
    expectClean(errors);
  });
});

/**
 * Admin blocks, batch 5 (lists): grouped orders, saved views, booking agenda, media library.
 * Smoke at 1440 and 390, then one main interaction each.
 */
const BLOCKS_LISTS = ["list-04", "list-05", "list-06", "list-07"];

test.describe("admin blocks 5 — list previews", () => {
  for (const name of BLOCKS_LISTS) {
    test(`${name}: 1440 and 390 render with a landmark, no console errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(150_000);
      for (const [width, height] of [[1440, 900], [390, 844]] as const) {
        await page.setViewportSize({ width, height });
        const errors = await openBlock(page, name);
        expect((await page.locator("body").innerText()).trim().length, `${name} is empty at ${width}`).toBeGreaterThan(40);
        await expect(page.getByRole("main").first(), `${name} has a landmark at ${width}`).toBeAttached();
        expect(await seriousA11y(page), `${name} axe at ${width}`).toEqual([]);
        expect(await overflowX(page), `${name} overflows at ${width}`).toBeLessThanOrEqual(1);
        expectClean(errors);
      }
    });
  }
});

test.describe("admin blocks 5 — lists", () => {
  test.describe.configure({ timeout: 120_000 });

  test("list-04: a customer group collapses and expands, an order opens its lines, grouping by status regroups", async ({ page }) => {
    const errors = await open(page, "list-04");
    const table = page.getByRole("table", { name: /Orders grouped by customer/ });
    const group = table.getByRole("button", { name: /^Aslı Korkmaz/ });
    await expect(group).toHaveAttribute("aria-expanded", "true");
    const lines = table.getByRole("button", { name: /^Items in order #KL-/ });
    const shown = await lines.count();
    expect(shown).toBeGreaterThan(0);
    await group.click();
    await expect(group).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => lines.count()).toBeLessThan(shown);
    await group.click();
    const first = lines.first();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(table.getByRole("list", { name: /^Lines of #KL-/ }).first()).toBeVisible();
    await page.getByRole("button", { name: "Expand all groups" }).click();
    await expect(page.getByRole("button", { name: "Collapse all groups" })).toBeVisible();
    await page.getByRole("combobox", { name: "Group by" }).click();
    await page.getByRole("option", { name: "Group: Status" }).click();
    await expect(page.getByRole("table", { name: /Orders grouped by status/ }).getByRole("button", { name: /^Delivered/ })).toBeVisible();
    await expect(page.getByText("Grand total")).toBeVisible();
    expectClean(errors);
  });

  test("list-05: a view from the rail applies with its count, a filter change offers save, and the share dialog copies a link", async ({ page }) => {
    const errors = await open(page, "list-05");
    const rail = page.getByRole("navigation", { name: "Saved views" });
    await rail.getByRole("button", { name: /^Hot leads/ }).click();
    await expect(rail.getByRole("button", { name: /^Hot leads/ })).toHaveAttribute("aria-current", "true");
    const list = page.getByRole("region", { name: "Contact list" });
    await expect(list.getByRole("heading", { name: /Hot leads/ })).toBeVisible();
    await list.getByRole("searchbox").fill("example");
    await expect(rail.getByText("Unsaved changes")).toBeVisible({ timeout: 5_000 });
    await rail.getByRole("button", { name: "Discard changes" }).click();
    await expect(rail.getByText("Unsaved changes")).toHaveCount(0);
    await list.getByRole("button", { name: "Share" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("textbox").first()).toHaveValue(/sv=hot/);
    await dialog.getByRole("button", { name: "Copy link" }).click();
    await expect(toast(page, "Link copied")).toBeVisible();
    expectClean(errors);
  });

  test("list-06: check-in shows in the agenda with undo, and a new booking refuses an overlapping slot", async ({ page }) => {
    const errors = await open(page, "list-06");
    const today = page.getByRole("region", { name: /^Today/ });
    await expect(today).toBeVisible();
    await today.getByRole("button", { name: "Check in Quarterly business review" }).click();
    await expect(toast(page, "checked in")).toBeVisible();
    await expect(today.getByRole("button", { name: "Check in Quarterly business review" })).toHaveCount(0);
    await toast(page, "checked in").getByRole("button", { name: "Undo" }).click();
    await expect(today.getByRole("button", { name: "Check in Quarterly business review" })).toBeVisible();
    await page.getByRole("button", { name: "New booking" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: /What is it for/ }).fill("Client workshop");
    // Default slot: Studio 3, tomorrow 10:00 for an hour — overlaps the bookkeeping clinic.
    await dialog.getByRole("button", { name: "Book room" }).click();
    await expect(dialog.getByText(/is booked 10:00–10:45/)).toBeVisible();
    await dialog.getByRole("radio", { name: "30 min" }).click();
    await dialog.getByRole("combobox", { name: "Starts" }).click();
    await page.getByRole("option", { name: "12:00" }).click();
    await dialog.getByRole("button", { name: "Book room" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(toast(page, "Booked Studio 3")).toBeVisible();
    await expect(page.getByRole("region", { name: /^Tomorrow/ }).getByRole("button", { name: "Client workshop", exact: true })).toBeVisible();
    expectClean(errors);
  });

  test("list-07: sample files go through the upload queue, then a file opens in the details panel", async ({ page }) => {
    const errors = await open(page, "list-07");
    const library = page.getByLabel("Media library");
    await expect(library.getByRole("gridcell").first()).toBeVisible({ timeout: 15_000 });
    const before = await library.getByRole("gridcell").count();
    await page.getByRole("button", { name: "Add sample files" }).click();
    await expect(library.getByText("Uploads").first()).toBeVisible();
    await expect(library.getByRole("gridcell", { name: /glaze-test-tiles\.png/ })).toBeVisible({ timeout: 20_000 });
    await expect.poll(() => library.getByRole("gridcell").count(), { timeout: 20_000 }).toBeGreaterThan(before);
    await library.getByRole("navigation", { name: /Folder/ }).getByRole("button", { name: /Press kit/ }).click();
    await expect(library.getByRole("gridcell", { name: /brand-guidelines-v3\.pdf/ })).toBeVisible();
    await library.getByRole("gridcell", { name: /brand-guidelines-v3\.pdf/ }).dblclick();
    await expect(page.getByRole("complementary", { name: "File details" })).toBeVisible();
    expectClean(errors);
  });
});

/**
 * Admin blocks, batch 5 (onboarding): launch checklist with inline tasks, contact import, product tour.
 * Smoke at 1440 and 390, then one main interaction each.
 */
const BLOCKS_ONBOARDING = ["onboarding-03", "onboarding-04", "onboarding-05"];

test.describe("admin blocks 5 — onboarding previews", () => {
  for (const name of BLOCKS_ONBOARDING) {
    test(`${name}: 1440 and 390 render with a landmark, no console errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(150_000);
      for (const [width, height] of [[1440, 900], [390, 844]] as const) {
        await page.setViewportSize({ width, height });
        const errors = await openBlock(page, name);
        expect((await page.locator("body").innerText()).trim().length, `${name} is empty at ${width}`).toBeGreaterThan(40);
        await expect(page.getByRole("main").first(), `${name} has a landmark at ${width}`).toBeAttached();
        expect(await seriousA11y(page), `${name} axe at ${width}`).toEqual([]);
        expect(await overflowX(page), `${name} overflows at ${width}`).toBeLessThanOrEqual(1);
        expectClean(errors);
      }
    });
  }
});

test.describe("admin blocks 5 — onboarding", () => {
  test.describe.configure({ timeout: 120_000 });

  test("onboarding-03: a bad postcode is refused, the address saves inline, the rail jumps to a task and an optional one is skipped", async ({ page }) => {
    const errors = await open(page, "onboarding-03");
    const rail = page.getByRole("region", { name: "Launch progress" });
    await expect(rail.getByText("1/8")).toBeVisible();
    await page.getByRole("textbox", { name: /Street address/ }).fill("Moda Cd. No: 18, Depo 2");
    await page.getByRole("textbox", { name: /Postcode/ }).fill("347");
    await page.getByRole("button", { name: "Save address" }).click();
    await expect(page.getByText("Postcodes have 5 digits.")).toBeVisible();
    await page.getByRole("textbox", { name: /Postcode/ }).fill("34710");
    await page.getByRole("button", { name: "Save address" }).click();
    await expect(toast(page, "Shipping origin — saved")).toBeVisible();
    await expect(rail.getByText("2/8")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save tax settings" })).toBeVisible();
    await rail.getByRole("button", { name: /Invite your team, not started, optional/ }).click();
    await page.getByRole("button", { name: "Skip for now" }).click();
    await expect(rail.getByRole("button", { name: /Invite your team, skipped/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Go live/ }).first()).toBeDisabled();
    expectClean(errors);
  });

  test("onboarding-04: the sample export maps, a bad email is fixed in the review table, and the import reports", async ({ page }) => {
    const errors = await open(page, "onboarding-04");
    const next = page.getByRole("button", { name: "Next", exact: true });
    await next.click();
    await expect(page.getByText("Choose a file, or use the sample export.").first()).toBeVisible();
    await page.getByRole("button", { name: "Use the sample export" }).click();
    await expect(page.getByText("14 rows · 9 columns")).toBeVisible();
    await next.click();
    await expect(page.getByText("8 of 9 columns mapped")).toBeVisible();
    await expect(page.getByRole("combobox", { name: /Column “E-posta” maps to/ })).toContainText("Email");
    await next.click();
    await expect(page.getByText("14 rows · 4 errors · 1 warnings")).toBeVisible();
    const cell = page.getByRole("textbox", { name: "Email, row 4" });
    await cell.fill("mert.erden@orchardoak.example.com");
    await cell.press("Tab");
    await expect(page.getByText("14 rows · 3 errors · 1 warnings")).toBeVisible();
    await next.click();
    await page.getByRole("radio", { name: /Keep mine/ }).click();
    await page.getByRole("button", { name: "Import 11 contacts" }).click();
    await expect(page.getByRole("heading", { name: "Import finished" })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/9 new contacts · 0 updated · 3 skipped for errors/)).toBeVisible();
    expectClean(errors);
  });

  test("onboarding-05: the basics tour runs with the keyboard and is marked finished; an order is packed", async ({ page }) => {
    const errors = await open(page, "onboarding-05");
    await page.getByRole("button", { name: "Take the tour" }).click();
    const card = page.getByRole("dialog");
    await expect(card).toContainText("Step 1 of 7");
    await page.keyboard.press("ArrowRight");
    await expect(card).toContainText("Search runs everything");
    await expect(page.locator("[data-slot=tour-spotlight]")).toBeVisible();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect(card).toContainText("Step 7 of 7");
    await card.getByRole("button", { name: "Finish" }).click();
    await expect(card).toHaveCount(0);
    await expect(toast(page, "“The basics” finished")).toBeVisible();
    await expect(page.getByText("1 of 2 finished")).toBeVisible();
    await expect(page.getByRole("button", { name: "Replay: The basics" })).toBeVisible();
    const packButtons = page.getByRole("button", { name: /^Mark #KL-\d+ packed/ });
    await expect(packButtons).toHaveCount(3);
    await packButtons.first().click();
    await expect(packButtons).toHaveCount(2);
    await expect(page.getByRole("tab", { name: /Packed/ })).toContainText("1");
    expectClean(errors);
  });
});

/**
 * Commerce blocks: product detail, cart + mini-cart, one-page checkout and order confirmation
 * (Kiln & Linen storefront, TRY, EN / TR).
 */
const BLOCKS_COMMERCE = ["product-01", "cart-01", "checkout-01", "order-confirmation-01"];

test.describe("commerce blocks — previews", () => {
  for (const name of BLOCKS_COMMERCE) {
    test(`${name}: 1440 and 390 render with a landmark, no console errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(150_000);
      for (const [width, height] of [[1440, 900], [390, 844]] as const) {
        await page.setViewportSize({ width, height });
        const errors = await openBlock(page, name);
        expect((await page.locator("body").innerText()).trim().length, `${name} is empty at ${width}`).toBeGreaterThan(40);
        await expect(page.getByRole("main").first(), `${name} has a landmark at ${width}`).toBeAttached();
        expect(await seriousA11y(page), `${name} axe at ${width}`).toEqual([]);
        expect(await overflowX(page), `${name} overflows at ${width}`).toBeLessThanOrEqual(1);
        expectClean(errors);
      }
    });
  }
});

test.describe("commerce blocks", () => {
  test.describe.configure({ timeout: 120_000 });

  test("product-01: variant stock drives the button, add to cart toasts and counts, tabs switch, Turkish copy", async ({ page }) => {
    const errors = await open(page, "product-01");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tide stoneware plate");
    await expect(page.getByRole("button", { name: "Cart, 7 items" })).toBeVisible();
    await page.getByRole("radio", { name: /Oat/ }).click();
    await page.getByRole("radio", { name: /Platter/ }).click();
    await expect(page.getByRole("button", { name: "Notify me when back" })).toBeVisible();
    await page.getByRole("radio", { name: /Dinner/ }).click();
    await expect(page.getByText("Only 2 left in Oat.")).toBeVisible();
    await page.getByRole("button", { name: /^Add to cart/ }).click();
    await expect(toast(page, "Added to your cart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 8 items" })).toBeVisible();
    await page.getByRole("button", { name: /Photo 2 of 3/ }).click();
    await expect(page.getByRole("button", { name: /Photo 2 of 3/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("tab", { name: /Size guide/ }).click();
    await expect(page.getByRole("table", { name: "Tide plate sizes" })).toBeVisible();
    await page.getByRole("button", { name: "Cart, 8 items" }).click();
    await expect(page.getByRole("dialog", { name: /Your cart \(8\)/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Türkçe/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gelgit taşkil tabak");
    await expect(page.getByRole("button", { name: /^Sepete ekle/ })).toContainText("₺");
    expectClean(errors);
  });

  test("cart-01: quantity unlocks free delivery, a bad and a good code, remove with undo, empty state", async ({ page }) => {
    const errors = await open(page, "cart-01");
    await expect(page.getByText(/away from free delivery/)).toBeVisible();
    const mug = page.getByRole("spinbutton", { name: "Quantity of Speckled stoneware mug" });
    await mug.fill("3");
    await mug.press("Tab");
    await expect(page.getByText("Free standard delivery unlocked")).toBeVisible();
    const code = page.getByRole("textbox", { name: "Discount code" });
    await code.fill("nope");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("“NOPE” isn’t a valid code.")).toBeVisible();
    await code.fill("kiln10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: "Remove code KILN10" })).toBeVisible();
    await page.getByRole("button", { name: "Remove Beeswax pillar candles (3)" }).click();
    await expect(page.getByText("Beeswax pillar candles (3) removed from your cart.")).toBeVisible();
    await page.getByRole("button", { name: /^Undo: put Beeswax/ }).click();
    await expect(page.getByRole("button", { name: "Remove Beeswax pillar candles (3)" })).toBeFocused();
    for (const n of ["Tide stoneware plate", "Speckled stoneware mug", "Beeswax pillar candles (3)"]) await page.getByRole("button", { name: `Remove ${n}` }).click();
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    expectClean(errors);
  });

  test("checkout-01: an empty submit focuses the first error, a full Turkish order with a card places and confirms", async ({ page }) => {
    const errors = await open(page, "checkout-01");
    await page.getByRole("button", { name: /^Place order/ }).click();
    await expect(toast(page, /Check \d+ fields before placing the order/)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Email/ })).toBeFocused();
    await page.getByRole("textbox", { name: /Email/ }).fill("asli.korkmaz@example.com");
    await page.getByRole("textbox", { name: /Mobile/ }).fill("5320000000");
    await page.getByRole("textbox", { name: /First name/ }).fill("Aslı");
    await page.getByRole("textbox", { name: /Last name/ }).fill("Korkmaz");
    await page.getByRole("combobox", { name: /Province/ }).first().selectOption("İstanbul");
    await page.getByRole("combobox", { name: /District/ }).first().selectOption("Kadıköy");
    await page.getByRole("textbox", { name: /Street address/ }).first().fill("Caferağa Mah. Moda Cad. No: 00");
    await page.getByRole("textbox", { name: /Name on card/ }).fill("ASLI KORKMAZ");
    const number = page.getByRole("textbox", { name: /Card number/ });
    await number.fill("4242424242424241");
    await number.press("Tab");
    await expect(page.getByText("This card number isn’t valid. Check the digits.")).toBeVisible();
    await number.fill("4242424242424242");
    await expect(number).toHaveValue("4242 4242 4242 4242");
    await expect(page.getByText("Visa", { exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: /Expiry/ }).fill("1225");
    await page.getByRole("textbox", { name: /Expiry/ }).press("Tab");
    await expect(page.getByText("This card has expired.")).toBeVisible();
    await page.getByRole("textbox", { name: /Expiry/ }).fill("1229");
    await page.getByRole("textbox", { name: /Security code/ }).fill("123");
    await page.getByRole("radio", { name: /3 months/ }).click();
    await page.getByRole("checkbox", { name: /distance sales agreement/ }).click();
    await page.getByRole("button", { name: /^Place order/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Thank you, Aslı. Your order is in." })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/Card •••• 4242 · 3 months/)).toBeVisible();
    expectClean(errors);
  });

  test("order-confirmation-01: copy the order number, a short password is refused, an account is created", async ({ page }) => {
    const errors = await open(page, "order-confirmation-01");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your order is confirmed");
    await expect(page.getByText("Packing in İzmir")).toBeVisible();
    await page.getByRole("button", { name: "Copy order number" }).click();
    await expect(toast(page, "Order number KL-30418 copied")).toBeVisible();
    const pw = page.getByLabel("Password");
    await pw.fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    await pw.fill("kiln-and-linen-26");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Account created for" })).toBeVisible();
    expectClean(errors);
  });
});
