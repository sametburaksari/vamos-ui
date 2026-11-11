// @ts-check
// Run: node --test scripts/registry/*.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { buildRegistry, dependencyClosure, libItemName, readGuidance, writeRegistry } from "./build.mjs";
import { extractTokens } from "./css.mjs";
import { validateSchema } from "./json-schema.mjs";
import { ModuleTree, packageName, parseModule } from "./modules.mjs";
import { collectConsts, evaluate, findDefaultExport, parseSource } from "./ts-static.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tmp = (/** @type {string} */ prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/** Writes a file tree: { "a/b.ts": "…" }. @param {string} root @param {Record<string, string>} files */
function writeTree(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
}

describe("ts-static", () => {
  test("evaluates literals, templates, consts, spreads and helper calls", () => {
    const sf = parseSource(
      "x.tsx",
      `const base = { group: "Forms" };
       const tail = ["c"];
       const entry = { ...base, slug: "a", usage: \`import { A } from "x";\n<A />\`, list: ["b", ...tail], n: -2, demo: ex("demo", "Demo", "a/demo.tsx", Demo, "Desc") } satisfies Entry;
       export default entry;`,
    );
    const expr = findDefaultExport(sf);
    assert.ok(expr);
    /** @type {string[]} */
    const unknown = [];
    const value = evaluate(expr, {
      sourceFile: sf,
      consts: collectConsts(sf),
      calls: { ex: ([id, title, file, , description]) => ({ id, title, file, description }) },
      onUnknown: (_n, reason) => unknown.push(reason),
    });
    assert.deepEqual(value, {
      group: "Forms",
      slug: "a",
      usage: 'import { A } from "x";\n<A />',
      list: ["b", "c"],
      n: -2,
      demo: { id: "demo", title: "Demo", file: "a/demo.tsx", description: "Desc" },
    });
    assert.deepEqual(unknown, []);
  });

  test("reports non-static values", () => {
    const sf = parseSource("x.ts", "export default { a: someCall(), b: `x${y}` };");
    /** @type {string[]} */
    const unknown = [];
    evaluate(/** @type {any} */ (findDefaultExport(sf)), { sourceFile: sf, consts: new Map(), calls: {}, onUnknown: (_n, r) => unknown.push(r) });
    assert.equal(unknown.length, 2, unknown.join("; "));
  });
});

describe("modules", () => {
  test("collects imports, exports and barrel status", () => {
    const m = parseModule(
      "a.tsx",
      "/a.tsx",
      `"use client";
       import * as React from "react";
       import type { T } from "./types";
       import { b as c } from "./b";
       export const x = 1, y = 2;
       export function f() { return import("./lazy.json"); }
       export default function Page() {}
       export { c };`,
    );
    assert.deepEqual([...m.localExports].sort(), ["c", "default", "f", "x", "y"]);
    assert.deepEqual(
      m.imports.map((i) => [i.spec, i.names.join(","), i.typeOnly]),
      [
        ["react", "*", false],
        ["./types", "T", true],
        ["./b", "b", false],
        ["./lazy.json", "*", false],
      ],
    );
    assert.equal(m.pureBarrel, false);
    const barrel = parseModule("index.ts", "/index.ts", `// Public API\nexport * from "./a";\nexport { z } from "zod";\nexport type { T } from "./types";`);
    assert.equal(barrel.pureBarrel, true);
  });

  test("resolves declarations through barrels and npm re-exports", () => {
    const root = tmp("vamos-mod-");
    writeTree(root, {
      "index.ts": 'export * from "./components/button";\nexport { z } from "zod";\nexport { Card as Panel } from "./components/card";',
      "components/button.tsx": "export function Button() {}",
      "components/card.tsx": "export const Card = 1;",
      "components/button.test.tsx": "import './button';",
    });
    const tree = new ModuleTree(root);
    assert.equal(tree.has("components/button.test.tsx"), false, "test files are skipped");
    assert.equal(tree.declarationOf("index.ts", "Button"), "components/button.tsx");
    assert.equal(tree.declarationOf("index.ts", "Panel"), "components/card.tsx");
    assert.equal(tree.declarationOf("index.ts", "z"), "npm:zod");
    assert.equal(tree.declarationOf("index.ts", "Nope"), undefined);
    assert.equal(tree.resolve("components/card.tsx", "./button"), "components/button.tsx");
    assert.equal(tree.resolve("components/card.tsx", ".."), "index.ts");
    assert.deepEqual(tree.barrelTargets("index.ts").sort(), ["components/button.tsx", "components/card.tsx"]);
  });

  test("packageName handles scopes and subpaths", () => {
    assert.equal(packageName("@tiptap/pm/state"), "@tiptap/pm");
    assert.equal(packageName("react-dom/client"), "react-dom");
    assert.equal(packageName("zod"), "zod");
  });
});

