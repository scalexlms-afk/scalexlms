"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [activating, setActivating] = useState(true);
  const [activated, setActivated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function activate() {
      if (!sessionId) {
        setError("Missing payment session. Return to payment and try again.");
        setActivating(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/stripe/activate?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not activate account");
          return;
        }
        setActivated(true);
        setAuthenticated(Boolean(data.authenticated));
        router.refresh();
      } catch {
        setError("Network error while activating account");
      } finally {
        setActivating(false);
      }
    }

    activate();
  }, [sessionId, router]);

  return (
    <AuthShell>
      <div className="text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
            error
              ? "bg-accent-danger/15 text-accent-danger"
              : "bg-accent-green/15 text-accent-green"
          } ${activated ? "animate-pop" : ""}`}
        >
          {error ? "!" : "✓"}
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold">
          {error ? "Almost there" : "Payment successful!"}
        </h1>

        {activating && (
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-scalex-red" />
            Activating your account...
          </p>
        )}
        {activated && (
          <p className="mt-2 text-sm text-muted">
            {authenticated
              ? "Your account is now active. Welcome to ScaleX LaunchPad!"
              : "Your account is now active. Sign in to open your dashboard."}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger">
            {error}
          </p>
        )}

        {activated ? (
          <Link
            href={authenticated ? "/dashboard" : "/login?redirect=/dashboard"}
            className="mt-6 block"
          >
            <Button className="w-full">
              {authenticated ? "Go to Dashboard" : "Sign in to continue"}
            </Button>
          </Link>
        ) : (
          <Link href="/payment" className="mt-6 block">
            <Button variant="secondary" className="w-full" disabled={activating}>
              Back to Payment
            </Button>
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
