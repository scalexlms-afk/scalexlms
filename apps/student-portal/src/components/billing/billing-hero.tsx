"use client";

import Link from "next/link";
import { CreditCard, Headset } from "@phosphor-icons/react";

export function BillingHero() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <CreditCard weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Billing
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Manage your subscription, payments, and invoices.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/support"
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3"
      >
        <Headset weight="bold" className="h-4 w-4" aria-hidden />
        Need Help?
      </Link>
    </div>
  );
}
