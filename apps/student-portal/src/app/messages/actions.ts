"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { createNotification } from "@scalex/db";
import { requireStudentProfile } from "@/lib/auth";

export async function sendMentorMessageAction(formData: FormData) {
  const { userId, profile } = await requireStudentProfile();
  const content = (formData.get("content") as string)?.trim();

  if (!content) throw new Error("Message required");
  if (!profile.mentor_id) {
    throw new Error("No mentor assigned yet");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    sender_id: userId,
    recipient_id: profile.mentor_id,
    content,
  } as never);

  if (error) throw new Error(error.message);

  await createNotification({
    userId: profile.mentor_id,
    type: "message",
    title: `Message from ${profile.name}`,
    body: content.slice(0, 120),
    payload: { from: userId },
  });

  revalidatePath("/messages");
}
