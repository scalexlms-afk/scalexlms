import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth";
import { getPendingRemainingPayment } from "@/lib/data";
import { isPremiumPlan, planLabel, planPillVariant } from "@scalex/db";
import { Card, StatusPill } from "@scalex/ui";

function formatMoney(cents: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function BillingPage() {
  const { userId, profile } = await requireStudentProfile();
  const remaining = await getPendingRemainingPayment(userId);
  const premium = isPremiumPlan(profile.plan);

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Billing
          </h1>
          <p className="mt-1 text-muted">
            View your plan and complete outstanding payments.
          </p>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Current plan
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {planLabel(profile.plan)}
              </p>
            </div>
            <StatusPill
              label={`${planLabel(profile.plan, true)} Plan`}
              variant={planPillVariant(profile.plan)}
            />
          </div>

          {remaining ? (
            <div className="rounded-xl border border-accent-amber/40 bg-accent-amber/5 p-4">
              <p className="font-medium text-foreground">
                Remaining payment due
              </p>
              <p className="mt-1 text-sm text-muted">
                {formatMoney(remaining.amount)} · status {remaining.status}
              </p>
              <Link
                href="/payment?mode=remaining"
                className="mt-3 inline-flex rounded-lg bg-scalex-red px-4 py-2 text-sm font-semibold text-white hover:bg-scalex-red-dark"
              >
                Pay remaining balance
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted">No pending installment right now.</p>
          )}

          {!premium && (
            <Link
              href="/payment?mode=upgrade"
              className="inline-flex text-sm font-medium text-scalex-red hover:underline"
            >
              Upgrade to Premium Launch Program →
            </Link>
          )}
        </Card>
      </div>
    </>
  );
}
