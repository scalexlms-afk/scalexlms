import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import PaymentPageClient from "./payment-client";
import { getPaymentPlanByType } from "@/lib/data";

const PLAN_FEATURES = {
  standard: [
    "Full 8-milestone Amazon FBA roadmap",
    "AI Mentor and recorded curriculum",
    "Community access and support tickets",
  ],
  premium: [
    "Everything in Standard",
    "Live classes and workshops",
    "Private mentor calls and launch support",
  ],
} as const;

export default async function PaymentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, status")
    .eq("id", user.id)
    .single();

  const planType =
    (profile as { plan?: "standard" | "premium" | null } | null)?.plan ===
    "premium"
      ? "premium"
      : "standard";

  const settings = await getPaymentPlanByType(planType);
  const totalCents = settings?.total_cents ?? (planType === "premium" ? 199700 : 99700);
  const firstPaymentPercent = settings?.first_payment_percent ?? 70;
  const firstAmountCents = Math.round((totalCents * firstPaymentPercent) / 100);

  return (
    <PaymentPageClient
      plan={{
        planType,
        planLabel:
          planType === "premium" ? "Premium Launch Program" : "Standard",
        totalCents,
        firstPaymentPercent,
        firstAmountCents,
        features: [...PLAN_FEATURES[planType]],
      }}
    />
  );
}
