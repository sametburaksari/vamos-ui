#!/usr/bin/env node
// Build the publishable @vamos-ui/react package into packages/ui/.npm/
//   node packages/ui/scripts/build-npm.mjs        → then: cd packages/ui/.npm && npm publish
// The workspace keeps importing src/*.ts directly; only the npm package gets compiled JS + .d.ts.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(PKG, ".npm");
const DIST = path.join(OUT, "dist");
const SRC = path.join(PKG, "src");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// 1. Compile (JS + declarations), tests excluded. "use client" directives are kept by tsc.
const tsconfig = path.join(PKG, "tsconfig.npm.json");
fs.writeFileSync(
  tsconfig,
  JSON.stringify(
    {
      extends: "../../tsconfig.base.json",
      compilerOptions: {
        noEmit: false,
        declaration: true,
        declarationMap: false,
        sourceMap: false,
        jsx: "react-jsx",
        outDir: ".npm/dist",
        rootDir: "src",
        types: [],
      },
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/_fixtures*", "src/**/__tests__/**"],
    },
    null,
    2,
  ),
);
try {
  execFileSync(path.join(PKG, "node_modules/.bin/tsc"), ["-p", tsconfig], { cwd: PKG, stdio: "inherit" });
} finally {
  fs.rmSync(tsconfig, { force: true });
}

// 2. Make relative specifiers fully specified (./button → ./button.js, ./charts → ./charts/index.js)
//    so the package works in Node ESM and in every bundler.
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const SPEC = /((?:from|import)\s*\(?\s*["'])(\.{1,2}\/[^"']*)(["'])/g;
function resolveSpec(file, spec) {
  if (/\.(js|json|css)$/.test(spec)) return spec;
  const base = path.resolve(path.dirname(file), spec);
  if (fs.existsSync(base + ".js")) return spec + ".js";
  if (fs.existsSync(path.join(base, "index.js"))) return spec.replace(/\/$/, "") + "/index.js";
  return spec;
}
let unresolved = 0;
for (const file of walk(DIST)) {
  if (!/\.(js|d\.ts)$/.test(file)) continue;
  const code = fs.readFileSync(file, "utf8");
  const next = code.replace(SPEC, (m, a, spec, z) => {
    const r = resolveSpec(file.endsWith(".d.ts") ? file.replace(/\.d\.ts$/, ".js") : file, spec);
    if (r === spec && !/\.(js|json|css)$/.test(spec)) unresolved++;
    return a + r + z;
  });
  if (next !== code) fs.writeFileSync(file, next);
}
if (unresolved) console.warn(`! ${unresolved} relative imports could not be resolved`);

// 3. Non-TS assets: stylesheets and JSON data (JSON imports get the import attribute Node needs).
for (const file of walk(SRC)) {
  if (!/\.(css|json)$/.test(file)) continue;
  const to = path.join(DIST, path.relative(SRC, file));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(file, to);
}
for (const file of walk(DIST)) {
  if (!file.endsWith(".js")) continue;
  const code = fs.readFileSync(file, "utf8");
  const next = code.replace(/(import\s+[\w{}\s,*]+\s+from\s+["'][^"']+\.json["'])(?!\s*with)/g, '$1 with { type: "json" }');
  if (next !== code) fs.writeFileSync(file, next);
}

// 4. package.json for npm: same exports, pointing at dist.
const pkg = JSON.parse(fs.readFileSync(path.join(PKG, "package.json"), "utf8"));
const exportsMap = {};
for (const [key, target] of Object.entries(pkg.exports)) {
  if (target.endsWith(".css")) {
    exportsMap[key] = target.replace("./src/", "./dist/");
    continue;
  }
  const js = target.replace("./src/", "./dist/").replace(/\.tsx?$/, ".js");
  exportsMap[key] = { types: js.replace(/\.js$/, ".d.ts"), default: js };
}
const out = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  license: pkg.license,
  type: "module",
  sideEffects: ["**/*.css"],
  exports: exportsMap,
  files: ["dist", "README.md", "CHANGELOG.md", "LICENSE"],
  repository: { type: "git", url: "git+https://github.com/sametburaksari/vamos-ui.git", directory: "packages/ui" },
  homepage: "https://ui.vamos.ist",
  bugs: "https://github.com/sametburaksari/vamos-ui/issues",
  keywords: ["react", "components", "ui", "admin", "dashboard", "tailwindcss", "design-system", "vamos-ui"],
  peerDependencies: pkg.peerDependencies,
  dependencies: pkg.dependencies,
  publishConfig: { access: "public" },
};
fs.writeFileSync(path.join(OUT, "package.json"), JSON.stringify(out, null, 2) + "\n");
fs.copyFileSync(path.join(PKG, "LICENSE"), path.join(OUT, "LICENSE"));
fs.copyFileSync(path.join(PKG, "CHANGELOG.md"), path.join(OUT, "CHANGELOG.md"));
fs.writeFileSync(
  path.join(OUT, "README.md"),
  `# @vamos-ui/react

One component kit for every admin panel — CMS, CRM, HR, partner portals — and the websites around them.
Six theme axes: mode, material (glass/solid), accent, density, font and corners (data-radius).

Docs: https://ui.vamos.ist · Source: https://github.com/sametburaksari/vamos-ui

\`\`\`bash
pnpm add @vamos-ui/react
\`\`\`

\`\`\`css
/* app/globals.css (Tailwind CSS v4) */
@import "tailwindcss";
@import "@vamos-ui/react/styles.css";
\`\`\`

\`\`\`tsx
import { Button } from "@vamos-ui/react";

export default function Page() {
  return <Button>Save</Button>;
}
\`\`\`

Next.js with webpack (\`next build --webpack\`, the Next.js 15 default): add
\`experimental: { optimizePackageImports: ["@vamos-ui/react"] }\` to next.config, or a Server Component
that imports from the package root ships every client component. Turbopack and Vite need nothing.

Prefer to own the source? Copy single components with the CLI: \`npx vamos-ui add button\`.

MIT licensed. “Vamos UI” and the logo are trademarks of Vamos.
`,
);
const count = walk(DIST).length;
console.log(`✓ ${pkg.name}@${pkg.version} → ${path.relative(process.cwd(), OUT)} (${count} files)`);
