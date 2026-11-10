import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { fixtureItems, writeFixtureRegistry } from "./fixtures/registry";

let tmp: string;
let project: string;
let registryDir: string;

/** Runs the CLI in-process, non-interactively, capturing stdout. */
async function cli(...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd: project, interactive: false, env: { ...process.env, VAMOS_REGISTRY: registryDir, CI: "1" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}

const read = (rel: string) => readFileSync(path.join(project, rel), "utf8");
const ui = "src/components/vamos";

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-cli-"));
  registryDir = writeFixtureRegistry(path.join(tmp, "registry"));
  project = path.join(tmp, "app");
  mkdirSync(path.join(project, "src/app"), { recursive: true });
  writeFileSync(path.join(project, "package.json"), JSON.stringify({ name: "app", dependencies: { next: "16.0.0", react: "19.2.0", clsx: "^2.1.1" }, devDependencies: { tailwindcss: "^4.1.0" } }));
  writeFileSync(path.join(project, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  writeFileSync(path.join(project, "tsconfig.json"), `{\n  // comment\n  "compilerOptions": { "paths": { "@/*": ["./src/*"] }, },\n}\n`);
  writeFileSync(path.join(project, "src/app/globals.css"), `@import "tailwindcss";\n\nbody { margin: 0; }\n`);
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("vamos-ui end to end (fixture registry)", () => {
  it("init writes vamos.json, styles, the base lib and the CSS import", async () => {
    const { code, out } = await cli("init", "--yes", "--no-install");
    expect(code).toBe(0);
    const config = JSON.parse(read("vamos.json"));
    expect(config).toMatchObject({ uiDir: ui, blocksDir: "src/components/blocks", css: "src/app/globals.css", importAlias: "@/components/vamos", tsx: true, registry: "https://ui.vamos.ist/r" });
    expect(existsSync(path.join(project, ui, "styles.css"))).toBe(true);
    expect(existsSync(path.join(project, ui, "styles/base.css"))).toBe(true);
    expect(existsSync(path.join(project, ui, "lib/cn.ts"))).toBe(true);
    expect(read("src/app/globals.css")).toBe(`@import "tailwindcss";\n@import "../components/vamos/styles.css";\n\nbody { margin: 0; }\n`);
    expect(read(`${ui}/index.ts`)).toContain(`export * from "./lib/public";`);
    expect(out).toContain("data-material=");
    expect(out).toMatch(/tailwind-merge@\^3\.3\.1/); // clsx is already in package.json
    expect(out).not.toMatch(/clsx@/);
  });

  it("init is idempotent", async () => {
    const before = read("src/app/globals.css");
    expect((await cli("init", "--yes", "--no-install")).code).toBe(0);
    expect(read("src/app/globals.css")).toBe(before);
  });

  it("add --dry-run writes nothing", async () => {
    const { code, out } = await cli("add", "dialog", "--dry-run", "--no-install");
    expect(code).toBe(0);
    expect(out).toContain("Dry run");
    expect(existsSync(path.join(project, ui, "components/dialog.tsx"))).toBe(false);
  });

  it("add button dialog data-table installs files, dependencies, indexes and the lock", async () => {
    const { code, out } = await cli("add", "button", "dialog", "data-table", "--no-install", "--yes");
    expect(code).toBe(0);
    for (const f of ["components/button.tsx", "components/tooltip.tsx", "components/dialog.tsx", "lib/labels.ts", "locales/en.ts", "data-table/data-table.tsx", "data-table/types.ts"]) {
      expect(existsSync(path.join(project, ui, f)), f).toBe(true);
    }
    // relative imports inside the kit are untouched
    expect(read(`${ui}/components/dialog.tsx`)).toContain(`from "./button"`);
    const index = read(`${ui}/index.ts`);
    expect(index).toContain(`export * from "./components/button";`);
    expect(index).toContain(`export * from "./components/dialog";`);
    expect(read(`${ui}/data-table/index.ts`)).toContain(`export * from "./data-table";`);
    expect(out).toContain("radix-ui@^1.4.3");
    expect(out).toContain("@tanstack/react-table@^9.3.1");
    expect(out).toContain("pnpm add");

    const lock = JSON.parse(read(`${ui}/.vamos-lock.json`));
    expect(Object.keys(lock.items).sort()).toEqual(["button", "data-table", "dialog", "lib-cn", "lib-labels", "styles", "tooltip"]);
    expect(lock.items.button.version).toBe("0.2.0");
    expect(Object.keys(lock.items.button.files)).toEqual([`${ui}/components/button.tsx`]);
  });

  it("add a block rewrites @vamos-ui/react imports to the alias", async () => {
    const { code } = await cli("add", "dashboard-01", "--no-install", "--yes");
    expect(code).toBe(0);
    const page = read("src/components/blocks/dashboard-01/page.tsx");
    expect(page).toContain(`from "@/components/vamos"`);
    expect(page).toContain(`from "@/components/vamos/data-table"`);
    expect(page).not.toContain("@vamos-ui/react");
    expect(existsSync(path.join(project, "src/components/blocks/dashboard-01/components/stats.tsx"))).toBe(true);
  });

  it("unknown items fail with a suggestion", async () => {
    const { code, out } = await cli("add", "buton", "--yes", "--no-install");
    expect(code).toBe(1);
    expect(out).toContain('Did you mean "button"');
  });

  it("diff is clean, then shows local edits", async () => {
    expect((await cli("diff", "--check")).code).toBe(0);
    const file = path.join(project, ui, "components/button.tsx");
    writeFileSync(file, read(`${ui}/components/button.tsx`).replace("bg-accent text-accent-fg", "bg-accent text-accent-fg rounded-ui"));
    const { code, out } = await cli("diff", "button", "--check");
    expect(code).toBe(1);
    expect(out).toContain("edited locally");
    expect(out).toContain("-  return <button {...props} className={cn(\"bg-accent text-accent-fg rounded-ui\"");
    expect(out).toContain("(registry)");
  });

  it("add keeps local edits unless --overwrite", async () => {
    const edited = read(`${ui}/components/button.tsx`);
    await cli("add", "button", "--yes", "--no-install");
    expect(read(`${ui}/components/button.tsx`)).toBe(edited);
  });

  it("upgrade replaces pristine files and keeps edited ones", async () => {
    // Publish a new registry version where button and tooltip changed.
    const items = fixtureItems().map((it) =>
      it.name === "button" || it.name === "tooltip" ? { ...it, files: it.files.map((f) => ({ ...f, content: f.content + "// v2\n" })) } : it,
    );
    writeFixtureRegistry(registryDir, items);
    const { code, out } = await cli("upgrade", "--yes", "--no-install");
    expect(code).toBe(0);
    expect(read(`${ui}/components/tooltip.tsx`)).toContain("// v2"); // pristine → replaced
    expect(read(`${ui}/components/button.tsx`)).not.toContain("// v2"); // edited → kept
    expect(read(`${ui}/components/button.tsx`)).toContain("rounded-ui");
    expect(out).toMatch(/kept/);

    const { code: forced } = await cli("upgrade", "button", "--overwrite", "--no-install");
    expect(forced).toBe(0);
    expect(read(`${ui}/components/button.tsx`)).toContain("// v2");
    expect((await cli("diff", "--check")).code).toBe(0);
  });

  it("list, search and view work against the registry", async () => {
    const list = await cli("list", "--type", "component", "--json");
    expect(JSON.parse(list.out).map((i: { name: string }) => i.name)).toEqual(["tooltip", "button", "dialog", "data-table"]);
    const search = await cli("search", "düğme", "--json");
    expect(JSON.parse(search.out)[0].name).toBe("button");
    const view = await cli("view", "button");
    expect(view.out).toContain("<Button>Save</Button>");
    expect(view.out).toContain("radix-ui@^1.4.3");
    const viewJson = JSON.parse((await cli("view", "button", "--json")).out);
    expect(viewJson.files[0]).toEqual({ path: "components/button.tsx", lines: expect.any(Number) });
  });

  it("theme saves the axes and prints attributes", async () => {
    const { code, out } = await cli("theme", "--theme", "dark", "--accent", "ocean", "--material", "glass", "--json");
    expect(code).toBe(0);
    expect(JSON.parse(out).attributes).toEqual({ class: "dark", "data-material": "glass", "data-accent": "ocean", "data-density": "comfortable", "data-font": "system" });
    expect(JSON.parse(read("vamos.json")).theme).toMatchObject({ theme: "dark", accent: "ocean", material: "glass" });
    expect((await cli("theme", "--accent", "purple")).code).toBe(1);
  });

  it("verify exits 1 on errors and skips the kit folder by default", async () => {
    writeFileSync(path.join(project, "src/app/page.tsx"), `import { useState } from "react";\nexport default function Page() {\n  const [n] = useState(0);\n  return <div className="bg-blue-500" onClick={() => {}}>{n}</div>;\n}\n`);
    const bad = await cli("verify", "--json");
    expect(bad.code).toBe(1);
    const report = JSON.parse(bad.out);
    expect(report.results.map((r: { file: string }) => r.file)).toEqual(["src/app/page.tsx"]);
    expect(report.results[0].issues.map((i: { rule: string }) => i.rule).sort()).toEqual(["click-events-interactive", "raw-color", "use-client"]);

    writeFileSync(path.join(project, "src/app/page.tsx"), `export default function Page() {\n  return <main className="bg-surface text-fg">Hi</main>;\n}\n`);
    const good = await cli("verify");
    expect(good.code).toBe(0);
    expect(good.out).toContain("No issues");
  });

  it("init --agent writes rules and the skill", async () => {
    const { code } = await cli("init", "--yes", "--no-install", "--agent");
    expect(code).toBe(0);
    expect(read("AGENTS.md")).toContain("npx vamos-ui verify");
    expect(read("CLAUDE.md")).toContain("vamos-ui:start");
    expect(read(".claude/skills/vamos-ui/SKILL.md")).toMatch(/^---\nname: vamos-ui/);
  });
});

const realRegistry = path.resolve(__dirname, "../../../apps/www/public/r");
describe.skipIf(!existsSync(path.join(realRegistry, "index.json")))("against the built registry (apps/www/public/r)", () => {
  it("init + add button dialog data-table", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vamos-real-"));
    const prev = { project, registryDir };
    project = dir;
    registryDir = realRegistry;
    try {
      mkdirSync(path.join(dir, "src/app"), { recursive: true });
      writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "app", dependencies: { next: "16.0.0" }, devDependencies: { tailwindcss: "^4.1.0" } }));
      writeFileSync(path.join(dir, "src/app/globals.css"), `@import "tailwindcss";\n`);
      expect((await cli("init", "--yes", "--no-install")).code).toBe(0);
      const res = await cli("add", "button", "dialog", "data-table", "--yes", "--no-install");
      expect(res.code, res.out).toBe(0);
      expect(existsSync(path.join(dir, ui, "components/button.tsx"))).toBe(true);
    } finally {
      project = prev.project;
      registryDir = prev.registryDir;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
