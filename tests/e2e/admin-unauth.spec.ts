import { expect, test } from "@playwright/test";
import { expectInvalidCredentials, fillLoginForm, redirectParam } from "./helpers/auth";

test.describe("admin portal — unauthenticated", () => {
  test("login page renders Management OS", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /management os/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: /student portal/i })).toBeVisible();
  });

  test("root redirects to login with ?redirect=/", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    expect(redirectParam(page)).toBe("/");
  });

  test("/students redirects to login with ?redirect=/students", async ({ page }) => {
    await page.goto("/students", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    expect(redirectParam(page)).toBe("/students");
  });

  test("/finance redirects to login with ?redirect=/finance", async ({ page }) => {
    await page.goto("/finance", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    expect(redirectParam(page)).toBe("/finance");
  });

  test("invalid credentials show inline alert, not the error boundary", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, "nobody@example.com", "definitely-wrong");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expectInvalidCredentials(page);
    await expect(page.getByRole("heading", { name: /something went wrong/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /management os/i })).toBeVisible();
  });
});
