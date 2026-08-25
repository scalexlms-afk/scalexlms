"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@scalex/db";
import type { UserRole } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

const INVITE_ROLES: UserRole[] = [
  "instructor",
  "mentor",
  "sales",
  "super_admin",
];

export async function inviteStaffAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as UserRole;

  if (!email || !email.includes("@")) throw new Error("Valid email required");
  if (!INVITE_ROLES.includes(role)) throw new Error("Invalid role");

  const { userId, profile } = await requireAdminProfile();
  if (profile.role !== "super_admin") throw new Error("Forbidden");
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();

  const { data: existing } = await db
    .from("profiles")
    .select("id, role")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    throw new Error("A user with this email already exists. Edit their role instead.");
  }

  const { data, error } = await db
    .from("staff_invites")
    .insert({
      email,
      role,
      invited_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
      throw new Error("A pending invite already exists for this email");
    }
    throw new Error(error.message);
  }

  await writeAuditLog({
    actorId: userId,
    action: "staff_invite.created",
    targetType: "staff_invite",
    targetId: data.id,
    metadata: { email, role },
  });

  revalidatePath("/team");
  redirect("/team?invited=1");
}

export async function deleteStaffInviteAction(formData: FormData) {
  const inviteId = formData.get("inviteId") as string;
  if (!inviteId) throw new Error("Invite required");

  const { userId, profile } = await requireAdminProfile();
  if (profile.role !== "super_admin") throw new Error("Forbidden");
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("staff_invites")
    .delete()
    .eq("id", inviteId)
    .is("accepted_at", null);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "staff_invite.deleted",
    targetType: "staff_invite",
    targetId: inviteId,
  });

  revalidatePath("/team");
}
