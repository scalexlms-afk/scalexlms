import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@scalex/db/server";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
      .from("payment_plan_settings")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    const planData = plan as {
      total_cents: number;
      first_payment_percent: number;
    } | null;

    if (planError || !planData) {
      return NextResponse.json(
        { error: planError?.message ?? "No payment plan" },
        { status: 500 }
      );
    }

    const firstAmount = Math.round(
      (planData.total_cents * planData.first_payment_percent) / 100
    );

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        student_id: user.id,
        amount: firstAmount,
        type: "first_payment",
        status: "pending",
      } as never)
      .select()
      .single();

    const paymentData = payment as { id: string } | null;

    if (paymentError || !paymentData) {
      return NextResponse.json(
        { error: paymentError?.message ?? "Payment creation failed" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ScaleX LaunchPad — First Payment",
              description: `${planData.first_payment_percent}% enrollment fee`,
            },
            unit_amount: firstAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        student_id: user.id,
        payment_id: paymentData.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL}/payment/cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
