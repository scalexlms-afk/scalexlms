import type { Lesson } from "@scalex/db/types";
import { getDashboardData, type DashboardMilestone } from "@/lib/dashboard";
import {
  getCommunityPosts,
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getPublishedCourse,
  type CommunityPost,
  type Submission,
  type SubmissionStatus,
  type Task,
} from "@/lib/data";

export type RoadmapStepStatus = "completed" | "current" | "upcoming";

export type ContinueRoadmapStep = {
  id: string;
  label: string;
  status: RoadmapStepStatus;
  href: string | null;
  kind: "lesson" | "task";
};

export type ContinueResource = {
  id: string;
  title: string;
  typeLabel: string;
  href: string;
  downloadable?: boolean;
};

export type ContinueLearningData = {
  continueHref: string;
  currentStage: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  nextMilestone: DashboardMilestone | null;
  unlocksLabel: string;
  missionTitle: string;
  missionBody: string;
  estimatedTimeLabel: string;
  difficultyLabel: string;
  whyThisMatters: string;
  learnItems: string[];
  roadmapSteps: ContinueRoadmapStep[];
  stepsCompleted: number;
  stepsTotal: number;
  resources: ContinueResource[];
  aiPrompts: string[];
  communityPosts: CommunityPost[];
  currentTask: Task | null;
  currentSubmission: Submission | null;
};

function contentTypeLabel(type: Lesson["content_type"] | undefined) {
  switch (type) {
    case "video":
      return "Video";
    case "pdf":
      return "PDF";
    case "link":
      return "Link";
    case "text":
      return "Reading";
    default:
      return "Lesson";
  }
}

function resourceTypeLabel(type: Lesson["content_type"]) {
  switch (type) {
    case "pdf":
      return "PDF";
    case "link":
      return "Link";
    case "video":
      return "Video";
    default:
      return "Guide";
  }
}

function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) return null;
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

export function promptsForStage(stageTitle: string): string[] {
  const stage = stageTitle.toLowerCase();
  if (stage.includes("foundation") || stage.includes("setup")) {
    return [
      "What documents do I need for an LLC?",
      "What is an EIN?",
      "Explain business setup like I'm 15",
    ];
  }
  if (stage.includes("brand")) {
    return [
      "How do I pick a brand name?",
      "What makes a strong Amazon brand?",
      "Help me define brand direction",
    ];
  }
  if (stage.includes("product") || stage.includes("hunting")) {
    return [
      "How do I validate product demand?",
      "What metrics matter for product research?",
      "Explain competition research simply",
    ];
  }
  if (stage.includes("sourc")) {
    return [
      "How do I vet a supplier?",
      "What should I ask Alibaba suppliers?",
      "Help me compare MOQ and pricing",
    ];
  }
  if (stage.includes("launch")) {
    return [
      "What is an Amazon launch checklist?",
      "How should I plan my first PPC?",
      "Explain FBA launch steps",
    ];
  }
  if (stage.includes("scal")) {
    return [
      "How do I scale after first sales?",
      "When should I expand SKUs?",
      "Help me prioritize growth levers",
    ];
  }
  return [
    `Help me with ${stageTitle}`,
    "What should I do next in this milestone?",
    "Explain this stage like I'm new to Amazon",
  ];
}

function orderedLessonsForMilestone(
  modules: { order_index: number; lessons: Lesson[] }[]
) {
  return [...modules]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap((m) =>
      [...m.lessons].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      )
    );
}

