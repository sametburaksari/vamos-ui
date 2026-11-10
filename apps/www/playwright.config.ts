import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  // One worker by default: with 2-4 workers the Turbopack dev server's on-demand compile slows
  // responses to 10-50 s and pages intermittently fail hydration ("server rendered HTML didn't
  // match"). One worker is also faster end to end. Override with PW_WORKERS=n against a prod build.
  workers: Number(process.env.PW_WORKERS ?? 1),
  reporter: [["list"]],
  // Outside the app: files written under apps/www during a run can wake the dev server's watcher,
  // and a Fast Refresh full reload racing page.goto left "load" pending until the test timed out.
  outputDir: path.join(os.tmpdir(), "vamos-www-playwright"),
  use: {
    baseURL: process.env.DOCS_URL ?? "http://localhost:3200",
    channel: "chrome", // uses the installed Google Chrome, no browser download
    viewport: { width: 1280, height: 900 },
  },
});
