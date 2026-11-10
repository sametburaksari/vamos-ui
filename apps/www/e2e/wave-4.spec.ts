import { test, expect, type Page } from "@playwright/test";
import { collectConsoleErrors, gotoWithRetry, onlyRestartNoise, seriousA11y, stubExternalRequests, waitForServer } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubExternalRequests(page);
});

/**
 * Wave 4: blocks (whole screens). App shells, dashboards, auth, list/board, detail, settings and
 * forms, onboarding, empty/error states, website pages and marketing sections, plus the /blocks
 * browser (category + domain filter, lazy previews). Each block preview renders at desktop and
 * phone width without console errors, serious axe violations or horizontal page scroll, plus one
 * key interaction per interactive block.
 */

const BLOCKS = [
  "shell-01", "shell-02", "shell-03", "shell-04",
  "dashboard-02", "dashboard-03", "dashboard-04", "dashboard-05",
  "login-02", "signup-01", "forgot-password-01", "otp-01", "magic-link-01", "select-workspace-01",
  "list-01", "list-02", "list-03", "board-01",
  "detail-01", "detail-02", "detail-03", "editor-01",
  "settings-01", "settings-02", "users-roles-01", "form-01",
  "onboarding-01", "onboarding-02",
  "empty-01", "empty-02", "error-404-01", "error-500-01", "maintenance-01", "no-access-01",
  "site-saas-01", "site-restaurant-01", "site-spa-01", "site-agency-01", "page-pricing-01", "page-contact-01",
  "sections-01",
];

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

/** Opens /view/<name>: 200, non-empty, hydrated. Returns the live console-error array. */
async function openBlock(page: Page, name: string) {
  const errors = collectConsoleErrors(page);
  const load = async () => {
    const res = await gotoWithRetry(page, `/view/${name}`);
    expect(res?.status(), name).toBe(200);
    return waitForBlockHydration(page).then(() => true, () => false);
  };
  let ok = await load();
  if (!ok || onlyRestartNoise(errors)) {
    test.info().annotations.push({ type: "dev-server-restart", description: name });
    await waitForServer(page);
    errors.length = 0;
    ok = await load();
  }
  if (!ok) throw new Error(`${name}: never hydrated. Console: ${errors.join(" | ")}`);
  // A one-off stale-SSR hydration mismatch right after an on-demand compile (PLAN §11): reload once.
  if (errors.length && errors.every((e) => HYDRATION.test(e))) {
    test.info().annotations.push({ type: "flaky-hydration", description: name });
    errors.length = 0;
    if (!(await load())) throw new Error(`${name}: never hydrated after reload. Console: ${errors.join(" | ")}`);
  }
  return errors;
}

const HYDRATION = /Hydration failed|didn't match the client|hydration mismatch/i;

