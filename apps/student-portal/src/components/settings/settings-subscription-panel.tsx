"use client";

import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Card, StatusPill } from "@scalex/ui";
import {
  formatSettingsDate,
  type SettingsPlanSummary,
} from "@/lib/settings-shared";

export function SettingsSubscriptionPanel({
  plan,
}: {
  plan: SettingsPlanSummary;
}) {
  return (
    <Card className="border-accent-purple/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Subscription
          </p>
          <h2 className="mt-2 font-display text-lg font-bold text-foreground">
            {plan.planLabel}
          </h2>
          <p className="mt-1 text-sm text-muted">
            12-month academy access. Manage cards and receipts in Billing.
          </p>
        </div>
        <StatusPill
          label={plan.enrolledAt ? "Active" : "Pending"}
          variant={plan.enrolledAt ? "approved" : "neutral"}
        />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-3/40 px-3.5 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Access until
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {formatSettingsDate(plan.accessUntil)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface-3/40 px-3.5 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Months remaining
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {plan.monthsRemaining == null ? "—" : plan.monthsRemaining}
          </dd>
        </div>
      </dl>

      <Link
        href="/billing"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90 sm:w-auto"
      >
        Open Billing
        <ArrowSquareOut weight="bold" className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}
