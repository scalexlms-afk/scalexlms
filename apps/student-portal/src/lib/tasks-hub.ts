import type { Lesson } from "@scalex/db/types";
import { promptsForStage } from "@/lib/continue-learning";
import { getDashboardData } from "@/lib/dashboard";
import {
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getPublishedCourse,
  getSubmissionForTask,
  getTaskByMilestoneId,
  isMilestoneUnlocked,
  type SubmissionStatus,
  type Task,
} from "@/lib/data";

export type TasksHubStats = {
  pending: number;
  underReview: number;
  completed: number;
  total: number;
};

export type ChecklistStep = {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
};

export type TimelineStage = {
  id: string;
  label: string;
  state: "done" | "current" | "upcoming";
};

export type HubTaskItem = {
  milestoneId: string;
  milestoneTitle: string;
  task: Task;
  status: SubmissionStatus;
  unlocked: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type TasksHubData = {
  stats: TasksHubStats;
  current: {
    milestoneId: string;
    milestoneTitle: string;
    task: Task;
    status: SubmissionStatus;
    unlocked: boolean;
    canSubmit: boolean;
    estimatedTimeLabel: string;
    formatsLabel: string;
    unlockReward: string;
    objective: string;
    whyThisMatters: string;
    requirements: string[];
    lessonHref: string;
    implementationSteps: ChecklistStep[];
    timeline: TimelineStage[];
    aiPrompts: string[];
    hasAiNotes: boolean;
    hasMentorReview: boolean;
  } | null;
  completed: HubTaskItem[];
  allTasks: HubTaskItem[];
};

function orderedLessons(
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

function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) return null;
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

function formatsLabel(formats: string[]) {
  return formats
    .map((f) => {
      switch (f) {
        case "pdf":
          return "PDF";
        case "image":
          return "Image";
        case "excel":
          return "Excel";
        case "link":
          return "Link";
        case "text":
          return "Text";
        default:
          return f;
      }
    })
    .join(", ");
}

function requirementsFromTask(task: Task): string[] {
  const fromFormats = task.accepted_formats.map((f) => {
    switch (f) {
      case "pdf":
        return "Upload a PDF document";
      case "image":
        return "Upload supporting images";
      case "excel":
        return "Upload an Excel / CSV sheet";
      case "link":
        return "Share a Drive / Dropbox / web link";
      case "text":
        return "Add written notes or comments";
      default:
        return `Submit as ${f}`;
    }
  });

  const fromDescription = (task.description ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 8 && line.length < 120);

  const merged = [...fromFormats];
  for (const line of fromDescription.slice(0, 4)) {
    if (!merged.some((m) => m.toLowerCase() === line.toLowerCase())) {
      merged.push(line);
    }
  }
  return merged.slice(0, 6);
}

export function buildReviewTimeline(
  status: SubmissionStatus,
  hasAi: boolean,
  hasMentorReview: boolean
): TimelineStage[] {
  const stages: TimelineStage[] = [
    { id: "not_started", label: "Not Started", state: "upcoming" },
    { id: "submitted", label: "Submitted", state: "upcoming" },
    { id: "ai", label: "AI Review", state: "upcoming" },
    { id: "mentor", label: "Mentor Review", state: "upcoming" },
    { id: "approved", label: "Approved", state: "upcoming" },
  ];

  const markDoneThrough = (index: number) => {
    for (let i = 0; i <= index; i++) stages[i]!.state = "done";
  };
  const markCurrent = (index: number) => {
    stages[index]!.state = "current";
  };

  if (status === "not_started") {
    markCurrent(0);
  } else if (status === "submitted") {
    markDoneThrough(0);
    markCurrent(1);
  } else if (status === "under_review") {
    markDoneThrough(1);
    if (hasAi) {
      stages[2]!.state = "done";
      markCurrent(3);
    } else {
      markCurrent(2);
    }
  } else if (status === "revision_required") {
    markDoneThrough(2);
    stages[3]!.state = "done";
    markCurrent(1);
  } else if (status === "approved") {
    markDoneThrough(4);
  }

  if (hasMentorReview && status !== "approved" && status !== "not_started") {
    stages[3]!.state = status === "revision_required" ? "done" : stages[3]!.state;
  }

  return stages;
}

function buildImplementationSteps(
  lessons: Lesson[],
  completedIds: Set<string>,
  status: SubmissionStatus
): ChecklistStep[] {
  const steps: ChecklistStep[] = lessons.map((lesson) => {
    const done = completedIds.has(lesson.id);
    return {
      id: lesson.id,
      label: lesson.title.startsWith("Watch") || lesson.title.startsWith("Read")
        ? lesson.title
        : `Complete: ${lesson.title}`,
      status: done ? "completed" : "upcoming",
    };
  });

  const lessonsDone =
    lessons.length === 0 || lessons.every((l) => completedIds.has(l.id));

  steps.push({
    id: "prepare",
    label: "Prepare your documents",
    status: lessonsDone
      ? status === "not_started" || status === "revision_required"
        ? "current"
        : "completed"
      : "upcoming",
  });

  const submitted =
    status === "submitted" ||
    status === "under_review" ||
    status === "approved" ||
    status === "revision_required";

  steps.push({
    id: "upload",
    label: "Upload documents",
    status: submitted
      ? "completed"
      : lessonsDone
        ? "current"
        : "upcoming",
  });

  steps.push({
    id: "submit",
    label: "Submit task",
    status:
      status === "submitted" ||
      status === "under_review" ||
      status === "approved"
        ? "completed"
        : status === "revision_required"
          ? "current"
          : submitted
            ? "completed"
            : "upcoming",
  });

  steps.push({
    id: "mentor",
    label: "Mentor approval",
    status:
      status === "approved"
        ? "completed"
        : status === "under_review" || status === "submitted"
          ? "current"
          : "upcoming",
  });

  // Ensure only one current
  let seenCurrent = false;
  for (const step of steps) {
    if (step.status === "current") {
      if (seenCurrent) step.status = "upcoming";
      else seenCurrent = true;
    }
  }
  if (!seenCurrent) {
    const firstUpcoming = steps.find((s) => s.status === "upcoming");
    if (firstUpcoming && status !== "approved") firstUpcoming.status = "current";
  }

  return steps;
}

export async function getTasksHubData(
  userId: string,
  profileName: string,
  premium: boolean
): Promise<TasksHubData> {
  const dashboard = await getDashboardData(userId, profileName, premium);
  const course = await getPublishedCourse();

  const empty: TasksHubData = {
    stats: { pending: 0, underReview: 0, completed: 0, total: 0 },
    current: null,
    completed: [],
    allTasks: [],
  };

  if (!course) return empty;

  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
  ]);

  const ordered = [...roadmap].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const allTasks: HubTaskItem[] = [];

  for (const ms of ordered) {
    const [task, unlocked] = await Promise.all([
      getTaskByMilestoneId(ms.id),
      isMilestoneUnlocked(userId, ms.id),
    ]);
    if (!task) continue;

    const submission = await getSubmissionForTask(task.id, userId);
    const status = (submission?.status ?? "not_started") as SubmissionStatus;
    const latestReview = submission?.reviews?.[0] ?? null;

    allTasks.push({
      milestoneId: ms.id,
      milestoneTitle: ms.title,
      task,
      status,
      unlocked,
      submittedAt: submission?.submitted_at ?? null,
      reviewedAt: latestReview?.reviewed_at ?? null,
    });
  }

  let pending = 0;
  let underReview = 0;
  let completed = 0;
  for (const item of allTasks) {
    if (item.status === "approved") completed++;
    else if (
      item.status === "submitted" ||
      item.status === "under_review"
    ) {
      underReview++;
    } else if (
      item.unlocked &&
      (item.status === "not_started" || item.status === "revision_required")
    ) {
      pending++;
    }
  }

  const completedItems = allTasks.filter((t) => t.status === "approved");

  const currentItem =
    allTasks.find((t) => t.milestoneId === dashboard.currentMilestoneId) ??
    allTasks.find(
      (t) =>
        t.unlocked &&
        (t.status === "not_started" || t.status === "revision_required")
    ) ??
    allTasks.find((t) => t.unlocked && t.status !== "approved") ??
    null;

  if (!currentItem) {
    return {
      stats: {
        pending,
        underReview,
        completed,
        total: allTasks.length,
      },
      current: null,
      completed: completedItems,
      allTasks,
    };
  }

  const ms = ordered.find((m) => m.id === currentItem.milestoneId)!;
  const lessons = orderedLessons(ms.modules);
  const remaining = lessons.filter((l) => !completedIds.has(l.id));
  const seconds = remaining.reduce(
    (sum, l) => sum + (l.duration_seconds ?? 0),
    0
  );
  const estimatedTimeLabel =
    formatDuration(seconds) ??
    (remaining.length === 0
      ? "Ready to submit"
      : remaining.length === 1
        ? "1 lesson left"
        : `${remaining.length} lessons left`);

  const submission = await getSubmissionForTask(
    currentItem.task.id,
    userId
  );
  const hasAiNotes = Boolean(submission?.ai_notes || submission?.ai_score != null);
  const hasMentorReview = Boolean(submission?.reviews?.[0]);
  const canSubmit =
    currentItem.unlocked &&
    (currentItem.status === "not_started" ||
      currentItem.status === "revision_required");

  const firstIncomplete = remaining[0];
  const lessonHref = firstIncomplete
    ? `/lessons/${firstIncomplete.id}`
    : `/tasks/${currentItem.milestoneId}`;

  const taskPrompts = [
    `Explain this task: ${currentItem.task.title}`,
    "Show an example submission for this milestone",
    "What should I include before I submit?",
    "Check if anything is missing from my approach",
    ...promptsForStage(currentItem.milestoneTitle).slice(0, 2),
  ];

  return {
    stats: {
      pending,
      underReview,
      completed,
      total: allTasks.length,
    },
    current: {
      milestoneId: currentItem.milestoneId,
      milestoneTitle: currentItem.milestoneTitle,
      task: currentItem.task,
      status: currentItem.status,
      unlocked: currentItem.unlocked,
      canSubmit,
      estimatedTimeLabel,
      formatsLabel: formatsLabel(currentItem.task.accepted_formats),
      unlockReward: dashboard.unlocksLabel,
      objective:
        currentItem.task.description?.trim() ||
        `Complete the ${currentItem.milestoneTitle} deliverable and submit it for mentor review.`,
      whyThisMatters: `Finishing this task unlocks ${dashboard.unlocksLabel} and keeps your Amazon launch path moving.`,
      requirements: requirementsFromTask(currentItem.task),
      lessonHref,
      implementationSteps: buildImplementationSteps(
        lessons,
        completedIds,
        currentItem.status
      ),
      timeline: buildReviewTimeline(
        currentItem.status,
        hasAiNotes,
        hasMentorReview
      ),
      aiPrompts: taskPrompts.slice(0, 5),
      hasAiNotes,
      hasMentorReview,
    },
    completed: completedItems,
    allTasks,
  };
}
