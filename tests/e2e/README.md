# Live E2E

These tests hit production, not a local Next server.

Student default: https://www.scalexlms.com (BASE_URL)
Admin default: https://admin.scalexlms.com (ADMIN_BASE_URL)

## Run

From the monorepo root, install browsers with the Playwright CLI, then the root e2e script.

UI mode uses the e2e:ui script.

## Accounts

Password default lives in one helper: tests/e2e/helpers/env.ts (E2E_PASSWORD).
Override with E2E_STUDENT_PASSWORD, E2E_SUPERADMIN_PASSWORD, E2E_MENTOR_PASSWORD.

Working on live:

- student-premium@scalex.dev (student portal)
- superadmin@scalex.dev (admin)
- mentor@scalex.dev (admin; finance, team, settings go to /forbidden)

Currently fail on live with Invalid login credentials. Specs assert that (they do not skip):

- student@scalex.dev
- instructor@scalex.dev
- sales@scalex.dev

Those three emails are created by the local seed script (db:seed-test-users). Do not run seed scripts against production.

## Rules

- Read-only: no registration, no reset codes, no payments, no settings saves, no deletes.
- Admin sign-in is slow on live (10-15s). The suite waits up to 30s.
- Some tests stay red until product bugs are fixed:
  - GET /sitemap.xml currently 500
  - Admin /notifications currently 404 (header bell is a dropdown)
  - Logged-out /payment drops the redirect query (other protected routes keep it)

## Files

- playwright.config.ts at repo root (no webServer)
- helpers/env.ts — URLs, accounts, password default
- helpers/auth.ts — login form helpers
- auth.setup.ts — session files under tests/e2e/.auth/ (gitignored)
