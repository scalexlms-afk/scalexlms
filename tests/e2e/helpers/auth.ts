import { expect, type Page } from "@playwright/test";
import { LOGIN_TIMEOUT_MS } from "./env";

export function loginErrorAlert(page: Page) {
  // Next.js also mounts #__next-route-announcer__ with role=alert.
  return page.locator("p[role=alert]");
}

export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
}

/**
 * Submit the login form and wait until we leave /login.
 * Admin live sign-in often takes 10–15s; we allow up to LOGIN_TIMEOUT_MS.
 */
export async function submitLoginAndWait(page: Page, timeout = LOGIN_TIMEOUT_MS) {
  await page.getByRole("button", { name: "Sign In" }).click();

  try {
    await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout });
  } catch (err) {
    const alert = loginErrorAlert(page);
    if (await alert.isVisible().catch(() => false)) {
      const text = (await alert.textContent())?.trim() ?? "unknown error";
      throw new Error(`Login failed: ${text}`);
    }
    throw err;
  }
}

export async function signInOnPage(
  page: Page,
  email: string,
  password: string,
  timeout = LOGIN_TIMEOUT_MS
) {
  await fillLoginForm(page, email, password);
  await submitLoginAndWait(page, timeout);
}

export async function expectInvalidCredentials(page: Page) {
  await expect(loginErrorAlert(page)).toContainText(/invalid login credentials/i, {
    timeout: LOGIN_TIMEOUT_MS,
  });
  expect(new URL(page.url()).pathname).toMatch(/\/login$/);
}

export function redirectParam(page: Page): string | null {
  return new URL(page.url()).searchParams.get("redirect");
}
