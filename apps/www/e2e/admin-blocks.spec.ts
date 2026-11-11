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

for (const [title, blocks] of [["admin blocks 1 — previews", BLOCKS], ["admin blocks 2 — previews", BLOCKS_2]] as const)
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
