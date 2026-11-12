// Builds barrel files out of named re-exports (`export { A, B } from "./a"` + `export type { … }`)
// instead of `export * from "./a"`. Used by scripts/gen.mjs for src/index.ts.
//
// Why: when a server component imports one name from a barrel, Next.js (Turbopack) follows every
// `export *` line and ships each "use client" module behind it; with named lines it keeps only
// the modules whose names are imported. Webpack (with optimizePackageImports) and Vite handle both.
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = createRequire(path.join(PKG, "package.json"))("typescript");

const resolveFile = (fromDir, spec) => {
  const base = path.resolve(fromDir, spec);
  for (const c of [".ts", ".tsx", "/index.ts", "/index.tsx"]) if (ts.sys.fileExists(base + c)) return base + c;
  throw new Error(`named-exports: cannot resolve ${spec} from ${fromDir}`);
};

/** Export names of each module, split into runtime values and type-only names. */
export function moduleExports(files) {
  const config = ts.getParsedCommandLineOfConfigFile(path.join(PKG, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const program = ts.createProgram(files, { ...config.options, noEmit: true, types: [] });
  const checker = program.getTypeChecker();
  return files.map((file) => {
    const sf = program.getSourceFile(file);
    const sym = sf && checker.getSymbolAtLocation(sf);
    const values = [];
    const types = [];
    const targets = new Map();
    for (const ex of sym ? checker.getExportsOfModule(sym) : []) {
      if (ex.name === "default") continue; // `export *` never re-exported defaults either
      const target = ex.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(ex) : ex;
      (target.flags & ts.SymbolFlags.Value ? values : types).push(ex.name);
      targets.set(ex.name, target);
    }
    return { values: values.sort(), types: types.sort(), targets };
  });
}

/**
 * Barrel source for `specs` (relative to `dir`), one `export {…}` / `export type {…}` per module.
 * `starred`: modules the barrel already re-exports with `export *` (their names count as taken).
 */
export function namedReExports(dir, specs, starred = []) {
  const all = [...starred, ...specs];
  const exportsOf = moduleExports(all.map((s) => resolveFile(dir, s)));
  const seen = new Map();
  let out = "";
  all.forEach((spec, i) => {
    const { targets } = exportsOf[i];
    // The same declaration reached through two modules is exported once (as `export *` did).
    const own = (n) => {
      const prev = seen.get(n);
      if (!prev) return seen.set(n, { spec, target: targets.get(n) }), true;
      if (prev.target === targets.get(n)) return false;
      throw new Error(`named-exports: "${n}" is exported by both ${prev.spec} and ${spec}`);
    };
    const values = exportsOf[i].values.filter(own);
    const types = exportsOf[i].types.filter(own);
    if (i < starred.length) return;
    if (values.length) out += `export { ${values.join(", ")} } from "${spec}";\n`;
    if (types.length) out += `export type { ${types.join(", ")} } from "${spec}";\n`;
  });
  return out;
}
