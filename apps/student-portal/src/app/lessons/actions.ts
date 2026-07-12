"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";
import { isMilestoneUnlocked } from "@/lib/data";

export async function markLessonComplete(lessonId: string) {
  const { userId } = await requireStudentProfile();
  const supabase = await createClient();

  // Resolve the lesson's milestone and enforce the gating rule server-side so a
  // student cannot complete lessons in a locked milestone by calling the action
  // directly.
  const { data: lessonRow } = await supabase
    .from("lessons")
    .select("module_id, modules(milestone_id)")
    .eq("id", lessonId)
    .maybeSingle();

  const milestoneId = (
    lessonRow as { modules?: { milestone_id?: string } } | null
  )?.modules?.milestone_id;

  if (!milestoneId) {
    throw new Error("Lesson not found");
  }

  const unlocked = await isMilestoneUnlocked(userId, milestoneId);
  if (!unlocked) {
    throw new Error("This milestone is locked. Complete the previous one first.");
  }

  const { error } = await supabase.from("lesson_completions").insert({
    student_id: userId,
    lesson_id: lessonId,
  } as never);

  if (error && !error.message.includes("duplicate")) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath(`/lessons/${lessonId}`);
}
