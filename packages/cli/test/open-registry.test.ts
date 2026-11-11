import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { buildThirdPartyRegistry, importsOf } from "../src/core/registry-build";
import { externalItemSchema, itemSchema, validateSchema } from "../src/core/schema";
import { canonicalSpec, parseGithubSpec, parseItemSpec, resolveDependencySpec } from "../src/core/sources";
import type { RegistryItem } from "../src/core/types";
import { writeFixtureRegistry } from "./fixtures/registry";

const here = path.dirname(fileURLToPath(import.meta.url));
let tmp: string;
let registryDir: string;

async function cli(cwd: string, ...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd, interactive: false, env: { ...process.env, VAMOS_REGISTRY: registryDir, CI: "1" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}

function makeApp(name: string, extraConfig: Record<string, unknown> = {}): string {
  const dir = path.join(tmp, name);
  mkdirSync(path.join(dir, "src/app"), { recursive: true });
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name, dependencies: { next: "16.0.0", react: "19.2.0" }, devDependencies: { tailwindcss: "^4.1.0" } }));
  writeFileSync(path.join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }));
  writeFileSync(path.join(dir, "src/app/globals.css"), `@import "tailwindcss";\n`);
  writeFileSync(
    path.join(dir, "vamos.json"),
    JSON.stringify({ registry: registryDir, uiDir: "src/components/vamos", blocksDir: "src/components/blocks", css: "src/app/globals.css", importAlias: "@/components/vamos", tsx: true, ...extraConfig }),
  );
  return dir;
}

const docs = "https://acme.dev/ui";
function thirdParty(name: string, partial: Partial<RegistryItem> = {}): RegistryItem {
  return {
    name,
    type: "component",
    title: name,
    description: `${name} by Acme`,
    docs,
    dependencies: [],
    registryDependencies: [],
    files: [{ path: `components/acme/${name}.tsx`, content: `export function X() {\n  return null;\n}\n` }],
    ...partial,
  };
}

const statCard = thirdParty("stat-card", {
  registryDependencies: ["button", "./trend-badge"],
  dependencies: ["lucide-react@^1.0.0"],
  files: [{ path: "components/acme/stat-card.tsx", content: `import { Button } from "@vamos-ui/react";\nimport { TrendBadge } from "./trend-badge";\n\nexport function StatCard() {\n  return <div><TrendBadge /><Button>Open</Button></div>;\n}\n` }],
});
const trendBadge = thirdParty("trend-badge", { files: [{ path: "components/acme/trend-badge.tsx", content: `export function TrendBadge() {\n  return <span className="text-fg-muted">+4%</span>;\n}\n` }] });

