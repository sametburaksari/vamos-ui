import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { normalizeExtracted, normalizeIssues, setBrandLib } from "../src/brand-lib.js";
import { placeBrandImport, validateBrandShape } from "../src/brand.js";
import {
  applyDesignSystem,
  getBrand,
  importDesignSystem,
  proposeAccent,
  stylesheetLinks,
  updateDesign,
  verifyDesign,
} from "../src/design-tools.js";
import { ToolError } from "../src/errors.js";
import { insideProject } from "../src/project.js";
import { setVerifier } from "../src/verify.js";

// A stand-in for "vamos-ui/brand" with the contract's shapes, so tool logic is tested on its own.
const fakeLib = {
  generateAccent: (colour: string) => {
    if (colour === "nope") throw new Error("unrecognised colour");
    const light = colour === "#ffee00";
    return {
      base: "oklch(0.55 0.1 180)",
      fg: light ? "oklch(0.2 0.02 100)" : "#fff",
      inkLight: "oklch(0.48 0.1 180)",
      inkDark: "oklch(0.8 0.1 180)",
      contrast: { fgOnBase: 5.2, inkLightOnLight: light ? 3.1 : 6.4, inkDarkOnDark: 9.8 },
      warnings: light ? ["--accent-fg switched to dark text for contrast"] : [],
    };
  },
  brandCss: (brand: { colors: { accent: string } }) => `[data-accent="brand"] {\n  --accent-base: ${brand.colors.accent};\n}\n`,
  extractBrandFromHtml: (_html: string, css: string[], baseUrl: string) => ({
    name: "Kuzey Lojistik",
    colors: { accent: "#0f766e" },
    fonts: { body: "Hanken Grotesk" },
    assets: [{ path: new URL("/logo.svg", baseUrl).href, use: "" }],
    evidence: { themeColor: ["#0f766e"], stylesheets: [`${css.length} read`] },
  }),
  checkBrand: (brand: { fonts?: { body?: string } }) =>
    brand.fonts?.body === "Comic Neue" ? [{ level: "warning", field: "fonts.body", message: "Not in the font catalog." }] : [],
};

const tmpRoots: string[] = [];
function project(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), "vamos-mcp-"));
  tmpRoots.push(root);
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), content);
  }
  return root;
}
afterAll(() => {
  for (const root of tmpRoots) rmSync(root, { recursive: true, force: true });
});

const CONFIG = JSON.stringify({ registry: "https://ui.vamos.ist/r", uiDir: "src/components/vamos", blocksDir: "src/components/blocks", css: "src/app/globals.css", importAlias: "@/components/vamos", tsx: true, theme: { accent: "ocean", font: "grotesk" } }, null, 2);
const GLOBALS = '@import "tailwindcss";\n@import "../components/vamos/styles.css";\n\nbody { margin: 0; }\n';
const BRAND = {
  name: "Kuzey Lojistik",
  colors: { accent: "#0f766e" },
  fonts: { body: "Hanken Grotesk" },
  theme: { dark: true, density: "compact" },
  voice: { tone: "Direct and calm", rules: ["Verbs on buttons"], examples: [{ do: "Shipment delayed by 2 days", dont: "Oops!" }] },
  assets: [{ path: "brand/logo.svg", use: "Header on light backgrounds, min 96px" }],
};
const LAYOUT = 'export default function RootLayout({ children }) {\n  return <html lang="en" data-accent="ocean"><body>{children}</body></html>;\n}\n';

function brandProject(extra: Record<string, string> = {}) {
  return project({
    "vamos.json": CONFIG,
    "vamos.brand.json": JSON.stringify(BRAND, null, 2),
    "brand/logo.svg": "<svg/>",
    "src/app/globals.css": GLOBALS,
    "src/app/layout.tsx": LAYOUT,
    "src/components/vamos/styles.css": ":root{}",
    ...extra,
  });
}

beforeEach(() => setBrandLib(fakeLib));
afterEach(() => {
  setBrandLib(undefined);
  setVerifier(undefined);
});