describe("css tokens", () => {
  test("light, dark, axis overrides, @theme and comments", () => {
    const tokens = extractTokens(`
/* ---------- */
/* Accent — derived */
/* ---------- */
:root, [data-accent="lime"] { --accent-base: oklch(0.9 0.2 120); }
[data-accent="ocean"] { --accent-base: blue; }
:root { /* page background */ --scene: #fff; --url: url("data:a;b"); }
.dark { --scene: #000; }
@media (prefers-reduced-motion: reduce) { [data-material="glass"] { --blur: 0px; } }
@layer components { .x { --ignored: 1; } }
@theme inline { --color-scene: var(--scene); }
`);
    const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));
    assert.deepEqual(Object.keys(byName).sort(), ["--accent-base", "--blur", "--color-scene", "--scene", "--url"]);
    assert.equal(byName["--accent-base"].section, "Accent");
    assert.deepEqual(byName["--accent-base"].overrides, [{ selector: '[data-accent="ocean"]', value: "blue" }]);
    assert.equal(byName["--accent-base"].dark, "oklch(0.9 0.2 120)", "dark inherits the light value");
    assert.equal(byName["--scene"].light, "#fff");
    assert.equal(byName["--scene"].dark, "#000");
    assert.equal(byName["--scene"].description, "page background");
    assert.equal(byName["--url"].light, 'url("data:a;b")');
    assert.equal(byName["--blur"].light, null);
    assert.equal(byName["--blur"].overrides[0].selector, '@media (prefers-reduced-motion: reduce) [data-material="glass"]');
    assert.equal(byName["--color-scene"].kind, "theme");
  });
});

describe("helpers", () => {
  test("libItemName", () => {
    assert.equal(libItemName("lib/cn.ts"), "lib-cn");
    assert.equal(libItemName("format/core.ts"), "lib-format-core");
    assert.equal(libItemName("blocks/site/_kit-1.tsx"), "lib-blocks-site-kit-1");
    assert.equal(libItemName("next/index.ts"), "lib-next");
  });

  test("readGuidance keeps only well-formed guidance", () => {
    assert.deepEqual(readGuidance({ whenToUse: ["a"], avoidWhen: [], related: ["b"], extra: 1 }), { whenToUse: ["a"], avoidWhen: [], related: ["b"] });
    assert.equal(readGuidance({ whenToUse: "a" }), undefined);
  });

  test("validateSchema", () => {
    const schema = { type: "object", required: ["a"], additionalProperties: false, properties: { a: { type: "string", pattern: "^x" }, b: { type: "array", items: { enum: [1, 2] } } } };
    assert.deepEqual(validateSchema({ a: "xy", b: [1] }, schema), []);
    assert.equal(validateSchema({ a: "y", b: [3], c: 1 }, schema).length, 3);
  });
});

