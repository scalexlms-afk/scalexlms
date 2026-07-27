"use client";

import { BillingHero } from "@/components/billing/billing-hero";
import { BillingSubscriptionCard } from "@/components/billing/billing-subscription";
import {
  BillingBenefitsList,
  BillingPaymentMethod,
} from "@/components/billing/billing-payment-method";
import { BillingHistory } from "@/components/billing/billing-history";
import { BillingRail } from "@/components/billing/billing-rail";
import { BillingTrustFooter } from "@/components/billing/billing-trust-footer";
import type { BillingPageData } from "@/lib/billing-shared";

export function BillingWorkspace({ data }: { data: BillingPageData }) {
  return (
    <div className="billing-theme space-y-6">
      <BillingHero />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <BillingSubscriptionCard
            subscription={data.subscription}
            stripeCustomerId={data.stripeCustomerId}
          />

          <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
            <BillingPaymentMethod
              paidViaStripe={data.paidViaStripe}
              stripeCustomerId={data.stripeCustomerId}
            />
            <BillingBenefitsList features={data.features} />
          </div>

          <BillingHistory items={data.history} />
          <BillingTrustFooter />
        </div>

        <BillingRail
          remaining={data.remaining}
          features={data.features}
          premium={data.subscription.premium}
        />
      </div>
    </div>
  );
}
