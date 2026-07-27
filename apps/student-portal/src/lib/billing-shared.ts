/** Client-safe Billing types & helpers — no server imports. */

export type BillingHistoryItem = {
  id: string;
  invoiceNumber: string | null;
  date: string;
  amountCents: number;
  method: string | null;
  status: string;
  pdfUrl: string | null;
  type: string;
};

export type BillingRemainingPayment = {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string | null;
} | null;

export type BillingSubscription = {
  plan: string | null;
  planLabel: string;
  premium: boolean;
  enrolledAt: string | null;
  renewsAt: string | null;
  accessUntil: string | null;
  monthsRemaining: number | null;
  accessElapsedPercent: number;
  billingCycle: string;
};

export type BillingPageData = {
  subscription: BillingSubscription;
  features: readonly string[];
  remaining: BillingRemainingPayment;
  history: BillingHistoryItem[];
  paidViaStripe: boolean;
};

export function formatBillingMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatBillingDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPaymentMethod(method: string | null) {
  if (!method) return "—";
  const normalized = method.trim().toLowerCase();
  if (normalized === "card" || normalized === "stripe") return "Card";
  if (normalized === "visa") return "Visa";
  return method;
}

export function paymentStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function paymentStatusTone(
  status: string
): "paid" | "pending" | "other" {
  if (status === "paid") return "paid";
  if (status === "pending" || status === "overdue") return "pending";
  return "other";
}
