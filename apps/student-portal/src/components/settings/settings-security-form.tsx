"use client";

import Link from "next/link";
import { Card } from "@scalex/ui";

const inputClass =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export function SettingsSecurityForm({
  changePasswordAction,
}: {
  changePasswordAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Change Password
        </p>
        <p className="mt-2 text-sm text-muted">
          Update the password you use to sign in to ScaleX LaunchPad.
        </p>

        <form action={changePasswordAction} className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              New password
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Confirm password
            </span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Link
              href="/reset-password"
              className="text-sm font-semibold text-accent-purple hover:underline"
            >
              Forgot password? Reset via email
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
            >
              Update Password
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Two-factor authentication
          </p>
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-subtle">
            Coming Soon
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          TOTP 2FA will be available in a future update.
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Trusted devices
          </p>
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-subtle">
            Coming Soon
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Device management is not available yet.
        </p>
      </Card>
    </div>
  );
}
