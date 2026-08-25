import { expect, test } from "@playwright/test";

test.describe("admin portal — mentor RBAC", () => {
  test("dashboard is allowed", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("students (own scope) is allowed", async ({ page }) => {
    await page.goto("/students", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/forbidden/);
    await expect(page).toHaveURL(/\/students/);
  });

  test("/finance is forbidden", async ({ page }) => {
    await page.goto("/finance", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: /access denied/i })).toBeVisible();
  });

  test("/team is forbidden", async ({ page }) => {
    await page.goto("/team", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: /access denied/i })).toBeVisible();
  });

  test("/settings is forbidden", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: /access denied/i })).toBeVisible();
  });
});
