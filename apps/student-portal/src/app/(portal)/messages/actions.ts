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

export async function requestMentorCallAction(formData: FormData) {
  const { userId, profile } = await requireStudentProfile();

  if (!isPremiumPlan(profile.plan)) {
    throw new Error("Mentor calls are a Premium feature");
  }
  if (!profile.mentor_id) {
    throw new Error("No mentor is assigned yet");
  }

  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const durationRaw = Number(formData.get("durationMinutes") ?? 30);
  const durationMinutes = [15, 30, 45, 60].includes(durationRaw)
    ? durationRaw
    : 30;

  if (!scheduledRaw) throw new Error("Pick a date and time");

  const scheduledAt = new Date(scheduledRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid date and time");
  }
  if (scheduledAt.getTime() < Date.now() + 30 * 60 * 1000) {
    throw new Error("Choose a time at least 30 minutes from now");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mentor_calls").insert({
    student_id: userId,
    mentor_id: profile.mentor_id,
    scheduled_at: scheduledAt.toISOString(),
    duration_minutes: durationMinutes,
    notes,
    status: "scheduled",
  } as never);

  if (error) throw new Error(error.message);

  const when = scheduledAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await createNotification({
    userId: profile.mentor_id,
    type: "system",
    title: "Mentor call requested",
    body: `${profile.name} requested a ${durationMinutes}-min call for ${when}.`,
    payload: {
      studentId: userId,
      scheduledAt: scheduledAt.toISOString(),
    },
  });

  await createNotification({
    userId,
    type: "system",
    title: "Call request sent",
    body: `Your ${durationMinutes}-min mentor call request for ${when} was sent.`,
    payload: {
      scheduledAt: scheduledAt.toISOString(),
    },
  });

  revalidatePath("/messages");
  revalidatePath("/notifications");
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
