import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@scalex/db/server";
import { fulfillCheckoutPayment } from "@/lib/stripe-fulfillment";
import { setScalexNavCookies } from "@/lib/nav-cookies";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

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
    const checkoutMode =
      session.metadata?.checkout_mode === "remaining"
        ? "remaining"
        : session.metadata?.checkout_mode === "upgrade"
          ? "upgrade"
          : "first_payment";

    if (!studentId || !paymentId) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      );
    }

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

    await fulfillCheckoutPayment({
      studentId,
      paymentId,
      stripeSessionId: session.id,
      planType,
      checkoutMode,
    });

    if (user) {
      await setScalexNavCookies("student", "active");
    }

    return NextResponse.json({
      activated: true,
      authenticated: Boolean(user),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Activation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
