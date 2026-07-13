"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import { createNotification, isPremiumPlan } from "@scalex/db";
import { requireStudentProfile } from "@/lib/auth";

export async function sendMentorMessageAction(formData: FormData) {
  const { userId, profile } = await requireStudentProfile();
  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    redirect("/messages?error=" + encodeURIComponent("Message required"));
  }

  if (!isPremiumPlan(profile.plan)) {
    redirect("/messages?error=" + encodeURIComponent("Mentor messaging is a Premium feature"));
  }

  if (!profile.mentor_id) {
    redirect(
      "/messages?error=" +
        encodeURIComponent("No mentor is assigned yet. Open a support ticket instead.")
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    sender_id: userId,
    recipient_id: profile.mentor_id,
    content,
  } as never);

  if (error) {
    redirect("/messages?error=" + encodeURIComponent(error.message));
  }

  await createNotification({
    userId: profile.mentor_id,
    type: "message",
    title: `Message from ${profile.name}`,
    body: content.slice(0, 120),
    payload: { from: userId },
  });

  revalidatePath("/messages");
  redirect("/messages?sent=1");
}
