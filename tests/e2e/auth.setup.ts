import { test as setup, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  AUTH_DIR,
  accounts,
  adminBaseURL,
  mentorStorageState,
  studentBaseURL,
  studentStorageState,
  superadminStorageState,
} from "./helpers/env";
import { signInOnPage } from "./helpers/auth";

setup.describe.configure({ mode: "serial" });

setup.beforeAll(() => {
  mkdirSync(AUTH_DIR, { recursive: true });
});

setup("authenticate premium student", async ({ page }) => {
  await page.goto(`${studentBaseURL}/login`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await signInOnPage(
    page,
    accounts.studentPremium.email,
    accounts.studentPremium.password
  );
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: studentStorageState });
});

setup("authenticate superadmin", async ({ page }) => {
  await page.goto(`${adminBaseURL}/login`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /management os/i })).toBeVisible();
  await signInOnPage(
    page,
    accounts.superadmin.email,
    accounts.superadmin.password
  );
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
    timeout: 30_000,
  });
  await page.context().storageState({ path: superadminStorageState });
});

setup("authenticate mentor", async ({ page }) => {
  await page.goto(`${adminBaseURL}/login`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /management os/i })).toBeVisible();
  await signInOnPage(page, accounts.mentor.email, accounts.mentor.password);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
    timeout: 30_000,
  });
  await page.context().storageState({ path: mentorStorageState });
});