/** Serves { url: body } from a mocked global fetch and records the requested URLs. */
function serve(routes: Record<string, unknown>): string[] {
  const hits: string[] = [];
  vi.stubGlobal("fetch", async (input: string | URL) => {
    const url = String(input);
    hits.push(url);
    if (!(url in routes)) return new Response("not found", { status: 404, statusText: "Not Found" });
    const body = routes[url];
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  });
  return hits;
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-open-"));
  registryDir = writeFixtureRegistry(path.join(tmp, "registry"));
});
afterEach(() => vi.unstubAllGlobals());
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("item specs", () => {
  const opts = { root: "/proj", registries: { "@acme": "https://acme.dev/r/{name}.json", "@local": "./registry/{name}.json" } };

  it("plain names stay with the project registry", () => {
    expect(parseItemSpec("button", opts)).toBeNull();
  });

  it("full URLs", () => {
    expect(parseItemSpec("https://acme.dev/r/stat-card.json", opts)).toMatchObject({ kind: "url", name: "stat-card", host: "acme.dev", url: "https://acme.dev/r/stat-card.json" });
    expect(parseItemSpec("http://localhost:4000/r/stat-card.json", opts)).toMatchObject({ kind: "url", host: "localhost:4000" });
    expect(() => parseItemSpec("http://acme.dev/r/stat-card.json", opts)).toThrow(/https/);
    expect(() => parseItemSpec("https://acme.dev/r/Bad_Name.json", opts)).toThrow(/not a valid item name/);
  });

  it("github: specs", () => {
    const at = (s: string) => parseItemSpec(s, opts)!.url;
    expect(at("github:acme/ui/stat-card")).toBe("https://raw.githubusercontent.com/acme/ui/HEAD/r/stat-card.json");
    expect(at("github:acme/ui/public/r/stat-card")).toBe("https://raw.githubusercontent.com/acme/ui/HEAD/public/r/stat-card.json");
    expect(at("github:acme/ui#v1.2.0/stat-card")).toBe("https://raw.githubusercontent.com/acme/ui/v1.2.0/r/stat-card.json");
    expect(at("github:acme/ui/registry#feature/x/stat-card")).toBe("https://raw.githubusercontent.com/acme/ui/feature/x/registry/stat-card.json");
    expect(parseGithubSpec("github:acme/ui/stat-card.json").name).toBe("stat-card");
    expect(canonicalSpec("github:acme/ui/r/stat-card", opts)).toBe("github:acme/ui/stat-card");
    expect(() => parseItemSpec("github:acme/stat-card", opts)).toThrow(/owner, repo and item/);
    expect(() => parseItemSpec("github:acme/ui/../x/stat-card", opts)).toThrow(/path/);
  });

  it("@namespace/item through vamos.json registries", () => {
    expect(parseItemSpec("@acme/stat-card", opts)).toMatchObject({ kind: "namespace", key: "@acme/stat-card", url: "https://acme.dev/r/stat-card.json", host: "acme.dev" });
    expect(parseItemSpec("@local/stat-card", opts)).toMatchObject({ kind: "namespace", url: path.resolve("/proj/registry/stat-card.json") });
    expect(() => parseItemSpec("@other/stat-card", opts)).toThrow(/No registry is configured for @other/);
  });

  it("local item files and garbage", () => {
    expect(parseItemSpec("./r/stat-card.json", opts)).toMatchObject({ kind: "file", key: "./r/stat-card.json", url: path.resolve("/proj/r/stat-card.json") });
    expect(() => parseItemSpec("Button!", opts)).toThrow(/not an item name/);
  });

  it("resolves ./sibling dependencies relative to the parent", () => {
    const url = parseItemSpec("https://acme.dev/r/stat-card.json", opts)!;
    expect(resolveDependencySpec("./trend-badge", url, opts)).toBe("https://acme.dev/r/trend-badge.json");
    expect(resolveDependencySpec("button", url, opts)).toBe("button");
    const gh = parseItemSpec("github:acme/ui#v1/stat-card", opts)!;
    expect(resolveDependencySpec("./trend-badge", gh, opts)).toBe("github:acme/ui#v1/trend-badge");
    const ns = parseItemSpec("@acme/stat-card", opts)!;
    expect(resolveDependencySpec("./trend-badge", ns, opts)).toBe("@acme/trend-badge");
  });
});

describe("schema", () => {
  it("mirrors the build's item schema and validator exactly", async () => {
    const schemaMod = path.resolve(here, "../../../scripts/registry/schema.mjs");
    const validatorMod = path.resolve(here, "../../../scripts/registry/json-schema.mjs");
    const build = (await import(/* @vite-ignore */ schemaMod)) as { itemSchema(): unknown };
    const v = (await import(/* @vite-ignore */ validatorMod)) as { validateSchema(value: unknown, schema: unknown): string[] };
    expect(itemSchema()).toEqual(build.itemSchema());
    const bad = { ...statCard, extra: 1, files: [{ path: "../x", content: "" }] };
    expect(validateSchema(bad, itemSchema())).toEqual(v.validateSchema(bad, build.itemSchema()));
  });

  it("third-party items may use specs as dependencies but not git/file npm specs", () => {
    expect(validateSchema(statCard, externalItemSchema())).toEqual([]);
    expect(validateSchema({ ...statCard, dependencies: ["evil@git+https://x.dev/e.git"] }, externalItemSchema()).length).toBeGreaterThan(0);
    expect(validateSchema({ ...statCard, dependencies: ["evil@file:../e"] }, externalItemSchema()).length).toBeGreaterThan(0);
    expect(validateSchema({ ...statCard, registryDependencies: ["@acme/x", "github:a/b/c", "https://a.dev/r/x.json", "./y"] }, externalItemSchema())).toEqual([]);
  });
});

