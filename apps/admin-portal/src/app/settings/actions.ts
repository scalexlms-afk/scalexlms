"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@scalex/db";
import type { UserRole } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "instructor",
  "mentor",
  "sales",
];

export async function updateUserRoleAction(formData: FormData) {
  const targetUserId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;

  if (!targetUserId || !ADMIN_ROLES.includes(role)) {
    throw new Error("Invalid role update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();

  // Fetch the target's current role to enforce super_admin safety rules.
  const { data: target } = await db
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  const currentRole = (target as { role: UserRole } | null)?.role;

  if (currentRole === "super_admin" && role !== "super_admin") {
    // Block self-lockout.
    if (targetUserId === userId) {
      throw new Error(
        "You cannot remove your own Super Admin role. Ask another Super Admin."
      );
    }
    // Block demoting the last remaining super_admin.
    const { count } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if ((count ?? 0) <= 1) {
      throw new Error(
        "At least one Super Admin must remain. Promote another user first."
      );
    }
  }

  const { error } = await db
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "user.role_changed",
    targetType: "profile",
    targetId: targetUserId,
    metadata: { role },
  });

  revalidatePath("/settings");
}

export async function updatePaymentPlanAction(formData: FormData) {
  const planId = formData.get("planId") as string;
  const totalCents = Number(formData.get("totalCents"));
  const firstPercent = Number(formData.get("firstPercent"));
  const remainingPercent = Number(formData.get("remainingPercent"));

  if (
    !planId ||
    Number.isNaN(totalCents) ||
    Number.isNaN(firstPercent) ||
    Number.isNaN(remainingPercent)
  ) {
    throw new Error("Invalid payment plan");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("payment_plan_settings")
    .update({
      total_cents: totalCents,
      first_payment_percent: firstPercent,
      remaining_percent: remainingPercent,
    })
    .eq("id", planId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "payment_plan.updated",
    targetType: "payment_plan_settings",
    targetId: planId,
    metadata: { totalCents, firstPercent, remainingPercent },
  });

  revalidatePath("/settings");
  revalidatePath("/finance");
}
