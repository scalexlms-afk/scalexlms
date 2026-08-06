"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import type { Json } from "@scalex/db/types";
import { requireStudentProfile } from "@/lib/auth";
import { isMilestoneUnlocked } from "@/lib/data";

async function assertLessonUnlocked(lessonId: string, userId: string) {
  const supabase = await createClient();
  const { data: lessonRow } = await supabase
    .from("lessons")
    .select("module_id, completion_type, modules(milestone_id)")
    .eq("id", lessonId)
    .maybeSingle();

  const milestoneId = (
    lessonRow as { modules?: { milestone_id?: string } } | null
  )?.modules?.milestone_id;

  if (!milestoneId || !lessonRow) {
    throw new Error("Lesson not found");
  }

  const unlocked = await isMilestoneUnlocked(userId, milestoneId);
  if (!unlocked) {
    throw new Error("This milestone is locked. Complete the previous one first.");
  }

  return lessonRow as {
    completion_type: string;
    modules?: { milestone_id?: string };
  };
}

export async function markLessonComplete(lessonId: string) {
  const { userId } = await requireStudentProfile();
  const lesson = await assertLessonUnlocked(lessonId, userId);

  if (lesson.completion_type === "quiz_pass") {
    throw new Error("This lesson requires a passing quiz score.");
  }

  if (
    lesson.completion_type === "upload_file" ||
    lesson.completion_type === "mentor_task"
  ) {
    throw new Error("Complete the linked task to finish this lesson.");
  }

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

export async function submitQuizAttemptAction(
  lessonId: string,
  answers: Record<string, number>
): Promise<{ scorePercent: number; passed: boolean }> {
  const { userId } = await requireStudentProfile();
  await assertLessonUnlocked(lessonId, userId);

  const supabase = await createClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(
      "id, pass_percent, quiz_questions(id, correct_index, order_index)"
    )
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (quizError) throw new Error(quizError.message);
  if (!quiz) throw new Error("No quiz found for this lesson");

  const quizRow = quiz as {
    id: string;
    pass_percent: number;
    quiz_questions?:
      | { id: string; correct_index: number; order_index: number }[]
      | null;
  };

  const questions = (quizRow.quiz_questions ?? []).slice();

  if (questions.length === 0) {
    throw new Error("This quiz has no questions yet");
  }

  let correct = 0;
  for (const question of questions) {
    if (answers[question.id] === question.correct_index) {
      correct += 1;
    }
  }

  const scorePercent = Math.round((correct / questions.length) * 10000) / 100;
  const passPercent = Number(quizRow.pass_percent);
  const passed = scorePercent >= passPercent;

  const { error: attemptError } = await supabase.from("quiz_attempts").insert({
    student_id: userId,
    quiz_id: quizRow.id,
    lesson_id: lessonId,
    score_percent: scorePercent,
    passed,
    answers: answers as Json,
  } as never);

  if (attemptError) throw new Error(attemptError.message);

  if (passed) {
    const { error: completionError } = await supabase
      .from("lesson_completions")
      .insert({
        student_id: userId,
        lesson_id: lessonId,
      } as never);

    if (
      completionError &&
      !completionError.message.toLowerCase().includes("duplicate")
    ) {
      throw new Error(completionError.message);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath(`/lessons/${lessonId}`);

  return { scorePercent, passed };
}
