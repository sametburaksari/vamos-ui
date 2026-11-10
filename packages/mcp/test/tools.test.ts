import { afterEach, describe, expect, it } from "vitest";
import { RULES } from "../src/guidance.js";
import { Registry } from "../src/registry.js";
import {
  ToolError,
  buildInstallCommand,
  formatIssues,
  getBlock,
  getItem,
  getRules,
  getTheming,
  installCommand,
  listItems,
  planScreen,
  search,
  verifyCode,
} from "../src/tools.js";
import { setVerifier } from "../src/verify.js";
import { fixtureRegistry } from "./helpers.js";

const registry = fixtureRegistry();

describe("list_items", () => {
  it("groups by type and section", async () => {
    const out = await listItems(registry);
    expect(out).toMatch(/## Blocks \(3\)/);
    expect(out).toMatch(/### Dashboards/);
    expect(out).toMatch(/## Components \(6\)/);
    expect(out).toMatch(/### Overlays & feedback\n- `dialog` Dialog/);
  });

  it("filters by type, group, category and tag", async () => {
    expect(await listItems(registry, { type: "block" })).not.toMatch(/`button`/);
    const overlays = await listItems(registry, { group: "overlays" });
    expect(overlays).toMatch(/^1 item/);
    expect(await listItems(registry, { category: "auth" })).toMatch(/`login-01`/);
    expect(await listItems(registry, { tag: "crm" })).toMatch(/`list-01`/);
  });

  it("explains empty results with the available groups", async () => {
    const out = await listItems(registry, { group: "nonexistent" });
    expect(out).toMatch(/No items match group=nonexistent/);
    expect(out).toMatch(/Component groups: .*Charts/);
  });
});

describe("search", () => {
  it("ranks the best match first and points to get_item", async () => {
    const out = await search(registry, { query: "date range" });
    expect(out.split("\n")[2]).toMatch(/^- `date-range-picker`/);
    expect(out).toMatch(/get_item/);
  });

  it("finds by guidance text and Turkish words", async () => {
    expect(await search(registry, { query: "bulk actions" })).toMatch(/`data-table`|`list-01`/);
    expect((await search(registry, { query: "giriş" })).split("\n")[2]).toMatch(/`login-01`/);
    expect(await search(registry, { query: "tarih aralığı" })).toMatch(/`date-range-picker`/);
  });

  it("filters by type and handles no results", async () => {
    expect(await search(registry, { query: "table", type: "block" })).not.toMatch(/`data-table`/);
    expect(await search(registry, { query: "zzzqqq" })).toMatch(/Nothing matches/);
    await expect(search(registry, { query: "  " })).rejects.toBeInstanceOf(ToolError);
  });
});

describe("get_item", () => {
  it("renders usage, guidance, props and examples but no source by default", async () => {
    const out = await getItem(registry, { name: "button" });
    expect(out).toMatch(/^# Button \(`button`\)/);
    expect(out).toMatch(/Install: `npx vamos-ui add button --registry /);
    expect(out).toMatch(/## When to use\n- Any action/);
    expect(out).toMatch(/\| `variant` \| `"primary" \\\| "secondary" \\\| "ghost"` \| `"secondary"` \|/);
    expect(out).toMatch(/### Primary and secondary/);
    expect(out).toMatch(/- components\/button.tsx \(\d+ B\)/);
    expect(out).not.toMatch(/export function Button/);
  });

  it("includes files when asked", async () => {
    const out = await getItem(registry, { name: "button", include: ["files"] });
    expect(out).toMatch(/### components\/button.tsx\n\n```tsx\nimport \{ cn \}/);
    expect(out).not.toMatch(/## Props/);
  });

  it("returns raw JSON", async () => {
    const json = JSON.parse(await getItem(registry, { name: "dialog", format: "json" }));
    expect(json.registryDependencies).toContain("lib-layer");
    expect(json.files[0].content).toMatch(/omitted/);
  });

  it("suggests names for typos", async () => {
    await expect(getItem(registry, { name: "buton" })).rejects.toThrow(/Did you mean: `button`/);
  });
});

describe("get_block", () => {
  it("returns source and the kit components used", async () => {
    const out = await getBlock(registry, { name: "dashboard-01" });
    expect(out).toMatch(/export default function Page/);
    expect(out).toMatch(/Kit components used: `area-chart`, `data-table`, `badge`, `button`/);
  });
  it("rejects non-blocks", async () => {
    await expect(getBlock(registry, { name: "button" })).rejects.toThrow(/is a component, not a block/);
  });
});

describe("get_theming / get_rules", () => {
  it("describes the axes, brand accents and tokens", async () => {
    const out = await getTheming(registry);
    for (const attr of ["data-material", "data-accent", "data-density", "data-font", 'class="dark"']) expect(out).toContain(attr);
    expect(out).toMatch(/<html lang="en" class="dark" data-material="solid" data-accent="lime"/);
    expect(out).toMatch(/--accent-ink-light/);
    expect(out).toMatch(/\| `--fg` \| `#12150f` \| `#f1f3ec` \| Primary text \|/);
    expect(await getTheming(registry, { include_tokens: false })).not.toMatch(/## Tokens/);
  });

  it("covers the core rules", () => {
    const rules = getRules();
    expect(rules).toBe(RULES);
    for (const phrase of ["Tokens only", "Accent is scarce", "glass budget", "Density", "purple", "emoji", "Inter", "card walls", "Realistic content", "aria-label"]) {
      expect(rules.toLowerCase()).toContain(phrase.toLowerCase());
    }
  });
});

describe("install_command", () => {
  it("builds the npx command and validates names", async () => {
    expect(await installCommand(registry, { names: ["Button", "dialog", "button"] })).toMatch(/^npx vamos-ui add button dialog --registry /);
    await expect(installCommand(registry, { names: ["dialgo"] })).rejects.toThrow(/Unknown item: `dialgo` \(did you mean `dialog`/);
  });
  it("omits --registry for the public registry", () => {
    expect(buildInstallCommand(new Registry({ source: "https://ui.vamos.ist/r/" }), ["button"])).toBe("npx vamos-ui add button");
  });
});

describe("plan_screen", () => {
  it("picks a dashboard block for an analytics screen", async () => {
    const out = await planScreen(registry, { description: "Ops dashboard with revenue chart and KPI cards" });
    expect(out).toMatch(/\*\*`dashboard-01`\*\*/);
    expect(out).toMatch(/data-density="compact"/);
    expect(out).toMatch(/get_block\("dashboard-01"\)/);
  });

  it("picks the list block and adds components for an invoices list", async () => {
    const out = await planScreen(registry, { description: "CRM invoices list with filters, status badges and a date range" });
    expect(out).toMatch(/\*\*`list-01`\*\*/);
    expect(out).toMatch(/- `date-range-picker`/);
    expect(out).toMatch(/npx vamos-ui add list-01 date-range-picker/);
  });

  it("understands Turkish descriptions", async () => {
    expect(await planScreen(registry, { description: "Giriş sayfası, şifre ile" })).toMatch(/\*\*`login-01`\*\*/);
  });
});

describe("verify_code", () => {
  afterEach(() => setVerifier(undefined));

  it("formats issues errors-first with fixes", async () => {
    setVerifier(() => [
      { rule: "a11y-alt", severity: "warning", message: "img without alt", line: 9, column: 3 },
      { rule: "raw-color", severity: "error", message: "Raw colour #fff", line: 4, column: 20, fix: "Use bg-surface" },
    ]);
    const result = await verifyCode({ code: "x", filename: "app/page.tsx" });
    expect(result.ok).toBe(false);
    const lines = result.text.split("\n");
    expect(lines[0]).toBe("app/page.tsx: 1 error, 1 warning.");
    expect(lines[2]).toMatch(/^error\s+app\/page.tsx:4:20 {2}\[raw-color\]/);
    expect(lines[3]).toMatch(/fix: Use bg-surface/);
  });

  it("reports a clean file", () => {
    expect(formatIssues([], "a.tsx")).toMatch(/no issues found/);
  });

  it("fails clearly when the verifier is missing", async () => {
    setVerifier(null);
    await expect(verifyCode({ code: "", filename: "a.tsx" })).rejects.toThrow(/verifier is not available/);
  });
});
