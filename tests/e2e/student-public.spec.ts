import { expect, test } from "@playwright/test";
import { studentBaseURL } from "./helpers/env";

test.describe("student portal — public", () => {
  test("landing page loads with primary CTAs", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/ScaleX LaunchPad/i);
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /start now/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^blog$/i }).first()).toBeVisible();
  });

  test("login page renders the sign-in form", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create an account/i })).toBeVisible();
  });

  test("register page renders (read-only — does not submit)", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /join scalex launchpad/i })
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("reset-password page renders (read-only — does not send a code)", async ({
    page,
  }) => {
    await page.goto("/reset-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send code/i })).toBeVisible();
  });

  test("blog index is public", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/sitemap:/i);
    expect(body).toContain(`${studentBaseURL}/sitemap.xml`);
  });

  test("llms.txt is served", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/scalex/i);
  });

  /**
   * Known live bug: /sitemap.xml currently returns HTTP 500.
   * This assertion documents the expected healthy behavior so the suite
   * stays red until the product is fixed.
   */
  test("sitemap.xml returns HTTP 200", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(
      res.status(),
      `Expected sitemap.xml 200 but live returned ${res.status()}`
    ).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<urlset|<sitemapindex/i);
  });
});
