import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fulfillCheckoutPayment } from "@/lib/stripe-fulfillment";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  });
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
      const checkoutMode =
        session.metadata?.checkout_mode === "remaining"
          ? "remaining"
          : session.metadata?.checkout_mode === "upgrade"
            ? "upgrade"
            : "first_payment";

      await fulfillCheckoutPayment({
        studentId,
        paymentId,
        stripeSessionId: session.id,
        planType,
        checkoutMode,
      });
    }
  }

  return NextResponse.json({ received: true });
}
