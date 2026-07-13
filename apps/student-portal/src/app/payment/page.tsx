import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import PaymentPageClient from "./payment-client";
import { getPaymentPlanByType } from "@/lib/data";
import { PLAN_FEATURES } from "@scalex/db";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const modeParam = params.mode;
  const mode =
    modeParam === "remaining" || modeParam === "upgrade"
      ? modeParam
      : "first_payment";

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
  const status = (profile as { status?: string } | null)?.status;

  if (mode === "upgrade" && (status !== "active" || planType === "premium")) {
    redirect("/dashboard");
  }
  if (mode === "remaining" && status !== "active") {
    redirect("/payment");
  }
  if (mode === "first_payment" && status === "active") {
    // Allow active users only via remaining/upgrade modes
    const { data: remaining } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("student_id", user.id)
      .eq("type", "remaining")
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();
    if (remaining) redirect("/payment?mode=remaining");
    if (planType === "standard") redirect("/payment?mode=upgrade");
    redirect("/dashboard");
  }

  if (mode === "upgrade") {
    const [standard, premium] = await Promise.all([
      getPaymentPlanByType("standard"),
      getPaymentPlanByType("premium"),
    ]);
    const standardTotal = standard?.total_cents ?? 99700;
    const premiumTotal = premium?.total_cents ?? 199700;
    const upgradeCents = Math.max(0, premiumTotal - standardTotal);

    return (
      <PaymentPageClient
        mode="upgrade"
        plan={{
          planType: "premium",
          planLabel: "Premium Launch Program",
          totalCents: premiumTotal,
          firstPaymentPercent: 100,
          firstAmountCents: upgradeCents,
          features: [...PLAN_FEATURES.premium],
        }}
      />
    );
  }

  if (mode === "remaining") {
    const settings = await getPaymentPlanByType(planType);
    const totalCents =
      settings?.total_cents ?? (planType === "premium" ? 199700 : 99700);
    const remainingPercent = settings?.remaining_percent ?? 30;
    const remainingCents = Math.round((totalCents * remainingPercent) / 100);

    return (
      <PaymentPageClient
        mode="remaining"
        plan={{
          planType,
          planLabel:
            planType === "premium" ? "Premium Launch Program" : "Standard",
          totalCents,
          firstPaymentPercent: remainingPercent,
          firstAmountCents: remainingCents,
          features: [...PLAN_FEATURES[planType]],
        }}
      />
    );
  }

  const settings = await getPaymentPlanByType(planType);
  const totalCents =
    settings?.total_cents ?? (planType === "premium" ? 199700 : 99700);
  const firstPaymentPercent = settings?.first_payment_percent ?? 70;
  const firstAmountCents = Math.round((totalCents * firstPaymentPercent) / 100);

  return (
    <PaymentPageClient
      mode="first_payment"
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
