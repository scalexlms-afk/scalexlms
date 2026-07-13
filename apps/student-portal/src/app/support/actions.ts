"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { isPremiumPlan, createNotification } from "@scalex/db";
import { requireStudentProfile } from "@/lib/auth";

export async function createSupportTicketAction(formData: FormData) {
  const { userId, profile } = await requireStudentProfile();
  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  if (!subject || !body) throw new Error("Subject and message are required");

  const supabase = await createClient();
  const priority = isPremiumPlan(profile.plan) ? "high" : "normal";

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      student_id: userId,
      subject,
      body,
      priority,
    } as never)
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create ticket");

  if (profile.mentor_id) {
    await createNotification({
      userId: profile.mentor_id,
      type: "support_ticket",
      title: "New support ticket",
      body: `${profile.name}: ${subject}`,
      payload: { ticketId: (data as { id: string }).id },
    });
  }

  revalidatePath("/support");
}
