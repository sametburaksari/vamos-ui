import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: process.env.DOCS_URL ?? "http://localhost:3200",
    channel: "chrome", // uses the installed Google Chrome, no browser download
    viewport: { width: 1280, height: 900 },
  },
});
