"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";

export async function markLessonComplete(lessonId: string) {
  const { userId } = await requireStudentProfile();
  const supabase = await createClient();

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
