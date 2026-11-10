import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseArgs } from "../src/args";
import { classify } from "../src/commands/sync";
import { agentRules, upsertBlock } from "../src/core/agent";
import { DEFAULT_CONFIG, validateConfig } from "../src/core/config";
import { addStylesImport, stylesImportPath } from "../src/core/css";
import { buildIndex, collectExports, INDEX_HEADER } from "../src/core/indexes";
import { planInstall } from "../src/core/install";
import { emptyLock, fileState, ownerOf, recordItem, sha256 } from "../src/core/lockfile";
import { fold, resolveRegistryLocation, searchItems, suggest } from "../src/core/registry";
import { collectDependencies, parseSpec, resolveItems } from "../src/core/resolve";
import { rewriteImports, safeRelative, targetPath } from "../src/core/transform";
import type { RegistryItem } from "../src/core/types";
import { fixtureItems } from "./fixtures/registry";

const config = DEFAULT_CONFIG;

describe("rewriteImports", () => {
  const alias = "@/components/vamos";
  it("rewrites the package root and subpaths", () => {
    const src = `import { Button } from "@vamos-ui/react";\nimport { AreaChart } from '@vamos-ui/react/charts';\nexport * from "@vamos-ui/react/data-table";\n`;
    expect(rewriteImports(src, alias)).toBe(`import { Button } from "@/components/vamos";\nimport { AreaChart } from '@/components/vamos/charts';\nexport * from "@/components/vamos/data-table";\n`);
  });
  it("handles dynamic imports, type imports, side-effect and CSS imports", () => {
    expect(rewriteImports(`const m = await import("@vamos-ui/react/editor");`, alias)).toBe(`const m = await import("@/components/vamos/editor");`);
    expect(rewriteImports(`import type { Messages } from "@vamos-ui/react";`, alias)).toBe(`import type { Messages } from "@/components/vamos";`);
    expect(rewriteImports(`import "@vamos-ui/react/styles.css";`, alias)).toBe(`import "@/components/vamos/styles.css";`);
    expect(rewriteImports(`@import "@vamos-ui/react/styles.css";`, alias)).toBe(`@import "@/components/vamos/styles.css";`);
    expect(rewriteImports(`import {\n  a,\n  b,\n} from "@vamos-ui/react";`, alias)).toContain(`from "@/components/vamos"`);
  });
  it("maps locale/* to the locales folder", () => {
    expect(rewriteImports(`import { tr } from "@vamos-ui/react/locale/tr";`, alias)).toBe(`import { tr } from "@/components/vamos/locales/tr";`);
  });
  it("leaves other packages and relative imports alone", () => {
    const src = `import x from "@vamos-ui/uikit";\nimport { cn } from "../lib/cn";\nconst s = "@vamos-ui/react is great";`;
    expect(rewriteImports(src, alias)).toBe(src);
  });
  it("strips a trailing slash from the alias", () => {
    expect(rewriteImports(`from "@vamos-ui/react/format"`, "~/ui/")).toBe(`from "~/ui/format"`);
  });
});

describe("targetPath / safeRelative", () => {
  it("places kit files under uiDir keeping structure", () => {
    expect(targetPath({ name: "button", type: "component" }, { path: "components/button.tsx", content: "" }, config)).toBe("src/components/vamos/components/button.tsx");
    expect(targetPath({ name: "styles", type: "style" }, { path: "styles/base.css", content: "" }, config)).toBe("src/components/vamos/styles/base.css");
  });
  it("places block files under blocksDir/<name>", () => {
    expect(targetPath({ name: "login-01", type: "block" }, { path: "blocks/login-01/page.tsx", content: "" }, config)).toBe("src/components/blocks/login-01/page.tsx");
    expect(targetPath({ name: "login-01", type: "block" }, { path: "page.tsx", content: "" }, config)).toBe("src/components/blocks/login-01/page.tsx");
  });
  it("refuses paths that escape", () => {
    expect(() => safeRelative("../../etc/passwd")).toThrow();
    expect(() => safeRelative("/abs/file.ts")).toThrow();
    expect(safeRelative("./components/a.tsx")).toBe("components/a.tsx");
  });
});

