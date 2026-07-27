"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowSquareOut,
  Desktop,
  DownloadSimple,
  LockKey,
  ShieldCheck,
  SignOut,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";
import { Card, StatusPill } from "@scalex/ui";
import {
  formatSettingsDate,
  type SettingsPlanSummary,
} from "@/lib/settings-shared";

function ComingSoonRow({
  icon,
  title,
  description,
  danger,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`flex w-full cursor-not-allowed items-start gap-3 rounded-xl px-2 py-2.5 text-left opacity-60 ${
        danger ? "" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          danger
            ? "bg-scalex-red/15 text-scalex-red"
            : "bg-surface-3 text-muted"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-semibold ${
            danger ? "text-scalex-red" : "text-foreground"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
    </button>
  );
}

export function SettingsRail({ plan }: { plan: SettingsPlanSummary }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card className="border-accent-purple/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Current Plan
          </p>
          <StatusPill label="Active" variant="approved" />
        </div>
        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple">
            <Sparkle weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-foreground">
              {plan.planLabel}
            </p>
            <p className="mt-1 text-xs text-muted">
              Access until: {formatSettingsDate(plan.accessUntil)}
            </p>
            <p className="text-xs text-muted">
              {plan.monthsRemaining == null
                ? "Billing cycle: —"
                : `${plan.monthsRemaining} month${
                    plan.monthsRemaining === 1 ? "" : "s"
                  } remaining`}
            </p>
          </div>
        </div>
        <Link
          href="/billing"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
        >
          Manage Billing
          <ArrowSquareOut weight="bold" className="h-4 w-4" aria-hidden />
        </Link>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Quick Actions
        </p>
        <div className="mt-2 space-y-1">
          <Link
            href="/reset-password"
            className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-3"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-muted">
              <LockKey weight="duotone" className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                Change Password
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                Update your account password
              </span>
            </span>
          </Link>

          <ComingSoonRow
            icon={<ShieldCheck weight="duotone" className="h-4 w-4" />}
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
          />
          <ComingSoonRow
            icon={<DownloadSimple weight="duotone" className="h-4 w-4" />}
            title="Download My Data"
            description="Export your account information"
          />
          <ComingSoonRow
            icon={<Desktop weight="duotone" className="h-4 w-4" />}
            title="Connected Devices"
            description="Manage your active sessions"
          />
        </div>
      </Card>

      <Card className="border-scalex-red/25">
        <p className="text-xs font-semibold uppercase tracking-wider text-scalex-red">
          Danger Zone
        </p>
        <div className="mt-2">
          <ComingSoonRow
            danger
            icon={<Trash weight="duotone" className="h-4 w-4" />}
            title="Delete Account"
            description="Permanently delete your account and all data."
          />
        </div>
      </Card>

      <Card>
        <Link
          href="/auth/signout"
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-muted">
            <SignOut weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              Logout
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Logout from ScaleX LaunchPad
            </span>
          </span>
        </Link>
      </Card>
    </aside>
  );
}
