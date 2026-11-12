import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 20000,
    // Tests compare plain output, the same on every machine:
    // - CI runners (CI=true, GITHUB_ACTIONS) make picocolors print ANSI colours;
    // - `pnpm exec vitest` sets npm_config_user_agent, and the CLI then suggests pnpm commands
    //   (correct for users, but the tests expect the npm fallback of a project without a lockfile).
    env: { NO_COLOR: "1", FORCE_COLOR: "0", npm_config_user_agent: "" },
  },
});