describe("buildRegistry (fixture repo)", () => {
  const fixture = () => {
    const root = tmp("vamos-fixture-");
    const entry = (/** @type {string} */ slug, /** @type {string[]} */ source) => `import { ex, type DocEntry } from "../types";
import Demo from "../examples/${slug}/demo";
const entry: DocEntry = {
  slug: "${slug}", title: "${slug.toUpperCase()}", group: "Foundations", description: "The ${slug}.",
  source: ${JSON.stringify(source)},
  usage: \`import { X } from "@vamos-ui/react";\`,
  demo: ex("demo", "Demo", "${slug}/demo.tsx", Demo),
  examples: [],
  api: [{ name: "X", props: [{ name: "size", type: '"sm" | "md"', default: '"md"', description: "Size." }] }],
  covers: ["${slug}"],
};
export default entry;`;
    writeTree(root, {
      "packages/ui/package.json": JSON.stringify({
        name: "@vamos-ui/react",
        exports: { ".": "./src/index.ts", "./styles.css": "./src/styles.css", "./charts": "./src/charts/index.ts" },
        peerDependencies: { react: "^19.0.0" },
        dependencies: { clsx: "^2.1.1", "radix-ui": "^1.8.1" },
      }),
      "packages/ui/src/styles.css": ':root { --fg: #111; }\n.dark { --fg: #eee; }\n[data-accent="ocean"] { --accent-base: blue; }\n@import "./styles/base.css";',
      "packages/ui/src/styles/base.css": ".x { color: var(--fg); }",
      "packages/ui/src/index.ts": 'export * from "./lib/public";\nexport * from "./components/button";\nexport * from "./components/dialog";',
      "packages/ui/src/lib/public.ts": 'export { cn } from "./cn";',
      "packages/ui/src/lib/cn.ts": 'import { clsx } from "clsx";\nexport const cn = (...a: string[]) => clsx(a);',
      "packages/ui/src/components/button.tsx": 'import * as React from "react";\nimport { cn } from "../lib/cn";\nimport { ring } from "./shared";\nexport function Button() { return cn(ring); }',
      "packages/ui/src/components/dialog.tsx": 'import { Dialog as D } from "radix-ui";\nimport { Button } from "./button";\nimport { ring } from "./shared";\nimport { only } from "./private";\nexport const Dialog = [D, Button, ring, only];',
      "packages/ui/src/components/shared.ts": 'import { deep } from "./deep";\nexport const ring = deep;',
      "packages/ui/src/components/deep.ts": "export const deep = 1;",
      "packages/ui/src/components/private.ts": "export const only = 1;",
      "packages/ui/src/components/dialog-extra.tsx": "export const Extra = 1;",
      "packages/ui/src/charts/index.ts": 'export { Spark } from "./spark";',
      "packages/ui/src/charts/spark.tsx": 'import { cn } from "../lib/cn";\nexport const Spark = cn;',
      "apps/www/src/docs/entries/button.tsx": entry("button", ["components/button.tsx", "lib/cn.ts", "styles/base.css"]),
      "apps/www/src/docs/entries/dialog.tsx": entry("dialog", ["components/dialog.tsx", "components/private.ts", "components/dialog-extra.tsx"]),
      "apps/www/src/docs/entries/index.ts": "export const entries = [];",
      "apps/www/src/docs/examples/button/demo.tsx": 'import { Button } from "@vamos-ui/react";\nexport default () => <Button />;',
      "apps/www/src/docs/examples/dialog/demo.tsx": 'import { Dialog } from "@vamos-ui/react";\nexport default () => Dialog;',
      "apps/www/src/blocks/types.ts": "export type BlockMeta = {};",
      "apps/www/src/blocks/shell-01/meta.ts": 'const meta = { title: "Shell", description: "App shell.", category: "App shells", files: ["shell-01/page.tsx"] };\nexport default meta;',
      "apps/www/src/blocks/shell-01/page.tsx": 'import { Button } from "@vamos-ui/react";\nexport default function Page() { return Button; }',
      "apps/www/src/blocks/dash-01/meta.ts": 'import type { BlockMeta } from "../types";\nconst meta: BlockMeta = { title: "Dash", description: "Dashboard.", category: "Dashboards", tags: ["cms"], files: ["dash-01/page.tsx", "shell-01/page.tsx"] };\nexport default meta;',
      "apps/www/src/blocks/dash-01/page.tsx": 'import Shell from "../shell-01/page";\nimport { Tile } from "./components/tile";\nimport { Spark } from "@vamos-ui/react/charts";\nimport "@vamos-ui/react/styles.css";\nimport { Plus } from "lucide-react";\nexport default function Page() { return [Shell, Tile, Spark, Plus]; }',
      "apps/www/src/blocks/dash-01/components/tile.tsx": 'import { Button } from "@vamos-ui/react";\nexport const Tile = Button;',
      "registry/guidance/button.json": JSON.stringify({ whenToUse: ["Actions"], avoidWhen: ["Navigation"], related: ["dialog"] }),
    });
    return root;
  };

  test("assigns files, promotes shared modules and resolves dependencies", () => {
    const result = buildRegistry({ root: fixture() });
    assert.deepEqual(result.errors, []);
    const by = Object.fromEntries(result.items.map((i) => [i.name, i]));
    assert.deepEqual(Object.keys(by).sort(), ["button", "dash-01", "dialog", "lib-charts-spark", "lib-cn", "lib-components-dialog-extra", "lib-components-shared", "lib-public", "shell-01", "styles"]);

    // shared.ts is imported by two components → its own lib item; deep.ts stays inside it.
    assert.deepEqual(by["lib-components-shared"].files.map((f) => f.path), ["components/shared.ts", "components/deep.ts"]);
    assert.deepEqual(by.button.registryDependencies, ["lib-cn", "lib-components-shared", "styles"]);
    assert.deepEqual(by.button.dependencies, [], "react is a peer dependency");
    assert.deepEqual(by.button.guidance, { whenToUse: ["Actions"], avoidWhen: ["Navigation"], related: ["dialog"] });
    assert.equal(by.button.examples?.[0].code, 'import { Button } from "@vamos-ui/react";\nexport default () => <Button />;');
    assert.deepEqual(by.button.props, [{ component: "X", props: [{ name: "size", type: '"sm" | "md"', default: '"md"', description: "Size." }] }]);

    // A listed module the primary imports is owned; one it does not import becomes a dependency.
    assert.deepEqual(by.dialog.files.map((f) => f.path), ["components/dialog.tsx", "components/private.ts"]);
    assert.deepEqual(by.dialog.registryDependencies, ["button", "lib-components-dialog-extra", "lib-components-shared", "styles"]);
    assert.deepEqual(by.dialog.dependencies, ["radix-ui@^1.8.1"]);

    // Blocks: own files only, sibling blocks and kit items as registry dependencies.
    assert.deepEqual(by["dash-01"].files.map((f) => f.path), ["blocks/dash-01/page.tsx", "blocks/dash-01/components/tile.tsx"]);
    assert.deepEqual(by["dash-01"].registryDependencies, ["button", "lib-charts-spark", "shell-01", "styles"]);
    assert.deepEqual(by["dash-01"].dependencies, ["lucide-react"]);
    assert.ok(result.warnings.some((w) => w.includes('"lucide-react"')), "unknown npm packages are reported");
    assert.equal(by["dash-01"].category, "Dashboards");
    assert.equal(by["dash-01"].docs, "https://ui.vamos.ist/blocks#dash-01");

    assert.deepEqual(by.styles.files.map((f) => f.path), ["styles.css", "styles/base.css"]);
    assert.deepEqual([...dependencyClosure("dash-01", new Map(result.items.map((i) => [i.name, i])))].sort(), ["button", "dash-01", "lib-charts-spark", "lib-cn", "lib-components-shared", "shell-01", "styles"]);
  });

  test("splits an umbrella entry whose primary module other items import", () => {
    const root = fixture();
    // The block now imports Dialog; installing it must not pull dialog's documented extras.
    fs.writeFileSync(path.join(root, "apps/www/src/blocks/dash-01/components/tile.tsx"), 'import { Dialog } from "@vamos-ui/react";\nexport const Tile = Dialog;');
    const result = buildRegistry({ root });
    assert.deepEqual(result.errors, []);
    const by = Object.fromEntries(result.items.map((i) => [i.name, i]));
    assert.deepEqual(by.dialog.files, []);
    assert.deepEqual(by.dialog.registryDependencies, ["lib-components-dialog", "lib-components-dialog-extra", "styles"]);
    assert.deepEqual(by["lib-components-dialog"].files.map((f) => f.path), ["components/dialog.tsx", "components/private.ts"]);
    assert.ok(by["dash-01"].registryDependencies.includes("lib-components-dialog"));
    assert.ok(!by["dash-01"].registryDependencies.includes("dialog"));
    assert.ok(result.info.some((m) => m.includes('"dialog" is an umbrella')));
  });

  test("reports unresolved imports and missing example files", () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, "packages/ui/src/components/deep.ts"), 'import { gone } from "./gone";\nexport const deep = gone;');
    fs.rmSync(path.join(root, "apps/www/src/docs/examples/dialog/demo.tsx"));
    const { errors } = buildRegistry({ root });
    assert.ok(errors.some((e) => e.includes('cannot resolve "./gone"')), errors.join("\n"));
    assert.ok(errors.some((e) => e.includes('example file "dialog/demo.tsx" not found')), errors.join("\n"));
  });

  test("enforces the naming rule", () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, "packages/ui/src/components/private.ts"), `// like ${["sha", "dcn"].join("")}\nexport const only = 1;`);
    assert.ok(buildRegistry({ root }).errors.some((e) => e.includes("forbidden product name")));
  });
});

