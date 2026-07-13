import { NextResponse } from "next/server";
import { createServiceClient } from "@scalex/db/server";
import { sendRemainingPaymentEmail } from "@scalex/email";
import { createNotification } from "@scalex/db";

export const runtime = "nodejs";

const REMINDER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function studentPortalUrl() {
  return (
    process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      "id, amount, status, last_reminded_at, student:profiles!student_id(id, name, email, status)"
    )
    .eq("type", "remaining")
    .in("status", ["pending", "overdue"])
    .limit(100);

  if (error) {
    console.error("payment-reminders:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const now = Date.now();

  for (const payment of payments ?? []) {
    const row = payment as {
      id: string;
      amount: number;
      last_reminded_at: string | null;
      student:
        | { id: string; name: string; email: string; status: string }
        | { id: string; name: string; email: string; status: string }[]
        | null;
    };
    const student = Array.isArray(row.student) ? row.student[0] : row.student;
    if (!student || student.status !== "active" || !student.email) continue;

    if (
      row.last_reminded_at &&
      now - new Date(row.last_reminded_at).getTime() < REMINDER_COOLDOWN_MS
    ) {
      continue;
    }

    await sendRemainingPaymentEmail({
      to: student.email,
      name: student.name || "there",
      amountLabel: `$${(row.amount / 100).toFixed(0)}`,
      paymentUrl: `${studentPortalUrl()}/payment?mode=remaining`,
      kind: "reminder",
    });

    await createNotification({
      userId: student.id,
      type: "payment_reminder",
      title: "Remaining balance due",
      body: `Your remaining installment of $${(row.amount / 100).toFixed(0)} is still outstanding.`,
      payload: { paymentId: row.id },
    });

    await supabase
      .from("payments")
      .update({ last_reminded_at: new Date().toISOString() } as never)
      .eq("id", row.id);

    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
