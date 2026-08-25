import { expect, test } from "@playwright/test";

test.describe("student portal — authenticated premium smoke", () => {
  test("dashboard shows the academy welcome", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("sidebar includes core academy links", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /^dashboard$/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /roadmap/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^tasks$/i }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /continue learning/i }).first()
    ).toBeVisible();
  });

  test("roadmap is reachable", async ({ page }) => {
    await page.goto("/roadmap", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/roadmap/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });

  test("tasks hub is reachable (read-only)", async ({ page }) => {
    await page.goto("/tasks", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/tasks/);
    await expect(
      page.getByRole("heading", { name: /implementation tasks/i })
    ).toBeVisible({ timeout: 30_000 });
  });

  test("lessons index is reachable", async ({ page }) => {
    await page.goto("/lessons", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/lessons$/);
    await expect(page.getByRole("heading", { name: /^lessons$/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("continue-learning is reachable", async ({ page }) => {
    await page.goto("/continue-learning", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/continue-learning/);
    await expect(
      page.getByRole("heading", { name: /continue your business/i })
    ).toBeVisible({ timeout: 30_000 });
  });
});