describe("brand validation", () => {
  it("requires name and colors.accent and checks enums", () => {
    const issues = validateBrandShape({ colors: {}, theme: { material: "paper" }, assets: [{ path: "logo.svg" }] });
    const errors = issues.filter((i) => i.severity === "error").map((i) => i.path);
    expect(errors).toEqual(expect.arrayContaining(["name", "colors.accent", "theme.material"]));
    expect(issues.find((i) => i.path === "assets[0].use")?.severity).toBe("warning");
    expect(issues.find((i) => i.path === "voice")?.message).toMatch(/Ask the user/);
  });

  it("accepts a complete profile", () => {
    expect(validateBrandShape(BRAND).filter((i) => i.severity === "error")).toEqual([]);
  });

  it("normalises library results", () => {
    expect(normalizeExtracted({ brand: { name: "A" }, evidence: [1] })).toEqual({ brand: { name: "A" }, evidence: [1] });
    expect(normalizeExtracted({ name: "B", evidence: { x: 1 } })).toEqual({ brand: { name: "B" }, evidence: { x: 1 } });
    const cliShape = { brand: { name: "C" }, evidence: [{ field: "colors.accent", value: "#0f766e", reason: "theme-color" }], colours: [{ hex: "#0f766e" }], fonts: { body: [] } };
    expect(normalizeExtracted(cliShape)).toEqual({ brand: { name: "C" }, evidence: cliShape.evidence, colours: cliShape.colours });
    expect(normalizeIssues(["warning: low contrast", { level: "error", field: "colors.accent", message: "bad" }])).toEqual([
      { severity: "warning", message: "warning: low contrast" },
      { severity: "error", message: "bad", path: "colors.accent" },
    ]);
  });
});

describe("placeBrandImport", () => {
  it("inserts right after the kit styles", () => {
    const out = placeBrandImport(GLOBALS, "../components/vamos/brand.css")!;
    expect(out.css.split("\n").slice(0, 3)).toEqual(['@import "tailwindcss";', '@import "../components/vamos/styles.css";', '@import "../components/vamos/brand.css";']);
  });
  it("moves an import that comes before the styles and leaves a correct file alone", () => {
    const before = '@import "tailwindcss";\n@import "./brand.css";\n@import "./styles.css";\n';
    const moved = placeBrandImport(before, "./brand.css")!;
    expect(moved.moved).toBe(true);
    expect(moved.css).toBe('@import "tailwindcss";\n@import "./styles.css";\n@import "./brand.css";\n');
    expect(placeBrandImport(moved.css, "./brand.css")).toBeNull();
  });
});

describe("project paths", () => {
  it("refuses paths outside the project, also through symlinks", () => {
    const root = project({ "a.txt": "" });
    const outside = project({});
    symlinkSync(outside, path.join(root, "link"));
    expect(() => insideProject(root, "../x")).toThrow(ToolError);
    expect(() => insideProject(root, "/etc/passwd")).toThrow(/relative/);
    expect(() => insideProject(root, "link/file.css")).toThrow(/outside the project/);
    expect(insideProject(root, "src/new/file.css")).toBe(path.join(root, "src/new/file.css"));
  });
});

