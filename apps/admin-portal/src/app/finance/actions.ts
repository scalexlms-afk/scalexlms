"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { canManageFinance, getServiceDb } from "@/lib/admin-db";

export async function createExpenseAction(formData: FormData) {
  const category = (formData.get("category") as string)?.trim();
  const amountDollars = Number(formData.get("amount"));
  const incurredAt = formData.get("incurredAt") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!category || !incurredAt || Number.isNaN(amountDollars)) {
    throw new Error("Invalid expense");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "finance", "full");
  if (!canManageFinance(profile.role)) throw new Error("Forbidden");

  const db = getServiceDb();
  const { data, error } = await db
    .from("expenses")
    .insert({
      category,
      amount: Math.round(amountDollars * 100),
      incurred_at: incurredAt,
      note,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "expense.created",
    targetType: "expense",
    targetId: data.id,
    metadata: { category, amount: Math.round(amountDollars * 100) },
  });

  revalidatePath("/finance");
}

export async function deleteExpenseAction(formData: FormData) {
  const expenseId = formData.get("expenseId") as string;
  if (!expenseId) throw new Error("Expense required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "finance", "full");
  if (!canManageFinance(profile.role)) throw new Error("Forbidden");

  const db = getServiceDb();
  const { error } = await db.from("expenses").delete().eq("id", expenseId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "expense.deleted",
    targetType: "expense",
    targetId: expenseId,
  });

  revalidatePath("/finance");
}
