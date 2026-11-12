#!/usr/bin/env node
// Bundle-size guard for @vamos-ui/react (CI-friendly: exits 1 on failure).
//   node packages/ui/scripts/size-check.mjs           → checks src/ (the workspace source)
//   node packages/ui/scripts/size-check.mjs --npm     → checks .npm/dist (run build-npm.mjs first)
//   node packages/ui/scripts/size-check.mjs --verbose → also lists the biggest inputs per case
//
// Each case bundles a tiny entry with esbuild (minified, tree-shaken, React external) and fails
// when the gzip size goes over its budget or a module that has no business there shows up
// (editor, charts, font catalog …). Two static rules keep the Next.js/RSC side honest:
//   - no `export *` in the package root barrel (Turbopack then ships every "use client" module);
//   - no imports from the "radix-ui" umbrella (webpack keeps all of Radix); use "radix-ui/<name>".
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.argv.includes("--npm");
const verbose = process.argv.includes("--verbose");

function loadEsbuild() {
  // Not a direct dependency: esbuild comes with the test toolchain (vitest → vite → esbuild).
  let req = createRequire(path.join(PKG, "package.json"));
  for (const via of ["vitest/package.json", "vite/package.json", null]) {
    try {
      return req("esbuild");
    } catch {
      if (!via) throw new Error("size-check: esbuild not found (install the workspace dependencies)");
      req = createRequire(req.resolve(via));
    }
  }
}
const esbuild = loadEsbuild();

const root = npm ? path.join(PKG, ".npm/dist") : path.join(PKG, "src");
const ext = npm ? ".js" : ".ts";
if (!fs.existsSync(path.join(root, "index" + ext))) {
  console.error(`size-check: ${path.relative(process.cwd(), root)} not found${npm ? " — run node packages/ui/scripts/build-npm.mjs first" : ""}`);
  process.exit(1);
}

/** Markers of heavy code that must never reach a bundle that only imports basic components. */
const HEAVY = {
  editor: /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:@tiptap|prosemirror-)/,
  charts: /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:recharts|d3-)/,
  "font catalog": /\/fonts\//,
  "date-fns": /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:date-fns|react-day-picker)/,
  "all of radix": /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?@radix-ui\/react-(?:select|navigation-menu|menubar|slider|toast)\//,
};

// Budgets are gzip KB with ~25% headroom over the size when they were set (2026-11). Raise one
// only for a real new dependency of that component, never to make a leak pass.
const CASES = [
  { name: "Button", code: `export { Button } from "@vamos-ui/react";`, budget: 15, forbid: Object.keys(HEAVY) },
  { name: "Button + Card", code: `export { Button, Card } from "@vamos-ui/react";`, budget: 16, forbid: Object.keys(HEAVY) },
  { name: "cn()", code: `export { cn } from "@vamos-ui/react";`, budget: 11, forbid: Object.keys(HEAVY) },
  {
    name: "Admin screen (shell-01 imports)",
    code: `export { Avatar, Badge, Button, Card, PageHeader, Stat, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DialogTitle, Sheet, SheetContent, IconButton, cn, TooltipProvider } from "@vamos-ui/react";`,
    budget: 105,
    forbid: Object.keys(HEAVY),
  },
];

const failures = [];

for (const c of CASES) {
  const result = await esbuild.build({
    stdin: { contents: c.code, resolveDir: PKG, loader: "ts" },
    bundle: true,
    write: false,
    metafile: true,
    minify: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    logLevel: "silent",
    alias: { "@vamos-ui/react": path.join(root, "index" + ext) },
    external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
    define: { "process.env.NODE_ENV": '"production"' },
    loader: { ".css": "empty" },
  });
  const out = result.outputFiles[0].contents;
  const gz = zlib.gzipSync(out, { level: 9 }).length / 1024;
  const inputs = Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].inputs).filter(([, i]) => i.bytesInOutput > 0);
  const leaks = c.forbid.filter((k) => inputs.some(([f]) => HEAVY[k].test(f)));
  const ok = gz <= c.budget && !leaks.length;
  console.log(`${ok ? "✓" : "✗"} ${c.name.padEnd(34)} ${gz.toFixed(1).padStart(6)} KB gz  (budget ${c.budget} KB)${leaks.length ? `  leaks: ${leaks.join(", ")}` : ""}`);
  if (verbose || !ok) {
    for (const [f, i] of inputs.sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput).slice(0, 12)) {
      console.log(`    ${(i.bytesInOutput / 1024).toFixed(1).padStart(6)} KB  ${f.replace(/^.*node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?/, "").replace(PKG + "/", "")}`);
    }
  }
  if (!ok) failures.push(c.name);
}

// Static rules (source only: they describe how the source is written).
if (!npm) {
  // `export *` is fine only towards a module that is itself named re-exports (lib/public.ts).
  const barrel = fs.readFileSync(path.join(PKG, "src/index.ts"), "utf8");
  const stars = [...barrel.matchAll(/^export \* from "([^"]+)"/gm)].map((m) => m[1]).filter((s) => s !== "./lib/public");
  const publicStars = /^export \*/m.test(fs.readFileSync(path.join(PKG, "src/lib/public.ts"), "utf8"));
  if (stars.length || publicStars) {
    console.log(`✗ \`export *\` in the root barrel (${[...stars, ...(publicStars ? ["lib/public.ts"] : [])].join(", ")}) — run node scripts/gen.mjs; lib/public.ts must list names`);
    failures.push("barrel");
  } else console.log("✓ root barrel uses named re-exports");

  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === "node_modules" ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]));
  const umbrella = walk(path.join(PKG, "src")).filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f) && /from\s+["']radix-ui["']/.test(fs.readFileSync(f, "utf8")));
  if (umbrella.length) {
    console.log(`✗ "radix-ui" umbrella imports (use import * as X from "radix-ui/<name>"):\n    ${umbrella.map((f) => path.relative(PKG, f)).join("\n    ")}`);
    failures.push("radix-ui");
  } else console.log('✓ no "radix-ui" umbrella imports');
}

if (failures.length) {
  console.error(`\nsize-check failed: ${failures.join(", ")}`);
  process.exit(1);
}