describe("resolveItems", () => {
  const byName = new Map(fixtureItems().map((i) => [i.name, i]));
  const fetchItem = async (n: string) => {
    const it = byName.get(n);
    if (!it) throw new Error(`missing ${n}`);
    return it;
  };

  it("orders dependencies before dependents", async () => {
    const { items } = await resolveItems(["dialog"], fetchItem);
    const names = items.map((i) => i.name);
    expect(names).toEqual(["lib-cn", "tooltip", "button", "lib-labels", "dialog"]);
  });

  it("dedupes shared dependencies across requested items", async () => {
    const { items, requested } = await resolveItems(["button", "dialog", "data-table", "button"], fetchItem);
    const names = items.map((i) => i.name);
    expect(requested).toEqual(["button", "dialog", "data-table"]);
    expect(new Set(names).size).toBe(names.length);
    for (const it of items) for (const dep of it.registryDependencies) expect(names.indexOf(dep)).toBeLessThan(names.indexOf(it.name));
  });

  it("breaks cycles and reports them", async () => {
    const a = { ...byName.get("lib-cn")!, name: "a", registryDependencies: ["b"] } as RegistryItem;
    const b = { ...byName.get("lib-cn")!, name: "b", registryDependencies: ["a"] } as RegistryItem;
    const res = await resolveItems(["a"], async (n) => (n === "a" ? a : b));
    expect(res.items.map((i) => i.name)).toEqual(["b", "a"]);
    expect(res.cycles).toEqual([["a", "b", "a"]]);
  });

  it("propagates unknown items", async () => {
    await expect(resolveItems(["nope"], fetchItem)).rejects.toThrow("missing nope");
  });

  it("merges npm dependencies", () => {
    expect(collectDependencies([{ dependencies: ["radix-ui@^1.4.3", "clsx"] }, { dependencies: ["clsx@^2.1.1", "@tanstack/react-table@^9.3.1", "radix-ui@^1.0.0"] }])).toEqual([
      "@tanstack/react-table@^9.3.1",
      "clsx@^2.1.1",
      "radix-ui@^1.4.3",
    ]);
    expect(parseSpec("@tanstack/react-table@^9.3.1")).toEqual({ name: "@tanstack/react-table", range: "^9.3.1" });
    expect(parseSpec("@scope/pkg")).toEqual({ name: "@scope/pkg", range: "" });
  });
});

describe("lockfile + classify", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "vamos-lock-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("hashes with normalised line endings", () => {
    expect(sha256("a\r\nb")).toBe(sha256("a\nb"));
    expect(sha256("a")).not.toBe(sha256("b"));
  });

  it("records items and finds owners", () => {
    const lock = emptyLock("r");
    recordItem(lock, "button", { version: "0.2.0", type: "component", files: { "x/button.tsx": sha256("x") } });
    expect(ownerOf(lock, "x/button.tsx")).toBe("button");
    expect(ownerOf(lock, "x/other.tsx")).toBeNull();
    expect(lock.items.button!.installedAt).toMatch(/^\d{4}-/);
  });

  it("detects unchanged, modified and missing files", async () => {
    writeFileSync(path.join(dir, "a.ts"), "one");
    expect(await fileState(dir, "a.ts", sha256("one"))).toBe("unchanged");
    expect(await fileState(dir, "a.ts", sha256("two"))).toBe("modified");
    expect(await fileState(dir, "b.ts", sha256("one"))).toBe("missing");
  });

  it("classifies with the lock hash as merge base", () => {
    const base = sha256("v1");
    expect(classify("v1", "v1", base)).toBe("up-to-date");
    expect(classify("v1", "v2", base)).toBe("upstream");
    expect(classify("mine", "v1", base)).toBe("local");
    expect(classify("mine", "v2", base)).toBe("both");
    expect(classify(null, "v2", base)).toBe("missing");
    expect(classify(null, "v2", undefined)).toBe("new");
    expect(classify("other", "v2", undefined)).toBe("both");
  });

  it("plans create / identical / update / conflict", async () => {
    const button = fixtureItems().find((i) => i.name === "button")!;
    const cfg = { ...config, uiDir: "ui" };
    const rel = "ui/components/button.tsx";
    const lock = emptyLock("r");
    expect((await planInstall(dir, cfg, [button], lock)).files[0]!.action).toBe("create");

    mkdirSync(path.join(dir, "ui/components"), { recursive: true });
    writeFileSync(path.join(dir, rel), button.files[0]!.content);
    expect((await planInstall(dir, cfg, [button], lock)).files[0]!.action).toBe("identical");

    // pristine old version recorded in the lock → safe update
    writeFileSync(path.join(dir, rel), "old version");
    recordItem(lock, "button", { version: "0.1.0", type: "component", files: { [rel]: sha256("old version") } });
    expect((await planInstall(dir, cfg, [button], lock)).files[0]!.action).toBe("update");

    // edited by the user → conflict, unless --overwrite
    writeFileSync(path.join(dir, rel), "my edits");
    expect((await planInstall(dir, cfg, [button], lock)).files[0]!.action).toBe("conflict");
    expect((await planInstall(dir, cfg, [button], lock, { overwrite: true })).files[0]!.action).toBe("update");
  });
});

