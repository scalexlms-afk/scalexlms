"use client";

import Link from "next/link";
import {
  ArrowRight,
  CaretRight,
  CheckCircle,
  Headset,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type { BillingRemainingPayment } from "@/lib/billing-shared";

export function BillingRail({
  remaining,
  premium,
}: {
  remaining: BillingRemainingPayment;
  premium: boolean;
  /** @deprecated Benefits live in the main column only */
  features?: readonly string[];
  hideBenefitsOnDesktop?: boolean;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      {!remaining ? (
        <Card className="border-accent-green/25">
          <div className="flex items-center gap-2">
            <CheckCircle
              weight="fill"
              className="h-5 w-5 text-accent-green"
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Payment Status
            </p>
          </div>
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
      ) : null}

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
                  <Headset
                    weight="duotone"
                    className="h-4 w-4 text-muted"
                    aria-hidden
                  />
                  {link.label}
                </span>
                <CaretRight
                  weight="bold"
                  className="h-4 w-4 text-subtle"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
