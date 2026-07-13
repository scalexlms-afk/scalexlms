import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@scalex/db/server";
import { siteUrl } from "@/lib/site";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

function parsePlan(value: string | null | undefined): "standard" | "premium" {
  return value === "premium" ? "premium" : "standard";
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedPlan = parsePlan(searchParams.get("plan"));

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    const planType = parsePlan(
      (profile as { plan?: string | null } | null)?.plan ?? requestedPlan
    );
    const planLabel =
      planType === "premium" ? "Premium Launch Program" : "Standard";

    let { data: plan, error: planError } = await supabase
      .from("payment_plan_settings")
      .select("*")
      .eq("is_active", true)
      .eq("plan_type", planType)
      .limit(1)
      .maybeSingle();

    if (planError || !plan) {
      const fallback = await supabase
        .from("payment_plan_settings")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      plan = fallback.data;
      planError = fallback.error;
    }

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

    // Reuse an existing pending first payment to avoid piling up duplicate rows
    // each time the student re-opens checkout (idempotency).
    const { data: existing } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("student_id", user.id)
      .eq("type", "first_payment")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let paymentData = existing as { id: string; amount?: number } | null;

    if (paymentData && paymentData.amount !== firstAmount) {
      await supabase
        .from("payments")
        .update({ amount: firstAmount } as never)
        .eq("id", paymentData.id);
    }

    if (!paymentData) {
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

      paymentData = payment as { id: string } | null;

      if (paymentError || !paymentData) {
        return NextResponse.json(
          { error: paymentError?.message ?? "Payment creation failed" },
          { status: 500 }
        );
      }
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
              name: `ScaleX LaunchPad — ${planLabel}`,
              description: `${planData.first_payment_percent}% first payment`,
            },
            unit_amount: firstAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        student_id: user.id,
        payment_id: paymentData.id,
        plan_type: planType,
      },
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment/cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
