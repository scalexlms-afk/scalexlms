"use server";

import { revalidatePath } from "next/cache";
import { createNotification, writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

export async function updateTicketStatusAction(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;
  const reply = (formData.get("reply") as string)?.trim() || null;

  if (
    !ticketId ||
    !["open", "in_progress", "resolved", "closed"].includes(status)
  ) {
    throw new Error("Invalid ticket update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const db = getServiceDb();

  if (profile.role === "mentor") {
    const { data: ticket } = await db
      .from("support_tickets")
      .select("student_id")
      .eq("id", ticketId)
      .maybeSingle();
    const studentId = (ticket as { student_id?: string } | null)?.student_id;
    if (!studentId) throw new Error("Ticket not found");

    const { data: student } = await db
      .from("profiles")
      .select("mentor_id")
      .eq("id", studentId)
      .maybeSingle();
    if (
      (student as { mentor_id?: string | null } | null)?.mentor_id !== userId
    ) {
      throw new Error("You can only update tickets for your assigned students");
    }
  }

  const updates: Record<string, unknown> = { status };
  if (reply) {
    updates.staff_reply = reply;
    updates.staff_reply_at = new Date().toISOString();
    updates.staff_replied_by = userId;
    if (status === "open") {
      updates.status = "in_progress";
    }
  }

  const { data: ticket, error } = await db
    .from("support_tickets")
    .update(updates as never)
    .eq("id", ticketId)
    .select("id, student_id, subject")
    .single();

  if (error || !ticket) throw new Error(error?.message ?? "Update failed");

  await writeAuditLog({
    actorId: userId,
    action: reply
      ? "support_ticket.replied"
      : "support_ticket.status_updated",
    targetType: "support_ticket",
    targetId: ticketId,
    metadata: { status: updates.status, hasReply: Boolean(reply) },
  });

  await createNotification({
    userId: (ticket as { student_id: string }).student_id,
    type: "support_ticket",
    title: reply ? "Mentor replied to your ticket" : "Support ticket updated",
    body: reply
      ? reply.slice(0, 120)
      : `Your ticket "${(ticket as { subject: string }).subject}" is now ${String(updates.status).replace(/_/g, " ")}.`,
    payload: { ticketId },
  });

  revalidatePath("/support");
}