describe("get_brand", () => {
  it("explains how to create a profile when there is none", async () => {
    const res = await getBrand({ projectDir: project({}) });
    expect(res.data.found).toBe(false);
    expect(res.text).toMatch(/No vamos.brand.json[\s\S]*import_design_system[\s\S]*Do not invent/);
  });

  it("renders accent, voice and assets, and reports missing asset files", async () => {
    const root = brandProject();
    const res = await getBrand({ projectDir: root });
    expect(res.text).toMatch(/# Brand: Kuzey Lojistik/);
    expect(res.text).toMatch(/--accent-ink-light: oklch\(0\.48 0\.1 180\)/);
    expect(res.text).toMatch(/Do: "Shipment delayed by 2 days" — not: "Oops!"/);
    expect(res.text).toMatch(/No issues found/);
    rmSync(path.join(root, "brand/logo.svg"));
    const missing = await getBrand({ projectDir: root });
    expect(missing.text).toMatch(/`assets\[0\]\.path` brand\/logo.svg does not exist/);
  });
});

describe("propose_accent", () => {
  it("returns the four variables and a contrast table", async () => {
    const res = await proposeAccent({ colour: "#0f766e" });
    expect(res.text).toMatch(/\[data-accent="brand"\] \{\n {2}--accent-base: oklch\(0\.55 0\.1 180\);/);
    expect(res.text).toMatch(/\| 6\.40:1 \| pass \|/);
    expect(res.data.ok).toBe(true);
  });
  it("flags failing pairs and adjustments", async () => {
    const res = await proposeAccent({ colour: "#ffee00" });
    expect(res.data.ok).toBe(false);
    expect(res.text).toMatch(/FAIL[\s\S]*switched to dark text[\s\S]*below 4\.5:1/);
  });
  it("rejects bad colours and a missing library clearly", async () => {
    await expect(proposeAccent({ colour: "nope" })).rejects.toThrow(/Could not use "nope" as a colour/);
    setBrandLib(null);
    await expect(proposeAccent({ colour: "#000" })).rejects.toThrow(/brand library is not available/);
  });
});

describe("import_design_system", () => {
  const page = `<html><head><title>Kuzey</title>
    <link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk">
    <link rel="icon" href="/favicon.ico"></head><body></body></html>`;
  const fakeFetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://kuzey.example/") return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (url === "https://kuzey.example/app.css") return new Response(":root{--brand:#0f766e}", { headers: { "content-type": "text/css" } });
    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  it("finds stylesheet links but skips Google Fonts CSS", () => {
    expect(stylesheetLinks(page, "https://kuzey.example/")).toEqual(["https://kuzey.example/app.css"]);
  });

  it("drafts a brand from a URL with evidence, accent and next steps", async () => {
    const res = await importDesignSystem({ url: "kuzey.example" }, { fetch: fakeFetch });
    const brand = res.data.brand as { name: string; source: { url: string }; assets: { path: string }[] };
    expect(brand.name).toBe("Kuzey Lojistik");
    expect(brand.source.url).toBe("https://kuzey.example/");
    expect(res.text).toMatch(/Read https:\/\/kuzey.example\/ and 1 stylesheet\./);
    expect(res.text).toMatch(/\*\*stylesheets:\*\* 1 read/);
    expect(res.text).toMatch(/voice — only page text hints/);
    expect(res.text).toMatch(/Download the logos \(1\)/);
    expect(res.text).toMatch(/confirm every value/);
  });

  it("accepts html and validates input", async () => {
    const res = await importDesignSystem({ html: page, base_url: "https://kuzey.example/" });
    expect((res.data.brand as { assets: { path: string }[] }).assets[0]!.path).toBe("https://kuzey.example/logo.svg");
    await expect(importDesignSystem({ url: "https://a.example", html: "<p/>" })).rejects.toThrow(/exactly one/);
    await expect(importDesignSystem({ url: "file:///etc/passwd" })).rejects.toThrow(/Only http\(s\)/);
    await expect(importDesignSystem({ url: "https://missing.example/" }, { fetch: fakeFetch })).rejects.toThrow(/Could not load .*HTTP 404/);
  });
});

describe("apply_design_system", () => {
  it("plans brand.css, the import, vamos.json and the <html> attributes without writing", async () => {
    const root = brandProject();
    const res = await applyDesignSystem({ projectDir: root });
    const edits = res.data.edits as { path: string; action: string; content: string }[];
    expect(edits.map((e) => `${e.action} ${e.path}`)).toEqual(["create src/components/vamos/brand.css", "update src/app/globals.css", "update vamos.json"]);
    expect(edits[1]!.content).toMatch(/styles.css";\n@import "..\/components\/vamos\/brand.css";/);
    expect(JSON.parse(edits[2]!.content).theme).toEqual({ accent: "brand", font: "grotesk", theme: "dark", density: "compact" });
    expect(res.text).toMatch(/npx vamos-ui brand apply/);
    expect(res.text).toMatch(/<html lang="en" className="dark" data-material="solid" data-accent="brand" data-density="compact" data-font="grotesk">/);
    expect(res.text).toMatch(/Load the brand fonts \(Hanken Grotesk\)[\s\S]*family=Hanken\+Grotesk/);
    expect(readFileSync(path.join(root, "src/app/globals.css"), "utf8")).toBe(GLOBALS);
  });

  it("writes inside the project with write: true and is idempotent", async () => {
    const root = brandProject();
    const first = await applyDesignSystem({ projectDir: root, write: true });
    expect(first.data.written).toHaveLength(3);
    expect(readFileSync(path.join(root, "src/components/vamos/brand.css"), "utf8")).toMatch(/--accent-base: #0f766e/);
    const second = await applyDesignSystem({ projectDir: root, write: true });
    expect(second.data.written).toEqual([]);
    expect(second.text).toMatch(/Nothing to write/);
  });

  it("saves a brand passed by the caller and rejects invalid ones", async () => {
    const root = brandProject({ "vamos.brand.json": "" });
    rmSync(path.join(root, "vamos.brand.json"));
    const res = await applyDesignSystem({ projectDir: root, brand: { ...BRAND, name: "Kuzey" } });
    const edits = res.data.edits as { path: string; content: string }[];
    expect(JSON.parse(edits[0]!.content)).toMatchObject({ $schema: "https://ui.vamos.ist/r/brand-schema.json", name: "Kuzey" });
    await expect(applyDesignSystem({ projectDir: root, brand: { name: "X", colors: {} } })).rejects.toThrow(/colors\.accent/);
    await expect(applyDesignSystem({ projectDir: root })).rejects.toThrow(/No vamos.brand.json/);
  });

  it("never touches files outside the project", async () => {
    const root = brandProject({ "vamos.json": JSON.stringify({ uiDir: "../elsewhere", css: "src/app/globals.css" }) });
    await expect(applyDesignSystem({ projectDir: root, write: true })).rejects.toThrow(/inside the project/);
  });

  it("refuses to write while there are blocking problems", async () => {
    const root = brandProject();
    rmSync(path.join(root, "brand/logo.svg"));
    await expect(applyDesignSystem({ projectDir: root, write: true })).rejects.toThrow(/Nothing written[\s\S]*logo.svg does not exist/);
  });
});

describe("verify_design / update_design", () => {
  const fakeVerifier = (code: string) =>
    code.includes("#0f766e") ? [{ rule: "raw-color", severity: "error" as const, message: "Raw colour #0f766e", line: 1, column: 5, fix: "Use bg-accent" }] : [];

  it("lints a single file", async () => {
    setVerifier(fakeVerifier);
    const res = await verifyDesign({ code: '<div style={{ color: "#0f766e" }} />', filename: "a.tsx" });
    expect(res.data.ok).toBe(false);
    expect(res.text).toMatch(/\[raw-color\]/);
  });

  it("checks code and brand alignment for a project, skipping the kit folder", async () => {
    setVerifier(fakeVerifier);
    const root = brandProject({ "src/app/page.tsx": 'const c = "#0f766e";', "src/components/vamos/button.tsx": 'const c = "#0f766e";' });
    const res = await verifyDesign({ projectDir: root });
    expect(res.data).toMatchObject({ ok: false, errors: 1 });
    expect((res.data.results as { file: string }[]).map((r) => r.file)).toEqual(["src/app/page.tsx"]);
    expect(res.text).toMatch(/Out of line with the brand: Brand accent/);
    expect(res.text).toMatch(/screenshot desktop \(1440px\) and mobile \(375px\)/);

    rmSync(path.join(root, "src/app/page.tsx"));
    await applyDesignSystem({ projectDir: root, write: true });
    writeFileSync(path.join(root, "src/app/layout.tsx"), LAYOUT.replace("ocean", "brand").replace("<html", '<html className="dark"').replace("<body>", '<head><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk" /></head><body>'));
    const clean = await verifyDesign({ projectDir: root });
    expect(clean.data.ok).toBe(true);
    expect(clean.text).toMatch(/No blocking issues/);
  });

  it("plans an update with violations grouped by rule", async () => {
    setVerifier(fakeVerifier);
    const root = brandProject({ "src/app/page.tsx": 'const c = "#0f766e";' });
    const res = await updateDesign({ projectDir: root });
    expect(res.text).toMatch(/npx vamos-ui update --dry-run/);
    expect(res.text).toMatch(/create `src\/components\/vamos\/brand.css`/);
    expect(res.text).toMatch(/`raw-color` × 1 in src\/app\/page.tsx/);
    expect(res.data.code).toMatchObject({ errors: 1 });
  });

  it("works without a brand profile", async () => {
    setVerifier(() => []);
    const root = project({ "vamos.json": CONFIG, "src/app/page.tsx": "export default 1;" });
    expect((await updateDesign({ projectDir: root })).text).toMatch(/No vamos.brand.json: the brand step is skipped/);
    const res = await verifyDesign({ projectDir: root });
    expect(res.data.ok).toBe(true);
    expect(res.text).toMatch(/No brand profile; brand checks skipped/);
  });
});
