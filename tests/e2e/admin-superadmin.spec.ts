import { expect, test } from "@playwright/test";

test.describe("admin portal — superadmin", () => {
  test("dashboard loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/welcome back/i).first()).toBeVisible();
  });

  test("students list is reachable", async ({ page }) => {
    await page.goto("/students", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/students/);
    await expect(page.getByRole("heading", { name: /students/i }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("finance is reachable (read-only)", async ({ page }) => {
    await page.goto("/finance", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/forbidden/);
    await expect(page).toHaveURL(/\/finance/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });

  test("team members is reachable (read-only)", async ({ page }) => {
    await page.goto("/team", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/forbidden/);
    await expect(page).toHaveURL(/\/team/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });

  test("settings is reachable (read-only — does not save)", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/forbidden/);
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });

  test("notification bell is present in the chrome (dropdown only)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header details summary").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("/notifications is a real page (HTTP 200)", async ({ page }) => {
    const res = await page.goto("/notifications", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    await expect(page).not.toHaveURL(/\/404|not found/i);
    await expect(page.getByRole("heading", { name: /notifications/i }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

});
