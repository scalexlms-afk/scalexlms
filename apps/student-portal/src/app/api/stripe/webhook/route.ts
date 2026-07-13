import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createServiceClient } from "@scalex/db/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  });
}

async function activateStudentPayment(
  studentId: string,
  paymentId: string,
  stripeSessionId: string,
  planType: "standard" | "premium" = "standard"
) {
  const supabase = createServiceClient();

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
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentId = session.metadata?.student_id;
    const paymentId = session.metadata?.payment_id;

    if (studentId && paymentId) {
      const planType =
        session.metadata?.plan_type === "premium" ? "premium" : "standard";
      await activateStudentPayment(studentId, paymentId, session.id, planType);
    }
  }

  return NextResponse.json({ received: true });
}
