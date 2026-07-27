"use client";

import type { ReactNode } from "react";
import { CheckCircle, CreditCard } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

export function BillingPaymentMethod({
  paidViaStripe,
}: {
  paidViaStripe: boolean;
}) {
  return (
    <Card className="h-full">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Payment Method
      </p>

      {paidViaStripe ? (
        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue/15 text-accent-blue">
            <CreditCard weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">Paid via Stripe</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-green/15 px-2 py-0.5 text-[10px] font-semibold text-accent-green">
                <CheckCircle weight="fill" className="h-3 w-3" aria-hidden />
                Default
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Card details are managed securely in Stripe Checkout.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-3/30 px-4 py-6 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 text-muted">
            <CreditCard weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">
            No saved card on file
          </p>
          <p className="mt-1 text-xs text-muted">
            Payments are completed through Stripe Checkout.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          title="Coming soon"
          className="cursor-not-allowed text-sm font-semibold text-accent-purple opacity-60"
        >
          Change Card
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="cursor-not-allowed text-sm font-semibold text-accent-purple opacity-60"
        >
          + Add New Card
        </button>
      </div>
    </Card>
  );
}

export function BillingBenefitsList({
  features,
  compact,
}: {
  features: readonly string[];
  compact?: boolean;
}) {
  return (
    <Card className={compact ? "" : "h-full"}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Plan Benefits
      </p>
      <ul className={`mt-4 space-y-2.5 ${compact ? "" : ""}`}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <CheckCircle
              weight="fill"
              className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple"
              aria-hidden
            />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function BillingMetaCell({
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
