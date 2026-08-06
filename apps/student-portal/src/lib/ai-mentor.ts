import { cache } from "react";
import { createClient } from "@scalex/db/server";
import {
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getEnrollment,
  getPublishedCourse,
  getTasksByMilestoneId,
} from "@/lib/data";

export type AiMentorContext = {
  courseTitle: string;
  milestoneTitle: string;
  milestoneIndex: number;
  milestoneTotal: number;
  currentLessonTitle: string | null;
  currentTaskTitle: string | null;
  continueHref: string;
  completionPercent: number;
};

export type AiChatSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export const getAiMentorContext = cache(
  async (studentId: string): Promise<AiMentorContext> => {
    const course = await getPublishedCourse();
    const empty: AiMentorContext = {
      courseTitle: "Amazon FBA Private Label",
      milestoneTitle: "Foundation",
      milestoneIndex: 1,
      milestoneTotal: 8,
      currentLessonTitle: null,
      currentTaskTitle: null,
      continueHref: "/roadmap",
      completionPercent: 0,
    };

    if (!course) return empty;

    const enrollment = await getEnrollment(studentId, course.id);
    const roadmap = await getCourseWithRoadmap(course.id);
    const completedIds = enrollment
      ? await getCompletedLessonIds(studentId)
      : new Set<string>();

    const milestoneTotal = Math.max(1, roadmap.length);
    const currentMilestone =
      roadmap.find((ms) => {
        const lessons = ms.modules.flatMap((m) => m.lessons);
        return lessons.some((l) => !completedIds.has(l.id));
      }) ?? roadmap[roadmap.length - 1];

    if (!currentMilestone) {
      return {
        ...empty,
        courseTitle: course.title,
        completionPercent: enrollment?.completion_percent ?? 0,
      };
    }

    const milestoneIndex =
      roadmap.findIndex((ms) => ms.id === currentMilestone.id) + 1;

    const orderedLessons = [...currentMilestone.modules]
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .flatMap((m) =>
        [...m.lessons].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      );

    const nextLesson = orderedLessons.find((l) => !completedIds.has(l.id));
    const tasks = await getTasksByMilestoneId(currentMilestone.id);
    const task = tasks[0] ?? null;

    let continueHref = "/roadmap";
    if (nextLesson) continueHref = `/lessons/${nextLesson.id}`;
    else if (task) continueHref = `/tasks/${task.id}`;

    return {
      courseTitle: course.title,
      milestoneTitle: currentMilestone.title,
      milestoneIndex: milestoneIndex > 0 ? milestoneIndex : 1,
      milestoneTotal,
      currentLessonTitle: nextLesson?.title ?? orderedLessons.at(-1)?.title ?? null,
      currentTaskTitle: task?.title ?? null,
      continueHref,
      completionPercent: enrollment?.completion_percent ?? 0,
    };
  }
);

export async function getRecentAiChats(
  studentId: string,
  limit = 8
): Promise<AiChatSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_chats")
    .select("id, title, updated_at")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as { id: string; title: string | null; updated_at: string }[]).map(
    (row) => ({
      id: row.id,
      title: row.title?.trim() || "Untitled chat",
      updatedAt: row.updated_at,
    })
  );
}

export async function getAiChatMessages(chatId: string, studentId: string) {
  const supabase = await createClient();
  const { data: chat } = await supabase
    .from("ai_chats")
    .select("id")
    .eq("id", chatId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!chat) return [];

  const { data } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return ((data ?? []) as { role: string; content: string }[])
    .filter((row) => row.role === "user" || row.role === "assistant")
    .map((row) => ({
      role: row.role as "user" | "assistant",
      content: row.content,
    }));
}