export async function getContinueLearningData(
  userId: string,
  profileName: string,
  premium: boolean
): Promise<ContinueLearningData> {
  const dashboard = await getDashboardData(userId, profileName, premium);
  const course = await getPublishedCourse();

  const empty: ContinueLearningData = {
    continueHref: dashboard.continueHref,
    currentStage: dashboard.currentStage,
    stepIndex: dashboard.stepIndex,
    totalSteps: dashboard.totalSteps,
    completionPercent: dashboard.completionPercent,
    nextMilestone: dashboard.nextMilestone,
    unlocksLabel: dashboard.unlocksLabel,
    missionTitle: "Continue your roadmap",
    missionBody:
      "Open your next lesson or milestone task to keep moving toward launch.",
    estimatedTimeLabel: "Start anytime",
    difficultyLabel: "Lesson",
    whyThisMatters: `Complete ${dashboard.currentStage} to unlock the next stage of your Amazon journey.`,
    learnItems: [],
    roadmapSteps: [],
    stepsCompleted: 0,
    stepsTotal: 0,
    resources: [],
    aiPrompts: promptsForStage(dashboard.currentStage),
    communityPosts: [],
    currentTask: dashboard.currentTask,
    currentSubmission: dashboard.currentSubmission,
  };

  const communityPosts = await getCommunityPosts("questions", userId, 3);

  if (!course || !dashboard.currentMilestoneId) {
    return { ...empty, communityPosts };
  }

  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
  ]);

  const milestone = roadmap.find((ms) => ms.id === dashboard.currentMilestoneId);
  if (!milestone) {
    return { ...empty, communityPosts };
  }

  const lessons = orderedLessonsForMilestone(milestone.modules);
  const currentLesson =
    lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0] ?? null;

  const remainingLessons = lessons.filter((l) => !completedIds.has(l.id));
  const remainingSeconds = remainingLessons.reduce(
    (sum, l) => sum + (l.duration_seconds ?? 0),
    0
  );
  const durationLabel = formatDuration(remainingSeconds);
  const estimatedTimeLabel =
    durationLabel ??
    (remainingLessons.length === 0
      ? "Ready to submit"
      : remainingLessons.length === 1
        ? "1 lesson left"
        : `${remainingLessons.length} lessons left`);

  const task = dashboard.currentTask;
  const submission = dashboard.currentSubmission;
  const status: SubmissionStatus = submission?.status ?? "not_started";

  const missionTitle =
    task?.title ?? currentLesson?.title ?? "Continue your roadmap";
  const missionBody =
    task?.description?.trim() ||
    (currentLesson?.content_text?.trim().slice(0, 220) || "") ||
    empty.missionBody;

  const whyThisMatters =
    task?.description?.trim() ||
    `Finishing ${dashboard.currentStage} unlocks ${dashboard.unlocksLabel} and keeps your launch path on track.`;

  const learnItems = lessons.map((l) => l.title);

  const roadmapSteps: ContinueRoadmapStep[] = lessons.map((lesson) => {
    const done = completedIds.has(lesson.id);
    const isCurrent = !done && currentLesson?.id === lesson.id;
    return {
      id: lesson.id,
      label: lesson.title,
      status: done ? "completed" : isCurrent ? "current" : "upcoming",
      href: `/lessons/${lesson.id}`,
      kind: "lesson",
    };
  });

  if (task) {
    const submitDone =
      status === "submitted" ||
      status === "under_review" ||
      status === "approved" ||
      status === "revision_required";
    const allLessonsDone =
      lessons.length === 0 || lessons.every((l) => completedIds.has(l.id));

    roadmapSteps.push({
      id: `submit-${task.id}`,
      label: "Submit for Review",
      status: submitDone
        ? "completed"
        : allLessonsDone
          ? "current"
          : "upcoming",
      href: `/tasks/${task.id}`,
      kind: "task",
    });

    roadmapSteps.push({
      id: `approve-${task.id}`,
      label: "Mentor Approval",
      status:
        status === "approved"
          ? "completed"
          : status === "under_review" || status === "submitted"
            ? "current"
            : "upcoming",
      href: `/tasks/${task.id}`,
      kind: "task",
    });
  }

  // Ensure one current step
  if (
    roadmapSteps.length > 0 &&
    !roadmapSteps.some((s) => s.status === "current")
  ) {
    const firstUpcoming = roadmapSteps.find((s) => s.status === "upcoming");
    if (firstUpcoming) firstUpcoming.status = "current";
  }

  const stepsCompleted = roadmapSteps.filter(
    (s) => s.status === "completed"
  ).length;
  const stepsTotal = roadmapSteps.length;

  const resources: ContinueResource[] = lessons
    .filter((l) => l.content_type === "pdf" || l.content_type === "link")
    .map((l) => ({
      id: l.id,
      title: l.title,
      typeLabel: resourceTypeLabel(l.content_type),
      href: `/lessons/${l.id}`,
      downloadable: l.content_type === "pdf",
    }));

  if (task) {
    for (const format of task.accepted_formats ?? []) {
      resources.push({
        id: `format-${format}`,
        title: `Submit as ${format}`,
        typeLabel: format.toUpperCase(),
        href: `/tasks/${task.id}`,
      });
    }
  }

  return {
    continueHref: dashboard.continueHref,
    currentStage: dashboard.currentStage,
    stepIndex: dashboard.stepIndex,
    totalSteps: dashboard.totalSteps,
    completionPercent: dashboard.completionPercent,
    nextMilestone: dashboard.nextMilestone,
    unlocksLabel: dashboard.unlocksLabel,
    missionTitle,
    missionBody,
    estimatedTimeLabel,
    difficultyLabel: contentTypeLabel(currentLesson?.content_type),
    whyThisMatters,
    learnItems,
    roadmapSteps,
    stepsCompleted,
    stepsTotal,
    resources,
    aiPrompts: promptsForStage(dashboard.currentStage),
    communityPosts,
    currentTask: task,
    currentSubmission: submission,
  };
}
