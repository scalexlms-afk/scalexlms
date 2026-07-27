import { createClient } from "@scalex/db/server";
import { PLAN_FEATURES, isPremiumPlan, planLabel } from "@scalex/db";
import type { Profile } from "@scalex/db/types";
import {
  getPendingRemainingPayment,
  getStudentJourneySummary,
} from "@/lib/data";
import type {
  BillingHistoryItem,
  BillingPageData,
  BillingRemainingPayment,
} from "@/lib/billing-shared";

export type {
  BillingHistoryItem,
  BillingPageData,
  BillingRemainingPayment,
  BillingSubscription,
} from "@/lib/billing-shared";
export {
  formatBillingDate,
  formatBillingMoney,
  formatPaymentMethod,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/billing-shared";

function accessDates(enrolledAt: string | null) {
  if (!enrolledAt) {
    return { renewsAt: null as string | null, accessUntil: null as string | null };
  }
  const start = new Date(enrolledAt).getTime();
  if (Number.isNaN(start)) {
    return { renewsAt: null, accessUntil: null };
  }
  const end = new Date(start + 12 * 30.44 * 24 * 60 * 60 * 1000).toISOString();
  return { renewsAt: end, accessUntil: end };
}

type PaymentHistoryRow = {
  id: string;
  amount: number;
  status: string;
  type: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  stripe_session_id: string | null;
  invoices:
    | { number: string; pdf_url: string | null; issued_at: string }[]
    | { number: string; pdf_url: string | null; issued_at: string }
    | null;
};

export async function getBillingPageData(
  userId: string,
  profile: Profile
): Promise<BillingPageData> {
  const premium = isPremiumPlan(profile.plan);
  const planKey = premium ? "premium" : "standard";
  const supabase = await createClient();
  const profileRow = profile as Profile & {
    stripe_customer_id?: string | null;
  };

  const [journey, remainingRaw, { data: paymentRows }] = await Promise.all([
    getStudentJourneySummary(userId),
    getPendingRemainingPayment(userId),
    supabase
      .from("payments")
      .select(
        "id, amount, status, type, method, paid_at, created_at, stripe_session_id, invoices(number, pdf_url, issued_at)"
      )
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const rows = (paymentRows ?? []) as PaymentHistoryRow[];
  const paidViaStripe = rows.some((row) => Boolean(row.stripe_session_id));

  const history: BillingHistoryItem[] = rows.map((row) => {
    const invoice = Array.isArray(row.invoices)
      ? row.invoices[0] ?? null
      : row.invoices;
    return {
      id: row.id,
      invoiceNumber: invoice?.number ?? null,
      date: invoice?.issued_at ?? row.paid_at ?? row.created_at,
      amountCents: row.amount,
      method: row.method,
      status: row.status,
      pdfUrl: invoice?.pdf_url ?? null,
      type: row.type,
    };
  });

  // Enrich remaining with created_at from history when available
  let remaining: BillingRemainingPayment = null;
  if (remainingRaw) {
    const match = rows.find((r) => r.id === remainingRaw.id);
    remaining = {
      id: remainingRaw.id,
      amountCents: remainingRaw.amount,
      status: remainingRaw.status,
      createdAt: match?.created_at ?? null,
    };
  }

  const { renewsAt, accessUntil } = accessDates(journey.enrolledAt);

  return {
    subscription: {
      plan: profile.plan,
      planLabel: planLabel(profile.plan),
      premium,
      enrolledAt: journey.enrolledAt,
      renewsAt,
      accessUntil,
      monthsRemaining: journey.monthsRemaining,
      accessElapsedPercent: journey.accessElapsedPercent,
      billingCycle: "Yearly",
    },
    features: PLAN_FEATURES[planKey],
    remaining,
    history,
    paidViaStripe,
    stripeCustomerId: profileRow.stripe_customer_id ?? null,
  };
}
