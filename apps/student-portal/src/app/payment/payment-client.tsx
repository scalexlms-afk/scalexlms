"use client";

import { useState } from "react";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

type PaymentPlanView = {
  planType: "standard" | "premium";
  planLabel: string;
  totalCents: number;
  firstPaymentPercent: number;
  firstAmountCents: number;
  features: string[];
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PaymentPageClient({ plan }: { plan: PaymentPlanView }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stripe/checkout?plan=${encodeURIComponent(plan.planType)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Checkout failed (${res.status})`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to start checkout");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Activate your account"
      subtitle={`Complete your first payment for the ${plan.planLabel} to unlock LaunchPad.`}
    >
      <div className="mt-5 rounded-xl border border-line bg-surface-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {plan.planLabel}
            </p>
            <p className="mt-1 text-xs text-muted">
              First payment ({plan.firstPaymentPercent}% of{" "}
              {formatUsd(plan.totalCents)})
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-foreground">
              {formatUsd(plan.firstAmountCents)}
            </p>
            <span className="mt-1 inline-block rounded-full bg-scalex-red/15 px-2.5 py-0.5 text-xs font-semibold text-scalex-red">
              {plan.firstPaymentPercent}% due now
            </span>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger">
          {error}
        </p>
      )}

      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full"
      >
        {loading ? "Redirecting to Stripe..." : "Pay Now"}
      </Button>

      <p className="mt-3 text-center text-xs text-subtle">
        Secure checkout powered by Stripe
      </p>

      <form action="/auth/signout" method="post" className="mt-4 text-center">
        <button
          type="submit"
          className="text-xs text-muted transition-colors hover:text-scalex-red"
        >
          Sign out and use a different account
        </button>
      </form>
    </AuthShell>
  );
}
