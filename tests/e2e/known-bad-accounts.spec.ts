import { test } from "@playwright/test";
import { expectInvalidCredentials, fillLoginForm } from "./helpers/auth";
import { adminBaseURL, studentBaseURL, unprovisioned } from "./helpers/env";

/**
 * These emails exist in scripts/seed-test-users.mjs but currently fail on live
 * with "Invalid login credentials". The suite asserts that live behavior
 * (accounts not provisioned, or password mismatch) rather than hiding it.
 */
test.describe("known-bad live accounts", () => {
  test("student@scalex.dev fails on the student portal", async ({ page }) => {
    await page.goto(`${studentBaseURL}/login`, { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, unprovisioned.student, unprovisioned.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expectInvalidCredentials(page);
  });

  test("instructor@scalex.dev fails on the admin portal", async ({ page }) => {
    await page.goto(`${adminBaseURL}/login`, { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, unprovisioned.instructor, unprovisioned.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expectInvalidCredentials(page);
  });

  test("sales@scalex.dev fails on the admin portal", async ({ page }) => {
    await page.goto(`${adminBaseURL}/login`, { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, unprovisioned.sales, unprovisioned.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expectInvalidCredentials(page);
  });
});
