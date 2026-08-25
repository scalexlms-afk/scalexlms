"use client";

import Link from "next/link";
import { ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { BillingHero } from "@/components/billing/billing-hero";
import { BillingSubscriptionCard } from "@/components/billing/billing-subscription";
import {
  BillingBenefitsList,
  BillingPaymentMethod,
} from "@/components/billing/billing-payment-method";
import { BillingHistory } from "@/components/billing/billing-history";
import { BillingRail } from "@/components/billing/billing-rail";
import { BillingTrustFooter } from "@/components/billing/billing-trust-footer";
import { ContactInfoCard } from "@/components/contact-info-card";
import {
  formatBillingDate,
  formatBillingMoney,
  type BillingPageData,
  type BillingRemainingPayment,
} from "@/lib/billing-shared";

function PaymentDueCard({
  remaining,
  className = "",
}: {
  remaining: NonNullable<BillingRemainingPayment>;
  className?: string;
}) {
  return (
    <Card
      className={`flex h-full flex-col border-accent-amber/35 bg-gradient-to-br from-accent-amber/10 via-surface-2 to-surface-2 ${className}`}
    >
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
        Remaining installment
        {remaining.createdAt
          ? ` (opened ${formatBillingDate(remaining.createdAt)})`
          : ""}
      </p>
      <div className="mt-3 rounded-xl border border-line bg-surface/60 px-3.5 py-3">
        <p className="text-xs text-muted">Remaining Balance</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">
          {formatBillingMoney(remaining.amountCents)}
        </p>
        <p className="mt-1 text-xs font-semibold text-accent-amber">
          Status: {remaining.status}
        </p>
      </div>
      <Link
        href="/payment?mode=remaining"
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-scalex-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-scalex-red-dark"
      >
        Pay Now
        <ArrowRight weight="bold" className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}

export function BillingWorkspace({ data }: { data: BillingPageData }) {
  const hasRemaining = Boolean(data.remaining);

  return (
    <div className="billing-theme space-y-6">
      <BillingHero />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {data.remaining ? (
            <div className="lg:hidden">
              <PaymentDueCard remaining={data.remaining} />
            </div>
          ) : null}

          <div
            className={
              hasRemaining
                ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-stretch"
                : undefined
            }
          >
            <BillingSubscriptionCard
              subscription={data.subscription}
              stripeCustomerId={data.stripeCustomerId}
              compactMeta={hasRemaining}
            />
            {data.remaining ? (
              <div className="hidden lg:block">
                <PaymentDueCard remaining={data.remaining} />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
            <BillingPaymentMethod
              paidViaStripe={data.paidViaStripe}
              stripeCustomerId={data.stripeCustomerId}
            />
            <BillingBenefitsList features={data.features} />
          </div>

          <BillingHistory items={data.history} />
          <ContactInfoCard contact={data.contact} title="Billing contact" />
          <BillingTrustFooter />
        </div>

        <BillingRail
          remaining={data.remaining}
          premium={data.subscription.premium}
        />
      </div>
    </div>
  );
}