describe("buildRegistry (this repository)", () => {
  const result = buildRegistry({ root: repoRoot });
  const outDir = tmp("vamos-registry-");
  writeRegistry(result, outDir);
  const read = (/** @type {string} */ f) => JSON.parse(fs.readFileSync(path.join(outDir, f), "utf8"));

  test("builds without errors", () => {
    assert.deepEqual(result.errors, []);
  });

  test("covers every docs entry and block", () => {
    const entries = fs.readdirSync(path.join(repoRoot, "apps/www/src/docs/entries")).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(".tsx", ""));
    const blocks = fs.readdirSync(path.join(repoRoot, "apps/www/src/blocks")).filter((d) => fs.existsSync(path.join(repoRoot, "apps/www/src/blocks", d, "meta.ts")));
    const names = new Set(result.items.map((i) => i.name));
    for (const e of entries) assert.ok(names.has(e), `docs entry ${e}`);
    for (const b of blocks) assert.ok(names.has(b), `block ${b}`);
    assert.ok(entries.length >= 85, `expected 85+ docs entries, found ${entries.length}`);
    assert.ok(blocks.length >= 40, `expected 40+ blocks, found ${blocks.length}`);
    assert.equal(result.items.filter((i) => i.type === "component").length, entries.length);
    // + "blocks-shared": the fixtures in apps/www/src/blocks/_shared, published as a block-type item.
    assert.equal(result.items.filter((i) => i.type === "block" && i.name !== "blocks-shared").length, blocks.length);
  });

  test("every written item validates against r/schema.json", () => {
    const schema = read("schema.json");
    const index = read("index.json");
    assert.deepEqual(validateSchema(index, read("index-schema.json")), []);
    assert.equal(index.items.length, result.items.length);
    for (const entry of index.items) {
      const item = read(`${entry.name}.json`);
      assert.deepEqual(validateSchema(item, schema), [], entry.name);
      for (const key of Object.keys(entry)) assert.deepEqual(item[key], entry[key], `${entry.name}.${key} matches index.json`);
    }
  });

  test("dependencies resolve and npm packages carry versions from packages/ui", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "packages/ui/package.json"), "utf8"));
    const names = new Set(result.items.map((i) => i.name));
    for (const item of result.items) {
      for (const d of item.registryDependencies) assert.ok(names.has(d), `${item.name} → ${d}`);
      for (const d of item.dependencies) {
        const at = d.lastIndexOf("@");
        assert.ok(at > 0, `${item.name}: ${d} has a version`);
        assert.equal(pkg.dependencies[d.slice(0, at)], d.slice(at + 1), `${item.name}: ${d}`);
      }
      if (item.type === "component" || item.type === "block") assert.ok(item.registryDependencies.includes("styles"), `${item.name} needs styles`);
    }
  });

  test("tokens and axes", () => {
    const tokens = read("tokens.json");
    const accent = tokens.find((/** @type {{ name: string }} */ t) => t.name === "--accent-base");
    assert.ok(accent?.overrides.some((/** @type {{ selector: string }} */ o) => o.selector.includes('data-accent="ocean"')));
    const fg = tokens.find((/** @type {{ name: string }} */ t) => t.name === "--fg");
    assert.notEqual(fg.light, fg.dark);
    const { axes } = read("axes.json");
    assert.deepEqual(axes.map((/** @type {{ name: string }} */ a) => a.name), ["theme", "material", "accent", "density", "font"]);
  });

  test("ships the kit barrels and the agent skill for the CLI", () => {
    const barrels = new Map(result.barrels.files.map((f) => [f.path, f.content]));
    assert.ok(barrels.get("index.ts")?.includes('export * from "./lib/public"'));
    assert.ok(barrels.has("lib/public.ts"));
    assert.ok(barrels.get("blocks/schema/index.ts")?.includes('from "zod"'));
    // Real modules named index.ts belong to items, not to the barrels.
    assert.ok(!barrels.has("next/index.ts"));
    const skill = result.skill.map((f) => f.path);
    assert.ok(skill.includes("SKILL.md"));
    assert.ok(skill.some((p) => p.startsWith("references/")));
  });

  test("is deterministic", () => {
    const again = buildRegistry({ root: repoRoot });
    assert.deepEqual(JSON.stringify(again.items), JSON.stringify(result.items));
    assert.deepEqual(again.tokens, result.tokens);
  });
});
