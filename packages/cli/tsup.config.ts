import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node20",
    platform: "node",
    clean: true,
    splitting: false,
  },
  {
    // Library entry: pure, no Node built-ins, safe to bundle into other tools (e.g. the MCP server).
    entry: { verify: "src/verify.ts", brand: "src/brand/index.ts", preset: "src/preset.ts" },
    format: ["esm"],
    target: "es2022",
    platform: "neutral",
    dts: true,
    splitting: false,
  },
]);
