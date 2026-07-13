"use server";

import { revalidatePath } from "next/cache";
import { createNotification, writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

export async function updateTicketStatusAction(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;

  if (
    !ticketId ||
    !["open", "in_progress", "resolved", "closed"].includes(status)
  ) {
    throw new Error("Invalid ticket update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const db = getServiceDb();
  const { data: ticket, error } = await db
    .from("support_tickets")
    .update({ status } as never)
    .eq("id", ticketId)
    .select("id, student_id, subject")
    .single();

  if (error || !ticket) throw new Error(error?.message ?? "Update failed");

  await writeAuditLog({
    actorId: userId,
    action: "support_ticket.status_updated",
    targetType: "support_ticket",
    targetId: ticketId,
    metadata: { status },
  });

  await createNotification({
    userId: (ticket as { student_id: string }).student_id,
    type: "support_ticket",
    title: "Support ticket updated",
    body: `Your ticket "${(ticket as { subject: string }).subject}" is now ${status.replace(/_/g, " ")}.`,
    payload: { ticketId },
  });

  revalidatePath("/support");
}