describe("vamos-ui add from an open registry", () => {
  it("installs a URL item, its sibling and its kit dependency; shows the host; disables npm scripts", async () => {
    const app = makeApp("url");
    const hits = serve({ "https://acme.dev/r/stat-card.json": statCard, "https://acme.dev/r/trend-badge.json": trendBadge });
    const { code, out } = await cli(app, "add", "https://acme.dev/r/stat-card.json", "--yes", "--no-install");
    expect(code).toBe(0);
    expect(hits).toEqual(["https://acme.dev/r/stat-card.json", "https://acme.dev/r/trend-badge.json"]);
    expect(out).toContain("Third-party source");
    expect(out).toContain("acme.dev");
    expect(out).toMatch(/npm install --ignore-scripts lucide-react@\^1\.0\.0/);
    const ui = path.join(app, "src/components/vamos");
    expect(readFileSync(path.join(ui, "components/acme/stat-card.tsx"), "utf8")).toContain(`from "@/components/vamos"`);
    expect(existsSync(path.join(ui, "components/acme/trend-badge.tsx"))).toBe(true);
    expect(existsSync(path.join(ui, "components/button.tsx"))).toBe(true); // kit dependency
    const lock = JSON.parse(readFileSync(path.join(ui, ".vamos-lock.json"), "utf8"));
    expect(lock.items["https://acme.dev/r/stat-card.json"]).toMatchObject({ source: "https://acme.dev/r/stat-card.json" });
    expect(lock.items.button).toBeDefined();
    // diff works against the third-party source too
    expect((await cli(app, "diff", "--check")).code).toBe(0);
  });

  it("installs github: items and resolves siblings on the same repo and ref", async () => {
    const app = makeApp("gh");
    const hits = serve({
      "https://raw.githubusercontent.com/acme/ui/v1/r/stat-card.json": statCard,
      "https://raw.githubusercontent.com/acme/ui/v1/r/trend-badge.json": trendBadge,
    });
    const { code } = await cli(app, "add", "github:acme/ui#v1/stat-card", "--yes", "--no-install");
    expect(code).toBe(0);
    expect(hits).toContain("https://raw.githubusercontent.com/acme/ui/v1/r/trend-badge.json");
    const lock = JSON.parse(readFileSync(path.join(app, "src/components/vamos/.vamos-lock.json"), "utf8"));
    expect(Object.keys(lock.items)).toEqual(expect.arrayContaining(["github:acme/ui#v1/stat-card", "github:acme/ui#v1/trend-badge", "button"]));
  });

  it("installs @ns/item through the registries map", async () => {
    const app = makeApp("ns", { registries: { "@acme": "https://acme.dev/r/{name}.json" } });
    serve({ "https://acme.dev/r/stat-card.json": statCard, "https://acme.dev/r/trend-badge.json": trendBadge });
    expect((await cli(app, "add", "@acme/stat-card", "--yes", "--no-install")).code).toBe(0);
    const lock = JSON.parse(readFileSync(path.join(app, "src/components/vamos/.vamos-lock.json"), "utf8"));
    expect(lock.items["@acme/stat-card"]).toBeDefined();
    expect(lock.items["@acme/trend-badge"]).toBeDefined();
    // the registries map survives later writes of vamos.json
    expect((await cli(app, "theme", "--accent", "ocean", "--json")).code).toBe(0);
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).registries).toEqual({ "@acme": "https://acme.dev/r/{name}.json" });
  });

  it("rejects items that do not match the schema and writes nothing", async () => {
    const app = makeApp("invalid");
    serve({ "https://acme.dev/r/stat-card.json": { ...statCard, postinstall: "rm -rf ~" } });
    const { code, out } = await cli(app, "add", "https://acme.dev/r/stat-card.json", "--yes", "--no-install");
    expect(code).toBe(1);
    expect(out).toMatch(/not a valid Vamos UI registry item/);
    expect(out).toContain(`unknown property "postinstall"`);
    expect(existsSync(path.join(app, "src/components/vamos"))).toBe(false);
    serve({ "https://acme.dev/r/x.json": "<html>" });
    expect((await cli(app, "add", "https://acme.dev/r/x.json", "--yes", "--no-install")).out).toMatch(/not valid JSON/);
  });

  it("never replaces a file another item installed", async () => {
    const app = makeApp("clash");
    expect((await cli(app, "add", "button", "--yes", "--no-install")).code).toBe(0);
    const before = readFileSync(path.join(app, "src/components/vamos/components/button.tsx"), "utf8");
    serve({ "https://evil.dev/r/better-button.json": thirdParty("better-button", { files: [{ path: "components/button.tsx", content: "export const hacked = true;\n" }] }) });
    const { code, out } = await cli(app, "add", "https://evil.dev/r/better-button.json", "--yes", "--no-install");
    expect(code).toBe(0);
    expect(out).toContain("edited locally, kept");
    expect(readFileSync(path.join(app, "src/components/vamos/components/button.tsx"), "utf8")).toBe(before);
  });
});

