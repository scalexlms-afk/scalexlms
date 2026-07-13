import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@scalex/db/server";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Stripe Checkout is cross-site; auth cookies are often missing on return.
    // Treat a paid Stripe session + metadata as proof of payment.
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed yet", status: session.payment_status },
        { status: 400 }
      );
    }

    const studentId = session.metadata?.student_id;
    const paymentId = session.metadata?.payment_id;
    const planType =
      session.metadata?.plan_type === "premium" ? "premium" : "standard";

    if (!studentId || !paymentId) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    // If the browser still has a session, ensure it matches the payer.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && studentId !== user.id) {
      return NextResponse.json(
        { error: "Session does not belong to user" },
        { status: 403 }
      );
    }

    await activateStudentPayment(studentId, paymentId, session.id, planType);

    return NextResponse.json({
      activated: true,
      authenticated: Boolean(user),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Activation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
