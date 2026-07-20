import type { Announcement } from "@scalex/db/types";
import {
  ensureEnrollment,
  getAnnouncements,
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getPendingRemainingPayment,
  getPublishedCourse,
  getStudentBadges,
  getStudentJourneySummary,
  getSubmissionForTask,
  getTaskByMilestoneId,
  getUpcomingSessions,
  type Badge,
  type LiveSession,
  type Submission,
  type Task,
} from "@/lib/data";

export type MilestoneStatus = "completed" | "current" | "upcoming";

export type DashboardMilestone = {
  id: string;
  title: string;
  orderIndex: number;
  status: MilestoneStatus;
  moduleCount: number;
  firstModuleTitle: string | null;
};

export type DashboardData = {
  firstName: string;
  completionPercent: number;
  currentStage: string;
  currentMilestoneId: string | null;
  stepIndex: number;
  totalSteps: number;
  lessonsLeftInStage: number;
  continueHref: string;
  currentTask: Task | null;
  currentSubmission: Submission | null;
  nextMilestone: DashboardMilestone | null;
  unlocksLabel: string;
  milestones: DashboardMilestone[];
  announcements: Announcement[];
  upcomingSessions: (LiveSession & { registered: boolean })[];
  badges: Badge[];
  remainingPayment: { id: string; amount: number; status: string } | null;
};

function firstNameFrom(name: string) {
  const token = name.trim().split(/\s+/).filter(Boolean)[0];
  return token || "Student";
}

export async function getDashboardData(
  userId: string,
  profileName: string,
  premium: boolean
): Promise<DashboardData> {
  const course = await getPublishedCourse();
  const journey = await getStudentJourneySummary(userId);

  const empty: DashboardData = {
    firstName: firstNameFrom(profileName),
    completionPercent: journey.completionPercent,
    currentStage: journey.currentStage,
    currentMilestoneId: journey.currentMilestoneId,
    stepIndex: 1,
    totalSteps: 8,
    lessonsLeftInStage: 0,
    continueHref: journey.continueHref,
    currentTask: null,
    currentSubmission: null,
    nextMilestone: null,
    unlocksLabel: "Program complete",
    milestones: [],
    announcements: [],
    upcomingSessions: [],
    badges: [],
    remainingPayment: null,
  };

  const [announcements, upcomingSessions, badges, remainingPayment] =
    await Promise.all([
      getAnnouncements(3),
      premium ? getUpcomingSessions(userId, 1) : Promise.resolve([]),
      getStudentBadges(userId),
      getPendingRemainingPayment(userId),
    ]);

  if (!course) {
    return {
      ...empty,
      announcements,
      upcomingSessions,
      badges,
      remainingPayment,
    };
  }

  await ensureEnrollment(userId, course.id);
  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
  ]);

  const ordered = [...roadmap].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  let currentFound = false;
  const milestones: DashboardMilestone[] = ordered.map((ms) => {
    const lessons = ms.modules.flatMap((m) => m.lessons);
    const allDone =
      lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
    const someDone = lessons.some((l) => completedIds.has(l.id));

    let status: MilestoneStatus = "upcoming";
    if (allDone) {
      status = "completed";
    } else if (!currentFound && (someDone || ms.id === journey.currentMilestoneId)) {
      status = "current";
      currentFound = true;
    } else if (!currentFound && lessons.length === 0 && ms.id === journey.currentMilestoneId) {
      status = "current";
      currentFound = true;
    }

    const modules = [...ms.modules].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    return {
      id: ms.id,
      title: ms.title,
      orderIndex: ms.order_index,
      status,
      moduleCount: ms.modules.length,
      firstModuleTitle: modules[0]?.title ?? null,
    };
  });

  // If nothing marked current yet, mark first incomplete / last as current
  if (!milestones.some((m) => m.status === "current") && milestones.length > 0) {
    const fallback =
      milestones.find((m) => m.status === "upcoming") ??
      milestones[milestones.length - 1]!;
    fallback.status = "current";
  }

  const currentIndex = Math.max(
    0,
    milestones.findIndex((m) => m.id === journey.currentMilestoneId)
  );
  const current = milestones[currentIndex] ?? milestones[0] ?? null;
  const nextMilestone =
    currentIndex >= 0 && currentIndex < milestones.length - 1
      ? milestones[currentIndex + 1]!
      : null;

  let lessonsLeftInStage = 0;
  if (journey.currentMilestoneId) {
    const ms = ordered.find((m) => m.id === journey.currentMilestoneId);
    if (ms) {
      const lessons = ms.modules.flatMap((m) => m.lessons);
      lessonsLeftInStage = lessons.filter((l) => !completedIds.has(l.id)).length;
    }
  }

  let currentTask: Task | null = null;
  let currentSubmission: Submission | null = null;
  if (journey.currentMilestoneId) {
    currentTask = await getTaskByMilestoneId(journey.currentMilestoneId);
    if (currentTask) {
      currentSubmission = await getSubmissionForTask(currentTask.id, userId);
    }
  }

  const stepIndex =
    currentIndex >= 0 ? currentIndex + 1 : Math.max(1, milestones.length);

  return {
    firstName: firstNameFrom(profileName),
    completionPercent: journey.completionPercent,
    currentStage: journey.currentStage,
    currentMilestoneId: journey.currentMilestoneId,
    stepIndex,
    totalSteps: Math.max(milestones.length, 1),
    lessonsLeftInStage,
    continueHref: journey.continueHref,
    currentTask,
    currentSubmission,
    nextMilestone,
    unlocksLabel: nextMilestone?.title ?? "Program complete",
    milestones,
    announcements,
    upcomingSessions,
    badges,
    remainingPayment,
  };
}