describe("indexes", () => {
  it("collects value and type exports", () => {
    const ex = collectExports(`export const A = 1;\nexport function B() {}\nexport interface C {}\nexport type D = 1;\nexport { E, F as G, type H };\nexport type { I } from "./i";\nexport default 1;`);
    expect(ex.values.sort()).toEqual(["A", "B", "E", "G"]);
    expect(ex.types.sort()).toEqual(["C", "D", "H", "I"]);
  });
  it("uses export * and falls back to explicit exports on clashes", () => {
    const out = buildIndex([
      { spec: "./a", code: "export const x = 1; export type T = 1;" },
      { spec: "./b", code: "export const x = 2; export const y = 3; export interface U {}" },
    ]);
    expect(out.startsWith(INDEX_HEADER)).toBe(true);
    expect(out).toContain(`export * from "./a";`);
    expect(out).toContain(`export { y } from "./b";`);
    expect(out).toContain(`export type { U } from "./b";`);
  });
});

describe("css", () => {
  it("computes the relative import", () => {
    expect(stylesImportPath("src/app/globals.css", "src/components/vamos")).toBe("../components/vamos/styles.css");
    expect(stylesImportPath("src/index.css", "src/ui")).toBe("./ui/styles.css");
  });
  it("adds the import after tailwind, once", () => {
    const css = `@import "tailwindcss";\n@plugin "x";\n\nbody { margin: 0; }\n`;
    const once = addStylesImport(css, "../ui/styles.css")!;
    expect(once.css).toBe(`@import "tailwindcss";\n@import "../ui/styles.css";\n@plugin "x";\n\nbody { margin: 0; }\n`);
    expect(once.afterTailwind).toBe(true);
    expect(addStylesImport(once.css, "../ui/styles.css")).toBeNull();
  });
  it("falls back to the top when tailwind is missing", () => {
    const res = addStylesImport(`body {}\n`, "./ui/styles.css")!;
    expect(res.css.startsWith(`@import "./ui/styles.css";`)).toBe(true);
    expect(res.afterTailwind).toBe(false);
  });
});

describe("registry helpers", () => {
  const items = fixtureItems();
  it("resolves the registry location", () => {
    expect(resolveRegistryLocation({ cwd: "/p", env: {} })).toBe("https://ui.vamos.ist/r");
    expect(resolveRegistryLocation({ cwd: "/p", env: { VAMOS_REGISTRY: "./reg" } })).toBe(path.resolve("/p", "reg"));
    expect(resolveRegistryLocation({ cwd: "/p", flag: "https://x.dev/r/", env: { VAMOS_REGISTRY: "./reg" } })).toBe("https://x.dev/r");
    expect(resolveRegistryLocation({ cwd: "/p", config: "https://c.dev/r", env: {} })).toBe("https://c.dev/r");
  });
  it("folds Turkish characters", () => {
    expect(fold("DÜĞME İşlem ı")).toBe("dugme islem i");
  });
  it("ranks name matches first and is Turkish-insensitive", () => {
    expect(searchItems(items, "button")[0]!.name).toBe("button");
    expect(searchItems(items, "DUGME").map((i) => i.name)).toEqual(["button"]);
    expect(searchItems(items, "modal focus").map((i) => i.name)).toEqual(["dialog"]);
    expect(searchItems(items, "zzz")).toEqual([]);
  });
  it("suggests close names", () => {
    expect(suggest("buton", items)).toContain("button");
    expect(suggest("dailog", items)).toContain("dialog");
  });
});

describe("config + args + agent", () => {
  it("validates config paths", () => {
    expect(() => validateConfig({ uiDir: "../outside" })).toThrow();
    expect(() => validateConfig({ tsx: "yes" })).toThrow();
    expect(validateConfig({ importAlias: "@/ui/" }).importAlias).toBe("@/ui");
  });
  it("parses flags", () => {
    expect(parseArgs(["add", "button", "dialog", "--no-install", "-y", "--registry", "./r", "--type=block"])).toEqual({
      command: "add",
      positionals: ["button", "dialog"],
      flags: { install: false, yes: true, registry: "./r", type: "block" },
    });
  });
  it("upserts the agent rules block idempotently", () => {
    const block = agentRules(config);
    const first = upsertBlock("# Project\n", block);
    expect(first).toContain("# Project");
    expect(upsertBlock(first, block)).toBe(first);
  });
});

describe("fixture sanity", () => {
  it("fixture files exist for every item", () => {
    for (const it of fixtureItems()) expect(it.files.length).toBeGreaterThan(0);
  });
});
