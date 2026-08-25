/**
 * Live E2E targets and accounts.
 *
 * Override any value with env vars. Defaults point at production and the
 * provisioned test logins that currently work on live.
 *
 * Password default lives HERE only (not copied across spec files).
 * Seed scripts in /scripts use a different local-dev password (ScaleXTest123!)
 * — do not run those seeds against production.
 */
function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

/** Shared live password for provisioned E2E accounts. */
const defaultPassword = env("E2E_PASSWORD", "TestPass123!");

export const studentBaseURL = env("BASE_URL", "https://www.scalexlms.com").replace(
  /\/$/,
  ""
);
export const adminBaseURL = env(
  "ADMIN_BASE_URL",
  "https://admin.scalexlms.com"
).replace(/\/$/, "");

export const accounts = {
  studentPremium: {
    email: env("E2E_STUDENT_EMAIL", "student-premium@scalex.dev"),
    password: env("E2E_STUDENT_PASSWORD", defaultPassword),
  },
  superadmin: {
    email: env("E2E_SUPERADMIN_EMAIL", "superadmin@scalex.dev"),
    password: env("E2E_SUPERADMIN_PASSWORD", defaultPassword),
  },
  mentor: {
    email: env("E2E_MENTOR_EMAIL", "mentor@scalex.dev"),
    password: env("E2E_MENTOR_PASSWORD", defaultPassword),
  },
} as const;

/**
 * Seed-script emails that currently fail on live with "Invalid login credentials"
 * (not provisioned, or password mismatch vs TestPass123!). Tests assert that
 * failure instead of skipping it.
 */
export const unprovisioned = {
  student: env("E2E_UNPROVISIONED_STUDENT_EMAIL", "student@scalex.dev"),
  instructor: env("E2E_UNPROVISIONED_INSTRUCTOR_EMAIL", "instructor@scalex.dev"),
  sales: env("E2E_UNPROVISIONED_SALES_EMAIL", "sales@scalex.dev"),
  password: env("E2E_UNPROVISIONED_PASSWORD", defaultPassword),
} as const;

export const AUTH_DIR = "tests/e2e/.auth";
export const studentStorageState = `${AUTH_DIR}/student.json`;
export const superadminStorageState = `${AUTH_DIR}/superadmin.json`;
export const mentorStorageState = `${AUTH_DIR}/mentor.json`;

/** Admin sign-in is slow on live (10–15s). Fail only past this ceiling. */
export const LOGIN_TIMEOUT_MS = 30_000;
