import { expect, test } from "@playwright/test";
import { redirectParam } from "./helpers/auth";

test.describe("student portal — logged-out protected redirects", () => {
  for (const path of ["/dashboard", "/roadmap", "/lessons", "/tasks"] as const) {
    test(`${path} keeps ?redirect=`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/login/);
      expect(
        redirectParam(page),
        `${path} should preserve redirect query on /login`
      ).toBe(path);
    });
  }

  test("/payment keeps ?redirect= on the login URL", async ({ page }) => {
    await page.goto("/payment", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    expect(
      redirectParam(page),
      "/payment should preserve redirect query on /login"
    ).toBe("/payment");
  });
});
