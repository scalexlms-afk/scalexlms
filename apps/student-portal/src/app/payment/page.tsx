"use client";

import { useState } from "react";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout");
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
      subtitle="Complete your first payment to unlock the full LaunchPad experience."
    >
      <div className="mt-5 rounded-xl border border-line bg-surface-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">
            Enrollment (first payment)
          </span>
          <span className="rounded-full bg-scalex-red/15 px-2.5 py-0.5 text-xs font-semibold text-scalex-red">
            70%
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <span className="text-accent-green">✓</span> Full 8-milestone Amazon
            FBA roadmap
          </li>
          <li className="flex items-center gap-2">
            <span className="text-accent-green">✓</span> All lessons &amp;
            progress tracking
          </li>
          <li className="flex items-center gap-2">
            <span className="text-accent-green">✓</span> Instant account
            activation
          </li>
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
