import { createServiceClient } from "@scalex/db/server";
import { createNotification } from "@scalex/db";

export type PlanType = "standard" | "premium";

export async function fulfillCheckoutPayment(input: {
  studentId: string;
  paymentId: string;
  stripeSessionId: string;
  planType: PlanType;
  checkoutMode: "first_payment" | "remaining" | "upgrade";
}) {
  const supabase = createServiceClient();
  const { studentId, paymentId, stripeSessionId, planType, checkoutMode } =
    input;

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status, amount, type")
    .eq("id", paymentId)
    .maybeSingle();

  const alreadyPaid =
    (existingPayment as { status?: string } | null)?.status === "paid";

  if (!alreadyPaid) {
    await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        method: "stripe",
        stripe_session_id: stripeSessionId,
      } as never)
      .eq("id", paymentId);

    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (!existingInvoice) {
      await supabase.from("invoices").insert({
        payment_id: paymentId,
        number: `INV-${Date.now()}`,
      } as never);
    }
  }

  if (checkoutMode === "first_payment") {
    await supabase
      .from("profiles")
      .update({ status: "active", plan: planType } as never)
      .eq("id", studentId);

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("status", "published")
      .limit(1)
      .single();

    if (course) {
      await supabase.from("enrollments").upsert(
        {
          student_id: studentId,
          course_id: (course as { id: string }).id,
          plan: planType,
        } as never,
        { onConflict: "student_id,course_id" }
      );
    }

    // Create pending remaining balance if not already present.
    const { data: planSettings } = await supabase
      .from("payment_plan_settings")
      .select("total_cents, remaining_percent")
      .eq("is_active", true)
      .eq("plan_type", planType)
      .limit(1)
      .maybeSingle();

    const settings = planSettings as {
      total_cents: number;
      remaining_percent: number;
    } | null;

    if (settings && settings.remaining_percent > 0) {
      const remainingAmount = Math.round(
        (settings.total_cents * settings.remaining_percent) / 100
      );
      const { data: existingRemaining } = await supabase
        .from("payments")
        .select("id")
        .eq("student_id", studentId)
        .eq("type", "remaining")
        .in("status", ["pending", "overdue", "paid"])
        .limit(1)
        .maybeSingle();

      if (!existingRemaining && remainingAmount > 0) {
        await supabase.from("payments").insert({
          student_id: studentId,
          amount: remainingAmount,
          type: "remaining",
          status: "pending",
        } as never);
      }
    }

    if (!alreadyPaid) {
      await createNotification({
        userId: studentId,
        type: "payment_success",
        title: "Payment received — welcome to ScaleX",
        body: `Your ${planType === "premium" ? "Premium" : "Standard"} account is now active.`,
        payload: { paymentId, planType },
      });

      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "super_admin");

      await Promise.all(
        (admins ?? []).map((admin) =>
          createNotification({
            userId: (admin as { id: string }).id,
            type: "enrollment",
            title: "New student enrolled",
            body: `A student completed first payment (${planType}).`,
            payload: { studentId, paymentId, planType },
          })
        )
      );
    }
  }

  if (checkoutMode === "remaining" && !alreadyPaid) {
    await createNotification({
      userId: studentId,
      type: "payment_success",
      title: "Remaining balance paid",
      body: "Thank you — your installment is complete.",
      payload: { paymentId },
    });
  }

  if (checkoutMode === "upgrade") {
    await supabase
      .from("profiles")
      .update({ plan: "premium" } as never)
      .eq("id", studentId);

    await supabase
      .from("enrollments")
      .update({ plan: "premium" } as never)
      .eq("student_id", studentId);

    if (!alreadyPaid) {
      await createNotification({
        userId: studentId,
        type: "plan_upgrade",
        title: "Upgraded to Premium Launch Program",
        body: "Live sessions, mentor calls, and priority review are now unlocked.",
        payload: { paymentId },
      });
    }
  }
}
