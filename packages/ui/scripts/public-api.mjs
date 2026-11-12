#!/usr/bin/env node
// Lists the public API of @vamos-ui/react: every export name of every package.json entry point,
// split into runtime values and type-only names (resolved with the TypeScript checker).
//   node packages/ui/scripts/public-api.mjs           → prints the JSON
//   node packages/ui/scripts/public-api.mjs --write   → updates test/public-api.json (the snapshot
//                                                        test/public-api.test.ts compares against)
// Run --write only when an export is added or removed on purpose.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = createRequire(path.join(PKG, "package.json"))("typescript");

/** Entry points: export key → source file. "./locale/*" expands to one entry per locale. */
export function entryPoints(pkgDir = PKG) {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
  const out = {};
  for (const [key, target] of Object.entries(pkg.exports)) {
    if (typeof target !== "string" || target.endsWith(".css")) continue;
    if (key.includes("*")) {
      const [dir, ext] = target.split("*");
      const abs = path.join(pkgDir, dir);
      for (const f of fs.readdirSync(abs).filter((f) => f.endsWith(ext) && !f.includes(".test.")).sort()) {
        out[key.replace("*", f.slice(0, -ext.length))] = path.join(abs, f);
      }
    } else out[key] = path.join(pkgDir, target);
  }
  return out;
}

export function publicApi(pkgDir = PKG) {
  const entries = entryPoints(pkgDir);
  const config = ts.getParsedCommandLineOfConfigFile(path.join(pkgDir, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const program = ts.createProgram(Object.values(entries), { ...config.options, noEmit: true, types: [] });
  const checker = program.getTypeChecker();
  const api = {};
  for (const [key, file] of Object.entries(entries)) {
    const sf = program.getSourceFile(file);
    const sym = sf && checker.getSymbolAtLocation(sf);
    const values = [];
    const types = [];
    for (const ex of sym ? checker.getExportsOfModule(sym) : []) {
      const target = ex.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(ex) : ex;
      (target.flags & ts.SymbolFlags.Value ? values : types).push(ex.name);
    }
    api[key] = { values: values.sort(), types: types.sort() };
  }
  return api;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const json = JSON.stringify(publicApi(), null, 1) + "\n";
  if (process.argv.includes("--write")) {
    fs.writeFileSync(path.join(PKG, "test/public-api.json"), json);
    console.log("✓ test/public-api.json updated");
  } else process.stdout.write(json);
}
