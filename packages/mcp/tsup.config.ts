import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

// verifySource ("vamos-ui/verify") and the brand library ("vamos-ui/brand") come from the
// workspace CLI and are bundled in, so the published server has no runtime dependency on the
// CLI. If a package export is not resolvable (CLI not built yet), bundle straight from its
// source; if neither exists, leave the import external and the tools report it at runtime.
const require = createRequire(import.meta.url);
const sources: Record<string, string[]> = {
  "vamos-ui/verify": ["../cli/src/verify.ts"],
  "vamos-ui/brand": ["../cli/src/brand.ts", "../cli/src/brand/index.ts"],
};
const alias: Record<string, string> = {};
const external: string[] = [];
for (const [specifier, candidates] of Object.entries(sources)) {
  try {
    require.resolve(specifier);
    continue;
  } catch {
    /* not built: fall back to source */
  }
  const src = candidates.map((c) => fileURLToPath(new URL(c, import.meta.url))).find((file) => existsSync(file));
  if (src) alias[specifier] = src;
  else external.push(specifier);
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  splitting: false,
  noExternal: ["vamos-ui"],
  external,
  esbuildOptions(options) {
    if (Object.keys(alias).length) options.alias = { ...options.alias, ...alias };
  },
});
