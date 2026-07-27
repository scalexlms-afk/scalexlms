import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@scalex/db/server";
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

type CheckoutMode = "first_payment" | "remaining" | "upgrade";

function parseMode(value: string | null): CheckoutMode {
  if (value === "remaining" || value === "upgrade") return value;
  return "first_payment";
}

async function getPlanSettings(planType: "standard" | "premium") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_plan_settings")
    .select("*")
    .eq("is_active", true)
    .eq("plan_type", planType)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      error?.message ??
        `No active ${planType} payment plan configured. Ask an admin to set pricing in Settings.`
    );
  }

  return data as {
    total_cents: number;
    first_payment_percent: number;
    remaining_percent: number;
  };
}

async function ensureStripeCustomer(input: {
  userId: string;
  email: string;
  name?: string | null;
  existingCustomerId?: string | null;
}) {
  const stripe = getStripe();
  const service = createServiceClient();

  if (input.existingCustomerId) {
    try {
      await stripe.customers.retrieve(input.existingCustomerId);
      return input.existingCustomerId;
    } catch {
      // fall through and create a new customer
    }
  }

  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name ?? undefined,
    metadata: { student_id: input.userId },
  });

  await service
    .from("profiles")
    .update({ stripe_customer_id: customer.id } as never)
    .eq("id", input.userId);

  return customer.id;
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
    const mode = parseMode(searchParams.get("mode"));
    const requestedPlan = parsePlan(searchParams.get("plan"));

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, status, name, email, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const profileRow = profile as {
      plan?: string | null;
      status?: string;
      name?: string | null;
      email?: string | null;
      stripe_customer_id?: string | null;
    } | null;

    const profilePlan = parsePlan(profileRow?.plan ?? requestedPlan);
    const profileStatus = profileRow?.status;

    let paymentType: "first_payment" | "remaining" | "installment" =
      "first_payment";
    let amount = 0;
    let planType: "standard" | "premium" = profilePlan;
    let productName = "";
    let productDescription = "";
    let metadataExtra: Record<string, string> = {};

    if (mode === "upgrade") {
      if (profilePlan === "premium") {
        return NextResponse.json(
          { error: "You are already on Premium" },
          { status: 400 }
        );
      }
      if (profileStatus !== "active") {
        return NextResponse.json(
          { error: "Complete first payment before upgrading" },
          { status: 400 }
        );
      }

      const [standard, premium] = await Promise.all([
        getPlanSettings("standard"),
        getPlanSettings("premium"),
      ]);
      amount = Math.max(0, premium.total_cents - standard.total_cents);
      if (amount <= 0) {
        return NextResponse.json(
          { error: "Premium upgrade amount is not configured" },
          { status: 500 }
        );
      }
      paymentType = "installment";
      planType = "premium";
      productName = "ScaleX LaunchPad — Upgrade to Premium";
      productDescription = "Upgrade from Standard to Premium Launch Program";
      metadataExtra = { checkout_mode: "upgrade" };
    } else if (mode === "remaining") {
      if (profileStatus !== "active") {
        return NextResponse.json(
          { error: "Account must be active to pay remaining balance" },
          { status: 400 }
        );
      }

      const settings = await getPlanSettings(profilePlan);
      amount = Math.round(
        (settings.total_cents * settings.remaining_percent) / 100
      );
      paymentType = "remaining";
      planType = profilePlan;
      productName = `ScaleX LaunchPad — Remaining balance (${profilePlan === "premium" ? "Premium" : "Standard"})`;
      productDescription = `${settings.remaining_percent}% remaining payment`;
      metadataExtra = { checkout_mode: "remaining" };
    } else {
      planType = profilePlan;
      const settings = await getPlanSettings(planType);
      amount = Math.round(
        (settings.total_cents * settings.first_payment_percent) / 100
      );
      paymentType = "first_payment";
      productName = `ScaleX LaunchPad — ${planType === "premium" ? "Premium Launch Program" : "Standard"}`;
      productDescription = `${settings.first_payment_percent}% first payment`;
      metadataExtra = { checkout_mode: "first_payment" };
    }

    const { data: existing } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("student_id", user.id)
      .eq("type", paymentType)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let paymentData = existing as { id: string; amount?: number } | null;

    if (paymentData && paymentData.amount !== amount) {
      await supabase
        .from("payments")
        .update({ amount } as never)
        .eq("id", paymentData.id);
    }

    if (!paymentData) {
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          student_id: user.id,
          amount,
          type: paymentType,
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

    const customerId = await ensureStripeCustomer({
      userId: user.id,
      email: profileRow?.email || user.email || "",
      name: profileRow?.name,
      existingCustomerId: profileRow?.stripe_customer_id,
    });

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        student_id: user.id,
        payment_id: paymentData.id,
        plan_type: planType,
        ...metadataExtra,
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
