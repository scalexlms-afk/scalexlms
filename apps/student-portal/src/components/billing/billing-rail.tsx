"use client";

import Link from "next/link";
import {
  ArrowRight,
  CaretRight,
  CheckCircle,
  Headset,
  WarningCircle,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  formatBillingDate,
  formatBillingMoney,
  type BillingRemainingPayment,
} from "@/lib/billing-shared";

export function BillingRail({
  remaining,
  features,
  premium,
}: {
  remaining: BillingRemainingPayment;
  features: readonly string[];
  premium: boolean;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      {remaining ? (
        <Card className="border-accent-amber/35 bg-gradient-to-br from-accent-amber/10 via-surface-2 to-surface-2">
          <div className="flex items-center gap-2">
            <WarningCircle
              weight="fill"
              className="h-5 w-5 text-accent-amber"
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Payment Due
            </p>
          </div>
          <p className="mt-3 text-sm text-foreground">
            Your remaining installment is outstanding
            {remaining.createdAt
              ? ` (opened ${formatBillingDate(remaining.createdAt)})`
              : ""}
            .
          </p>
          <div className="mt-4 rounded-xl border border-line bg-surface/60 px-3.5 py-3">
            <p className="text-xs text-muted">Remaining Balance</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {formatBillingMoney(remaining.amountCents)}
            </p>
            <p className="mt-1 text-xs font-semibold text-accent-amber">
              ● Status: {remaining.status}
            </p>
          </div>
          <Link
            href="/payment?mode=remaining"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-scalex-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-scalex-red-dark"
          >
            Pay Now
          </Link>
          <Link
            href="/payment?mode=remaining"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-purple hover:underline"
          >
            View payment details
            <ArrowRight weight="bold" className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Card>
      ) : (
        <Card className="border-accent-green/25">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Payment Status
          </p>
          <p className="mt-3 text-sm text-foreground">
            No pending installment right now.
          </p>
          {!premium ? (
            <Link
              href="/payment?mode=upgrade"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-purple hover:underline"
            >
              Upgrade to Premium
              <ArrowRight weight="bold" className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </Card>
      )}

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Plan Benefits
        </p>
        <ul className="mt-3 space-y-2">
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

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Need Help with Billing?
        </p>
        <ul className="mt-3 space-y-1">
          {[
            { href: "/support", label: "Billing FAQ" },
            { href: "/support", label: "Contact Billing Team" },
            { href: "/support", label: "Refund Policy" },
          ].map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3"
              >
                <span className="inline-flex items-center gap-2">
                  <Headset weight="duotone" className="h-4 w-4 text-muted" aria-hidden />
                  {link.label}
                </span>
                <CaretRight weight="bold" className="h-4 w-4 text-subtle" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
