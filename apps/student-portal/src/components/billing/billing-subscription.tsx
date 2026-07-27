"use client";

import type { ReactNode } from "react";
import {
  CalendarBlank,
  Clock,
  IdentificationCard,
  ArrowsClockwise,
  Sparkle,
} from "@phosphor-icons/react";
import { Card, StatusPill } from "@scalex/ui";
import {
  formatBillingDate,
  type BillingSubscription,
} from "@/lib/billing-shared";

function MetaCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-3/40 px-3.5 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function BillingSubscriptionCard({
  subscription,
}: {
  subscription: BillingSubscription;
}) {
  const remainingLabel =
    subscription.monthsRemaining == null
      ? "Not enrolled yet"
      : `${subscription.monthsRemaining} month${
          subscription.monthsRemaining === 1 ? "" : "s"
        } remaining`;

  const remainingBar =
    subscription.monthsRemaining == null
      ? 0
      : Math.min(100, Math.max(0, (subscription.monthsRemaining / 12) * 100));

  return (
    <Card className="border-accent-purple/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <Sparkle weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-foreground">
              {subscription.planLabel}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {subscription.premium
                ? "You have full access to all premium features."
                : "Core academy access with AI Mentor and community support."}
            </p>
          </div>
        </div>
        <StatusPill
          label={subscription.enrolledAt ? "Active" : "Pending"}
          variant={subscription.enrolledAt ? "approved" : "neutral"}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaCell
          icon={<CalendarBlank weight="duotone" className="h-4 w-4" />}
          label="Started On"
          value={formatBillingDate(subscription.enrolledAt)}
        />
        <MetaCell
          icon={<ArrowsClockwise weight="duotone" className="h-4 w-4" />}
          label="Renews On"
          value={formatBillingDate(subscription.renewsAt)}
        />
        <MetaCell
          icon={<IdentificationCard weight="duotone" className="h-4 w-4" />}
          label="Billing Cycle"
          value={subscription.billingCycle}
        />
        <MetaCell
          icon={<Clock weight="duotone" className="h-4 w-4" />}
          label="Access Until"
          value={formatBillingDate(subscription.accessUntil)}
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="text-muted">{remainingLabel}</span>
          <span className="font-semibold text-accent-purple">
            {subscription.monthsRemaining == null
              ? "—"
              : `${subscription.monthsRemaining}/12`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-purple/80"
            style={{ width: `${remainingBar}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white opacity-60 shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] sm:w-auto"
      >
        Manage Subscription
      </button>
    </Card>
  );
}
