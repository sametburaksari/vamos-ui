import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { packageNameFor, STARTER_ITEMS } from "../src/commands/create";
import { verifySource } from "../src/verify";
import { fixtureItems, writeFixtureRegistry } from "./fixtures/registry";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const builtRegistry = path.join(repo, "apps/www/public/r");

let tmp: string;
let fixtureRegistry: string;

async function cli(cwd: string, registry: string, ...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd, interactive: false, env: { ...process.env, VAMOS_REGISTRY: registry, CI: "1", npm_config_user_agent: "npm/10" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-create-"));
  // The fixture registry plus small card and badge items, which the starter screen imports.
  const items = fixtureItems();
  const stub = (name: string, file: string, code: string) => ({ name, type: "component" as const, title: name, description: name, docs: `https://ui.vamos.ist/docs/components/${name}`, dependencies: [], registryDependencies: ["lib-cn"], files: [{ path: file, content: code }] });
  items.push(stub("card", "components/card.tsx", `import * as React from "react";\nexport function Card(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\nexport function CardHeader(props: { title?: React.ReactNode; description?: React.ReactNode; divider?: boolean }) { return <div>{props.title}</div>; }\nexport function CardBody(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\nexport function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\n`));
  items.push(stub("badge", "components/badge.tsx", `import * as React from "react";\nexport function Badge(props: React.HTMLAttributes<HTMLSpanElement> & { tone?: string }) { return <span {...props} />; }\n`));
  fixtureRegistry = writeFixtureRegistry(path.join(tmp, "registry"), items);
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("vamos-ui create", () => {
  it("derives a valid package name", () => {
    expect(packageNameFor("/x/My Cool App")).toBe("my-cool-app");
    expect(packageNameFor("/x/___")).toBe("vamos-app");
  });

  it("next: scaffolds the App Router template, runs init with the preset and adds the starter screen", async () => {
    const { code, out } = await cli(tmp, fixtureRegistry, "create", "next-app", "--template", "next", "--preset", "v1dgokg", "--no-install", "--yes");
    expect(code, out).toBe(0);
    const app = path.join(tmp, "next-app");
    const read = (f: string) => readFileSync(path.join(app, f), "utf8");
    for (const f of ["package.json", "next.config.ts", "postcss.config.mjs", "tsconfig.json", ".gitignore", "src/app/layout.tsx", "src/app/page.tsx", "src/components/starter-screen.tsx"]) {
      expect(existsSync(path.join(app, f)), f).toBe(true);
    }
    expect(JSON.parse(read("package.json")).name).toBe("next-app");
    expect(read("src/app/layout.tsx")).toContain(`<html lang="en" className="dark" data-material="glass" data-accent="ocean" data-density="compact" data-font="grotesk">`);
    expect(read("src/app/globals.css")).toBe(`@import "tailwindcss";\n@import "../components/vamos/styles.css";\n`);
    const config = JSON.parse(read("vamos.json"));
    expect(config).toMatchObject({ uiDir: "src/components/vamos", css: "src/app/globals.css", importAlias: "@/components/vamos", theme: { accent: "ocean", density: "compact" } });
    for (const f of ["components/button.tsx", "components/card.tsx", "components/badge.tsx", "lib/cn.ts"]) expect(existsSync(path.join(app, "src/components/vamos", f)), f).toBe(true);
    const lock = JSON.parse(read("src/components/vamos/.vamos-lock.json"));
    for (const n of STARTER_ITEMS) expect(lock.items[n], n).toBeDefined();
    expect(out).toContain("cd next-app && npm install && npm run dev");
    // the generated screen follows the design rules
    for (const f of ["src/components/starter-screen.tsx", "src/app/layout.tsx", "src/app/page.tsx"]) expect(verifySource(read(f), f).filter((i) => i.severity === "error"), f).toEqual([]);
  });

  it("vite: scaffolds Vite + React with the attributes in index.html", async () => {
    const { code, out } = await cli(tmp, fixtureRegistry, "create", "vite-app", "--template", "vite", "--no-install");
    expect(code, out).toBe(0);
    const app = path.join(tmp, "vite-app");
    const read = (f: string) => readFileSync(path.join(app, f), "utf8");
    expect(read("index.html")).toContain(`<html lang="en" data-material="solid" data-accent="lime" data-density="comfortable" data-font="system">`);
    expect(read("src/index.css")).toContain(`@import "./components/vamos/styles.css";`);
    expect(JSON.parse(read("vamos.json")).css).toBe("src/index.css");
    expect(existsSync(path.join(app, "src/components/vamos/components/card.tsx"))).toBe(true);
  });

  it("refuses a folder that is not empty and an unknown template", async () => {
    mkdirSync(path.join(tmp, "taken"));
    writeFileSync(path.join(tmp, "taken/notes.txt"), "keep me");
    expect((await cli(tmp, fixtureRegistry, "create", "taken", "--no-install")).out).toMatch(/not empty/);
    expect((await cli(tmp, fixtureRegistry, "create", "x-app", "--template", "remix", "--no-install")).code).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Type-check generated apps against the real built registry, with the monorepo's installed
// packages linked in as node_modules (no network, nothing installed).
// ---------------------------------------------------------------------------

function linkNodeModules(app: string, sources: string[], extra: Record<string, string> = {}): void {
  const nm = path.join(app, "node_modules");
  mkdirSync(nm, { recursive: true });
  const link = (from: string, to: string) => {
    if (!existsSync(to)) symlinkSync(from, to, "dir");
  };
  for (const src of sources) {
    if (!existsSync(src)) continue;
    for (const entry of readdirSync(src)) {
      if (entry.startsWith(".")) continue;
      if (entry.startsWith("@")) {
        mkdirSync(path.join(nm, entry), { recursive: true });
        for (const sub of readdirSync(path.join(src, entry))) link(path.join(src, entry, sub), path.join(nm, entry, sub));
      } else link(path.join(src, entry), path.join(nm, entry));
    }
  }
  for (const [name, from] of Object.entries(extra)) {
    mkdirSync(path.dirname(path.join(nm, name)), { recursive: true });
    link(from, path.join(nm, name));
  }
}

function storePackage(prefix: string, name: string): string | null {
  const store = path.join(repo, "node_modules/.pnpm");
  if (!existsSync(store)) return null;
  const dir = readdirSync(store).find((d) => d.startsWith(prefix));
  return dir ? path.join(store, dir, "node_modules", name) : null;
}

const tsc = path.join(repo, "apps/www/node_modules/typescript/bin/tsc");
const canTypecheck = existsSync(path.join(builtRegistry, "index.json")) && existsSync(tsc) && existsSync(path.join(repo, "packages/ui/node_modules"));

describe.skipIf(!canTypecheck)("generated apps type-check (built registry)", () => {
  const sources = [path.join(repo, "packages/ui/node_modules"), path.join(repo, "apps/www/node_modules")];

  it("next template", async () => {
    const { code, out } = await cli(tmp, builtRegistry, "create", "tc-next", "--template", "next", "--preset", "v1lsx4f46e5ce", "--no-install");
    expect(code, out).toBe(0);
    const app = path.join(tmp, "tc-next");
    linkNodeModules(app, sources);
    try {
      execFileSync(process.execPath, [tsc, "--noEmit", "-p", app], { cwd: app, encoding: "utf8", stdio: "pipe" });
    } catch (err) {
      throw new Error(`tsc failed:\n${(err as { stdout?: string }).stdout ?? err}`);
    }
  }, 120_000);

  it("vite template (src)", async () => {
    const vite = storePackage("vite@", "vite");
    if (!vite) return;
    const { code, out } = await cli(tmp, builtRegistry, "create", "tc-vite", "--template", "vite", "--no-install");
    expect(code, out).toBe(0);
    const app = path.join(tmp, "tc-vite");
    linkNodeModules(app, sources, { vite });
    // vite.config.ts needs @tailwindcss/vite, which the monorepo does not install; check the app sources.
    writeFileSync(path.join(app, "tsconfig.check.json"), JSON.stringify({ extends: "./tsconfig.json", include: ["src"] }));
    try {
      execFileSync(process.execPath, [tsc, "--noEmit", "-p", path.join(app, "tsconfig.check.json")], { cwd: app, encoding: "utf8", stdio: "pipe" });
    } catch (err) {
      throw new Error(`tsc failed:\n${(err as { stdout?: string }).stdout ?? err}`);
    }
  }, 120_000);
});
