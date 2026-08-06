import type { Lesson } from "@scalex/db/types";
import { promptsForStage } from "@/lib/continue-learning";
import { getDashboardData, type DashboardMilestone } from "@/lib/dashboard";
import {
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getPublishedCourse,
  getTasksByMilestoneId,
  isMilestoneUnlocked,
} from "@/lib/data";

export type RoadmapLessonItem = {
  id: string;
  title: string;
  orderIndex: number;
  status: "completed" | "current" | "available" | "locked";
  href: string;
};

export type RoadmapMilestoneItem = {
  id: string;
  title: string;
  orderIndex: number;
  status: "completed" | "current" | "upcoming";
  unlocked: boolean;
  lessonsDone: number;
  lessonsTotal: number;
  progressPercent: number;
  whyThisMatters: string;
  lessons: RoadmapLessonItem[];
  task: { id: string; title: string; description: string | null } | null;
};

export type RoadmapPageData = {
  courseTitle: string;
  courseDescription: string | null;
  currentStage: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  continueHref: string;
  estimatedTimeLabel: string;
  nextMilestone: DashboardMilestone | null;
  unlocksLabel: string;
  unlockPreview: string[];
  aiPrompts: string[];
  mentorHref: string;
  currentMilestoneId: string | null;
  milestones: RoadmapMilestoneItem[];
};

function orderedLessons(
  modules: { order_index: number; title: string; lessons: Lesson[] }[]
) {
  return [...modules]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap((m) =>
      [...m.lessons].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      )
    );
}

function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) return null;
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

export async function getRoadmapPageData(
  userId: string,
  profileName: string,
  premium: boolean
): Promise<RoadmapPageData | null> {
  const course = await getPublishedCourse();
  if (!course) return null;

  const dashboard = await getDashboardData(userId, profileName, premium);
  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
  ]);

  const ordered = [...roadmap].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const unlockStates = await Promise.all(
    ordered.map(async (ms) => {
      const tasks = await getTasksByMilestoneId(ms.id);
      return {
        id: ms.id,
        unlocked: await isMilestoneUnlocked(userId, ms.id),
        task: tasks[0] ?? null,
      };
    })
  );
  const unlockById = new Map(unlockStates.map((s) => [s.id, s]));

  const milestones: RoadmapMilestoneItem[] = ordered.map((ms) => {
    const lessons = orderedLessons(ms.modules);
    const lessonsDone = lessons.filter((l) => completedIds.has(l.id)).length;
    const lessonsTotal = lessons.length;
    const allDone = lessonsTotal > 0 && lessonsDone === lessonsTotal;
    const isCurrent = ms.id === dashboard.currentMilestoneId;
    const unlock = unlockById.get(ms.id);
    const unlocked = unlock?.unlocked ?? false;
    const task = unlock?.task ?? null;

    let status: RoadmapMilestoneItem["status"] = "upcoming";
    if (allDone) status = "completed";
    else if (isCurrent) status = "current";

    const currentLessonId =
      status === "current" && unlocked
        ? (lessons.find((l) => !completedIds.has(l.id))?.id ?? null)
        : null;

    return {
      id: ms.id,
      title: ms.title,
      orderIndex: ms.order_index,
      status,
      unlocked,
      lessonsDone,
      lessonsTotal,
      progressPercent:
        lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
      whyThisMatters:
        task?.description?.trim() ||
        `Complete ${ms.title} to keep progressing toward your Amazon launch.`,
      lessons: lessons.map((lesson) => {
        const done = completedIds.has(lesson.id);
        if (done) {
          return {
            id: lesson.id,
            title: lesson.title,
            orderIndex: lesson.order_index,
            status: "completed" as const,
            href: `/lessons/${lesson.id}`,
          };
        }
        if (!unlocked) {
          return {
            id: lesson.id,
            title: lesson.title,
            orderIndex: lesson.order_index,
            status: "locked" as const,
            href: `/lessons/${lesson.id}`,
          };
        }
        return {
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.order_index,
          status:
            lesson.id === currentLessonId
              ? ("current" as const)
              : ("available" as const),
          href: `/lessons/${lesson.id}`,
        };
      }),
      task: task
        ? {
            id: task.id,
            title: task.title,
            description: task.description,
          }
        : null,
    };
  });

  const currentMs = ordered.find((m) => m.id === dashboard.currentMilestoneId);
  let estimatedTimeLabel = "Start anytime";
  if (currentMs) {
    const lessons = orderedLessons(currentMs.modules);
    const remaining = lessons.filter((l) => !completedIds.has(l.id));
    const seconds = remaining.reduce(
      (sum, l) => sum + (l.duration_seconds ?? 0),
      0
    );
    estimatedTimeLabel =
      formatDuration(seconds) ??
      (remaining.length === 0
        ? "Ready for task"
        : remaining.length === 1
          ? "1 lesson left"
          : `${remaining.length} lessons left`);
  }

  const next = dashboard.nextMilestone;
  let unlockPreview: string[] = [];
  if (next) {
    const nextMs = ordered.find((m) => m.id === next.id);
    if (nextMs) {
      const nextLessons = orderedLessons(nextMs.modules);
      unlockPreview = nextLessons.slice(0, 5).map((l) => l.title);
      if (unlockPreview.length === 0) {
        unlockPreview = [...nextMs.modules]
          .sort((a, b) => a.order_index - b.order_index)
          .slice(0, 5)
          .map((m) => m.title);
      }
    }
  }

  return {
    courseTitle: course.title,
    courseDescription: course.description,
    currentStage: dashboard.currentStage,
    stepIndex: dashboard.stepIndex,
    totalSteps: dashboard.totalSteps,
    completionPercent: dashboard.completionPercent,
    continueHref: "/continue-learning",
    estimatedTimeLabel,
    nextMilestone: dashboard.nextMilestone,
    unlocksLabel: dashboard.unlocksLabel,
    unlockPreview,
    aiPrompts: promptsForStage(dashboard.currentStage),
    mentorHref: premium ? "/messages" : "/payment?mode=upgrade",
    currentMilestoneId: dashboard.currentMilestoneId,
    milestones,
  };
}
