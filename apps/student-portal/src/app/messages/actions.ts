"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import { createNotification, isPremiumPlan } from "@scalex/db";
import { requireStudentProfile } from "@/lib/auth";

export async function sendMentorMessageAction(content: string) {
  const { userId, profile } = await requireStudentProfile();
  const trimmed = content.trim();

  if (!trimmed) throw new Error("Message required");
  if (!isPremiumPlan(profile.plan)) {
    throw new Error("Mentor messaging is a Premium feature");
  }
  if (!profile.mentor_id) {
    throw new Error("No mentor is assigned yet");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    sender_id: userId,
    recipient_id: profile.mentor_id,
    content: trimmed,
  } as never);

  if (error) throw new Error(error.message);

  await createNotification({
    userId: profile.mentor_id,
    type: "message",
    title: `Message from ${profile.name}`,
    body: trimmed.slice(0, 120),
    payload: { from: userId },
  });

  revalidatePath("/messages");
}

export async function markMentorMessagesReadAction() {
  const { userId, profile } = await requireStudentProfile();
  if (!profile.mentor_id) return;

  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() } as never)
    .eq("recipient_id", userId)
    .eq("sender_id", profile.mentor_id)
    .is("read_at", null);

  revalidatePath("/messages");
}

/** Legacy form wrapper kept for any old form posts */
export async function sendMentorMessageFormAction(formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  if (!content) {
    redirect("/messages?error=" + encodeURIComponent("Message required"));
  }
  try {
    await sendMentorMessageAction(content);
  } catch (err) {
    redirect(
      "/messages?error=" +
        encodeURIComponent(err instanceof Error ? err.message : "Failed")
    );
  }
  redirect("/messages?sent=1");
}
