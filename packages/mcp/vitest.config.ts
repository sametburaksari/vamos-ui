import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Test against the CLI's library sources when they exist (no build needed); otherwise the
// package exports are used, and tests that need the real libraries skip if they are missing.
const resolveFirst = (...candidates: string[]) =>
  candidates.map((c) => fileURLToPath(new URL(c, import.meta.url))).find((file) => existsSync(file));

const alias: Record<string, string> = {};
const verifySrc = resolveFirst("../cli/src/verify.ts");
const brandSrc = resolveFirst("../cli/src/brand.ts", "../cli/src/brand/index.ts");
const missing = fileURLToPath(new URL("./test/stubs/missing-module.ts", import.meta.url));
// Vite resolves dynamic imports up front; point unbuilt entries at a stub that throws on import.
alias["vamos-ui/verify"] = verifySrc ?? missing;
alias["vamos-ui/brand"] = brandSrc ?? missing;
alias["vamos-ui/audit"] = resolveFirst("../cli/src/audit/index.ts") ?? missing;

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 15_000,
  },
  resolve: { alias },
});
