"use client";

import { ShieldCheck } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

export function BillingTrustFooter() {
  return (
    <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/12 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <ShieldCheck weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              Secure &amp; Trusted Payments
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Checkout is processed by Stripe. We never store full card numbers.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
          <span className="rounded-lg border border-line bg-surface-3/50 px-3 py-1.5">
            Stripe
          </span>
          <span className="rounded-lg border border-line bg-surface-3/50 px-3 py-1.5">
            PCI DSS Secure
          </span>
        </div>
      </div>
    </Card>
  );
}