/** Document width beyond the viewport, in px (0 = no horizontal page scroll). */
const overflowX = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("wave 4 — block previews", () => {
  for (const name of BLOCKS) {
    test(`${name}: renders at 1280 and 390, no console errors, no serious axe, no sideways scroll`, async ({ page }) => {
      test.setTimeout(150_000);
      const check = async () => {
        await page.setViewportSize({ width: 1280, height: 900 });
        const errors = await openBlock(page, name);
        const text = (await page.locator("body").innerText()).trim();
        expect(text.length, `${name} is empty`).toBeGreaterThan(40);
        await expect(page.locator("main, h1, h2").first(), `${name} has a main landmark or heading`).toBeAttached();
        const axe = await seriousA11y(page);
        const wide = await overflowX(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(250);
        const narrow = await overflowX(page);
        errors.stop();
        return { axe, wide, narrow, errors: [...errors] };
      };
      let r = await check();
      // First render after an on-demand compile can hydrate once from a stale SSR module graph
      // (useId suffixes differ) and never again (PLAN §11). Reload once; a mismatch that survives fails.
      if (r.errors.length && r.errors.every((e) => HYDRATION.test(e))) {
        test.info().annotations.push({ type: "flaky-hydration", description: name });
        r = await check();
      }
      if (onlyRestartNoise(r.errors)) {
        test.info().annotations.push({ type: "dev-server-restart", description: name });
        await waitForServer(page);
        r = await check();
      }
      expect(r.axe, name).toEqual([]);
      expect(r.errors, name).toEqual([]);
      expect(r.wide, `${name} overflows at 1280`).toBeLessThanOrEqual(1);
      expect(r.narrow, `${name} overflows at 390`).toBeLessThanOrEqual(1);
    });
  }
});

/** The /blocks browser: category + domain filters live in the query string, previews mount lazily. */
test.describe("wave 4 — /blocks browser", () => {
  test("category filter narrows the list, writes the query string and reads it back", async ({ page }) => {
    // /blocks boots the first previews (whole apps) in iframes; on the dev server that is slow.
    test.setTimeout(180_000);
    const errors = collectConsoleErrors(page);
    await gotoWithRetry(page, "/blocks");
    await waitForBlockHydration(page);
    const live = page.locator("main [aria-live='polite']").first();
    await expect(live).toHaveText(/43 blocks shown/);
    await page.getByRole("radio", { name: /^Authentication/ }).click();
    await expect(page).toHaveURL(/category=Authentication/);
    await expect(live).toHaveText(/7 blocks shown/);
    // The mounted previews keep "load" pending for a while; the filter state only needs the DOM.
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
    await waitForBlockHydration(page);
    await expect(page.getByRole("radio", { name: /^Authentication/ })).toHaveAttribute("aria-checked", "true");
    await expect(live).toHaveText(/7 blocks shown/);
    // Only previews near the viewport mount.
    expect(await page.locator("main iframe").count()).toBeLessThan(7);
    errors.stop();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — app shells", () => {
  test("shell-01: below 768px the sidebar opens as a sheet; picking a link closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await openBlock(page, "shell-01");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Navigation" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("link", { name: "Dashboard" }).first().click();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator("header")).toContainText("Dashboard");
    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("shell-01: the desktop sidebar collapses to a rail and expands again", async ({ page }) => {
    const errors = await openBlock(page, "shell-01");
    await page.getByRole("button", { name: "Collapse menu" }).click();
    await expect(page.getByRole("button", { name: "Expand menu" })).toBeVisible();
    await page.getByRole("button", { name: "Expand menu" }).click();
    await expect(page.getByRole("button", { name: "Collapse menu" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("shell-02: the icon rail expands and collapses", async ({ page }) => {
    const errors = await openBlock(page, "shell-02");
    // A toggle button: pressed = collapsed to the 64px rail (the default).
    const toggle = page.getByRole("button", { name: "Collapse sidebar" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });

  test("shell-03: on a phone the top navigation moves into a sheet menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await openBlock(page, "shell-03");
    await page.getByRole("button", { name: "Open menu" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: /Payslips/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("shell-04: picking another app in the rail swaps the app menu", async ({ page }) => {
    const errors = await openBlock(page, "shell-04");
    const rail = page.getByRole("navigation", { name: "Apps" });
    await expect(page.getByRole("navigation", { name: "Work menu" })).toBeVisible();
    await rail.getByRole("link", { name: /^CRM/ }).or(rail.getByRole("button", { name: /^CRM/ })).first().click();
    await expect(page.getByRole("navigation", { name: "CRM menu" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — dashboards", () => {
  for (const [name, group, option] of [
    ["dashboard-02", "Filter deals", "At risk"],
    ["dashboard-03", "Filter by department", "Eng"],
    ["dashboard-04", "Filter projects", "Needs attention"],
    ["dashboard-05", "Period", "7D"],
  ] as const) {
    test(`${name}: the "${group}" toggle selects ${option}`, async ({ page }) => {
      const errors = await openBlock(page, name);
      const item = page.getByRole("radiogroup", { name: group }).getByRole("radio", { name: option });
      await item.click();
      await expect(item).toHaveAttribute("aria-checked", "true");
      expect(errors).toEqual([]);
    });
  }

  test("dashboard-03: celebration tabs switch with the arrow keys", async ({ page }) => {
    const errors = await openBlock(page, "dashboard-03");
    const first = page.getByRole("tab", { name: /Birthdays/ });
    await first.click();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Anniversaries/ })).toHaveAttribute("aria-selected", "true");
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — authentication", () => {
  test("login-02: signing in without a password shows the error and focuses the field", async ({ page }) => {
    const errors = await openBlock(page, "login-02");
    await page.getByRole("button", { name: /^Sign in$/ }).click();
    await expect(page.getByText("Enter your password.")).toBeVisible();
    const password = page.getByRole("textbox", { name: "Password" });
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    expect(errors).toEqual([]);
  });

  test("signup-01: typing a password updates the strength meter", async ({ page }) => {
    const errors = await openBlock(page, "signup-01");
    const meter = page.getByRole("progressbar").first();
    await page.getByLabel("Password", { exact: true }).fill("abc");
    const weak = await meter.getAttribute("aria-valuenow");
    await page.getByLabel("Password", { exact: true }).fill("Harbour-Lights-2026!");
    await expect(meter).not.toHaveAttribute("aria-valuenow", weak ?? "");
    await expect(meter).toHaveAttribute("aria-valuetext", /Good|Strong/);
    expect(errors).toEqual([]);
  });

  test("forgot-password-01: a valid email moves on to Check your inbox", async ({ page }) => {
    const errors = await openBlock(page, "forgot-password-01");
    await page.getByLabel("Email").first().fill("maya.chen@northwind.io");
    await page.getByRole("button", { name: /reset link|Send/i }).first().click();
    await expect(page.getByText("Check your inbox").first()).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test("otp-01: typing all six digits verifies the code", async ({ page }) => {
    const errors = await openBlock(page, "otp-01");
    const input = page.getByRole("textbox", { name: /Verification code/ }).first();
    await input.click();
    await page.keyboard.type("482913");
    await expect(page.getByText("Verified")).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test("magic-link-01: an invalid email is rejected", async ({ page }) => {
    const errors = await openBlock(page, "magic-link-01");
    // Opens on the "Check your email" step; go back to the request form.
    await page.getByRole("button", { name: "Use a different email" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("maya@");
    await page.getByRole("button", { name: /sign-in link|Send|Email me/i }).first().click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("select-workspace-01: a search with no match offers Clear search", async ({ page }) => {
    const errors = await openBlock(page, "select-workspace-01");
    const search = page.getByRole("searchbox", { name: "Find a workspace" }).or(page.getByRole("textbox", { name: "Find a workspace" })).first();
    await search.fill("zzqx");
    await expect(page.getByText("Check the spelling, or ask an admin for an invite.")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(search).toHaveValue("");
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — list, board, detail", () => {
  for (const [name, placeholder, query] of [
    ["list-01", "Search titles and tags…", "zzqx-nothing"],
    ["list-02", "Search name, email or company…", "zzqx-nothing"],
  ] as const) {
    test(`${name}: search filters the table rows`, async ({ page }) => {
      const errors = await openBlock(page, name);
      const rows = page.locator("main table tbody tr");
      const before = await rows.count();
      expect(before).toBeGreaterThan(1);
      await page.getByPlaceholder(placeholder).fill(query);
      await expect.poll(async () => rows.count(), { timeout: 5_000 }).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }

  test("list-03: the layout switch moves from cards to a table", async ({ page }) => {
    const errors = await openBlock(page, "list-03");
    await page.getByRole("radio", { name: "Table" }).click();
    await expect(page.locator("main table").first()).toBeVisible();
    await page.getByRole("radio", { name: "Cards" }).click();
    await expect(page.locator("main table")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("board-01: the pipeline renders its stage columns with deal cards", async ({ page }) => {
    const errors = await openBlock(page, "board-01");
    const board = page.getByRole("region", { name: "Deals pipeline" }).or(page.locator("[aria-label='Deals pipeline']")).first();
    await expect(board).toBeVisible();
    expect((await board.innerText()).length).toBeGreaterThan(100);
    expect(errors).toEqual([]);
  });

  test("detail-01: the Deals tab shows the contact's deals", async ({ page }) => {
    const errors = await openBlock(page, "detail-01");
    await page.getByRole("tab", { name: /^Deals/ }).click();
    await expect(page.getByRole("tabpanel").getByRole("table", { name: "Deals with Laura Callahan" }).or(page.getByLabel("Deals with Laura Callahan")).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("detail-02: profile tabs switch to Time off", async ({ page }) => {
    const errors = await openBlock(page, "detail-02");
    const tab = page.getByRole("tab", { name: /^Time off/ });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    expect(errors).toEqual([]);
  });

  test("editor-01: typing in the title marks the post as changed", async ({ page }) => {
    const errors = await openBlock(page, "editor-01");
    const status = page.locator("[data-slot='save-status']").first();
    const before = (await status.count()) ? await status.innerText() : "";
    const title = page.getByRole("textbox", { name: "Post title" });
    await title.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" (draft)");
    await expect(title).toContainText("(draft)");
    if (before) await expect(status).not.toHaveText(before);
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — settings, forms, onboarding", () => {
  test("settings-01: editing a field raises the save bar; Discard hides it", async ({ page }) => {
    const errors = await openBlock(page, "settings-01");
    await page.getByLabel("Workspace name").fill("Northwind Studio Ltd");
    const bar = page.getByRole("region", { name: "Unsaved changes" });
    await expect(bar).toBeVisible();
    await bar.getByRole("button", { name: /Discard|Reset|Cancel/ }).first().click();
    await expect(bar).toBeHidden();
    await expect(page.getByLabel("Workspace name")).toHaveValue("Northwind Studio");
    expect(errors).toEqual([]);
  });

  test("users-roles-01: Invite people opens a dialog that Escape closes", async ({ page }) => {
    const errors = await openBlock(page, "users-roles-01");
    const trigger = page.getByRole("button", { name: "Invite people" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Invite people" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("form-01: Continue moves to the dates step", async ({ page }) => {
    const errors = await openBlock(page, "form-01");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "When are you away?" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("onboarding-02: Continue without a workspace name shows the error", async ({ page }) => {
    const errors = await openBlock(page, "onboarding-02");
    await page.getByLabel("Workspace name").fill("");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Give the workspace a name.")).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — empty and error states", () => {
  test("no-access-01: sending a request confirms it", async ({ page }) => {
    const errors = await openBlock(page, "no-access-01");
    await page.getByRole("button", { name: "Send request" }).click();
    await expect(page.getByText("Request sent").first()).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test("maintenance-01: Notify me with an email confirms it", async ({ page }) => {
    const errors = await openBlock(page, "maintenance-01");
    await page.getByPlaceholder("you@company.com").fill("ops@northwind.io");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("We’ll email you").first()).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test("error-500-01: Try again shows the retry state", async ({ page }) => {
    const errors = await openBlock(page, "error-500-01");
    const retry = page.getByRole("button", { name: /Try again|Retry/ }).first();
    await retry.click();
    await expect(page.getByRole("button", { name: /Retrying/ }).or(page.getByText(/Retrying/)).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("wave 4 — website pages", () => {
  for (const name of ["site-saas-01", "site-restaurant-01", "site-spa-01", "site-agency-01", "page-pricing-01", "page-contact-01"]) {
    test(`${name}: the TR link swaps the page language without a reload`, async ({ page }) => {
      const errors = await openBlock(page, name);
      const before = await page.locator("body").innerText();
      await page.locator('a[hreflang="tr"]:visible').first().click();
      await expect(page).toHaveURL(/lang=tr/);
      await expect.poll(async () => (await page.locator("body").innerText()) !== before).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});
