"use server";

import { redirect } from "next/navigation";
import type { UserRole } from "@scalex/db/types";
import { getServiceDb } from "@/lib/admin-db";

const STAFF_ROLES: UserRole[] = [
  "instructor",
  "mentor",
  "sales",
  "super_admin",
];

function inviteErrorPath(inviteId: string, message: string) {
  return `/invite/${inviteId}?error=${encodeURIComponent(message)}`;
}

export async function acceptStaffInviteAction(formData: FormData) {
  const inviteId = String(formData.get("inviteId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!inviteId) {
    redirect("/login?error=" + encodeURIComponent("Invite is missing."));
  }
  if (!name) {
    redirect(inviteErrorPath(inviteId, "Name is required."));
  }
  if (password.length < 8) {
    redirect(
      inviteErrorPath(inviteId, "Password must be at least 8 characters.")
    );
  }
  if (password !== confirm) {
    redirect(inviteErrorPath(inviteId, "Passwords do not match."));
  }

  const db = getServiceDb();
  const { data: invite, error: inviteError } = await db
    .from("staff_invites")
    .select("id, email, role, accepted_at, expires_at")
    .eq("id", inviteId)
    .maybeSingle();

  if (inviteError) {
    redirect(inviteErrorPath(inviteId, inviteError.message));
  }
  if (!invite) {
    redirect(inviteErrorPath(inviteId, "This invite was not found."));
  }
  if (invite.accepted_at) {
    redirect(inviteErrorPath(inviteId, "This invite has already been accepted."));
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    redirect(inviteErrorPath(inviteId, "This invite has expired."));
  }
  if (!STAFF_ROLES.includes(invite.role as UserRole)) {
    redirect(inviteErrorPath(inviteId, "This invite has an invalid role."));
  }

  const { data: created, error: createError } = await db.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { name, role: invite.role },
  });

  if (createError || !created.user) {
    redirect(
      inviteErrorPath(
        inviteId,
        createError?.message || "Could not create the staff account."
      )
    );
  }

  const { error: profileError } = await db.from("profiles").upsert(
    {
      id: created.user.id,
      email: invite.email,
      name,
      role: invite.role,
      status: "active",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    redirect(inviteErrorPath(inviteId, profileError.message));
  }

  const { error: acceptError } = await db
    .from("staff_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id)
    .is("accepted_at", null);

  if (acceptError) {
    redirect(inviteErrorPath(inviteId, acceptError.message));
  }

  redirect(
    `/login?error=${encodeURIComponent("Invite accepted. Sign in with your new password.")}`
  );
}
