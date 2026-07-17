import { defineConfig, devices } from "@playwright/test";

/**
 * E2E scaffolding stub. Full journey coverage is PENDING until auth/hatchery
 * persistence is wired. Smoke scripts remain in scripts/smoke-pages.mjs.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  /* Do not auto-start webServer here — keep e2e opt-in until CI has a stable server. */
});
