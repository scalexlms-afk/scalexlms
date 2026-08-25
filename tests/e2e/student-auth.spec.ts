import { expect, test } from "@playwright/test";
import { fillLoginForm, loginErrorAlert, signInOnPage } from "./helpers/auth";
import { accounts } from "./helpers/env";

test.describe("student portal — auth", () => {
  test("wrong password on a working account shows invalid credentials", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, accounts.studentPremium.email, "DefinitelyWrongPass!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(loginErrorAlert(page)).toContainText(
      /invalid login credentials/i,
      { timeout: 30_000 }
    );
    expect(new URL(page.url()).pathname).toMatch(/\/login$/);
  });

  test("premium student can sign in to the dashboard", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await signInOnPage(
      page,
      accounts.studentPremium.email,
      accounts.studentPremium.password
    );
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
