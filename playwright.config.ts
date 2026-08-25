import { defineConfig, devices } from "@playwright/test";
import { adminBaseURL, studentBaseURL } from "./tests/e2e/helpers/env";

/**
 * Live-production E2E. There is no local Next.js webServer here — tests hit
 * BASE_URL / ADMIN_BASE_URL (defaults: www.scalexlms.com / admin.scalexlms.com).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    ignoreHTTPSErrors: false,
    channel: process.env.PLAYWRIGHT_CHROME_CHANNEL || undefined,
    launchOptions: { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "student-public",
      testMatch: /student-(public|auth|redirects)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: studentBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: "student-authed",
      testMatch: /student-premium\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: studentBaseURL,
        storageState: "tests/e2e/.auth/student.json",
      },
    },
    {
      name: "admin-public",
      testMatch: /admin-unauth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: "admin-superadmin",
      testMatch: /admin-superadmin\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
        storageState: "tests/e2e/.auth/superadmin.json",
      },
    },
    {
      name: "admin-mentor",
      testMatch: /admin-mentor\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
        storageState: "tests/e2e/.auth/mentor.json",
      },
    },
    {
      name: "known-bad-accounts",
      testMatch: /known-bad-accounts\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