describe("vamos-ui registry build", () => {
  function makeSource(): string {
    const dir = path.join(tmp, "acme-registry");
    mkdirSync(path.join(dir, "components"), { recursive: true });
    mkdirSync(path.join(dir, "blocks/kpi-board"), { recursive: true });
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "@acme/ui", version: "1.2.0", dependencies: { "lucide-react": "^1.70.0" } }));
    writeFileSync(path.join(dir, "registry.json"), JSON.stringify({ homepage: "https://acme.dev/ui", items: [{ name: "stat-card", registryDependencies: ["button"], tags: ["kpi"] }] }));
    writeFileSync(
      path.join(dir, "components/stat-card.tsx"),
      `/** A KPI tile with a trend badge. */\nimport { Button } from "@vamos-ui/react";\nimport { TrendingUp } from "lucide-react";\nimport { TrendBadge } from "./trend-badge";\n\nexport function StatCard() {\n  return <div><TrendingUp /><TrendBadge /><Button>Open</Button></div>;\n}\n`,
    );
    writeFileSync(path.join(dir, "components/trend-badge.tsx"), `/** Up or down change, in percent. */\nexport function TrendBadge() {\n  return <span className="text-fg-muted">+4%</span>;\n}\n`);
    writeFileSync(path.join(dir, "components/trend-badge.test.tsx"), `// not published\n`);
    writeFileSync(path.join(dir, "blocks/kpi-board/page.tsx"), `import { StatCard } from "../../components/stat-card";\n\nexport default function Page() {\n  return <main><StatCard /></main>;\n}\n`);
    return dir;
  }

  it("reads imports", () => {
    expect(importsOf(`import a from "x";\nimport { B, type C as D } from "@s/y/z";\nexport * from "./w";\nimport "./side.css";\nconst m = await import("lazy");\n// import nope from "commented";`).map((i) => i.spec)).toEqual(["x", "@s/y/z", "./w", "./side.css", "lazy"]);
  });

  it("builds items and an index that validate, with dependencies from imports", () => {
    const result = buildThirdPartyRegistry({ dir: makeSource() });
    expect(result.errors).toEqual([]);
    const byName = Object.fromEntries(result.items.map((i) => [i.name, i]));
    expect(Object.keys(byName)).toEqual(["kpi-board", "stat-card", "trend-badge"]);
    expect(byName["stat-card"]).toMatchObject({ type: "component", description: "A KPI tile with a trend badge.", dependencies: ["lucide-react@^1.70.0"], registryDependencies: ["./trend-badge", "button"], tags: ["kpi"], docs: "https://acme.dev/ui" });
    expect(byName["kpi-board"]).toMatchObject({ type: "block", registryDependencies: ["./stat-card"] });
    // a block reaches uiDir through the kit import (rewritten to the project alias on install)
    expect(byName["kpi-board"]!.files[0]!.content).toContain(`from "@vamos-ui/react/components/stat-card"`);
    expect(result.index).toMatchObject({ name: "ui", version: "1.2.0", homepage: "https://acme.dev/ui" });
    for (const item of result.items) expect(validateSchema(item, externalItemSchema())).toEqual([]);
  });

  it("fails without a homepage and on imports outside any item", () => {
    const dir = path.join(tmp, "broken-registry");
    mkdirSync(path.join(dir, "components"), { recursive: true });
    mkdirSync(path.join(dir, "helpers"), { recursive: true });
    writeFileSync(path.join(dir, "helpers/x.ts"), `export const x = 1;\n`);
    writeFileSync(path.join(dir, "components/a.tsx"), `import { x } from "../helpers/x";\nexport const A = x;\n`);
    const { errors } = buildThirdPartyRegistry({ dir });
    expect(errors.join("\n")).toMatch(/homepage URL is required/);
    expect(errors.join("\n")).toMatch(/imports "..\/helpers\/x", which is not part of any item/);
  });

  it("CLI writes the registry, and its items install with vamos-ui add", async () => {
    const dir = makeSource();
    const { code } = await cli(tmp, "registry", "build", dir);
    expect(code).toBe(0);
    for (const f of ["index.json", "stat-card.json", "trend-badge.json", "kpi-board.json"]) expect(existsSync(path.join(dir, "r", f)), f).toBe(true);
    const app = makeApp("from-build");
    const { code: addCode } = await cli(app, "add", path.join(dir, "r/kpi-board.json"), "--yes", "--no-install");
    expect(addCode).toBe(0);
    expect(readFileSync(path.join(app, "src/components/blocks/kpi-board/page.tsx"), "utf8")).toContain(`from "@/components/vamos/components/stat-card"`);
    expect(existsSync(path.join(app, "src/components/vamos/components/stat-card.tsx"))).toBe(true);
    expect(existsSync(path.join(app, "src/components/vamos/components/trend-badge.tsx"))).toBe(true);
  });
});
