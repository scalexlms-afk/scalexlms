import { LEVEL_LABELS, type StudentLevel } from "@scalex/db";
import type { Lesson } from "@scalex/db/types";
import { getDashboardData, type DashboardMilestone } from "@/lib/dashboard";
import {
  ensureEnrollment,
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getEnrollment,
  getPublishedCourse,
  getSubmissionForTask,
  getTasksByMilestoneId,
  type Badge,
} from "@/lib/data";

export type AchievementCategory =
  | "all"
  | "business_setup"
  | "product_research"
  | "supplier_sourcing"
  | "brand_listing"
  | "launch_sales"
  | "scaling";

export type AchievementState = "completed" | "in_progress" | "locked";

export type AchievementItem = {
  id: string;
  key: string;
  title: string;
  description: string;
  category: Exclude<AchievementCategory, "all">;
  state: AchievementState;
  progressPercent: number;
  earnedAt: string | null;
  requirement: string;
  whyItMatters: string;
  reward: string;
  estimatedTimeLabel: string;
  milestoneId: string | null;
  milestoneOrder: number | null;
  href: string;
};

export type AchievementsStats = {
  levelLabel: string;
  levelNumber: number;
  businessProgressPercent: number;
  unlockedCount: number;
  totalAchievements: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  certificatesEarned: number;
  certificatesTotal: number;
};

export type AchievementsHubData = {
  stats: AchievementsStats;
  achievements: AchievementItem[];
  nextAchievement: AchievementItem | null;
  defaultSelectedId: string;
  journeyMilestones: DashboardMilestone[];
  continueHref: string;
  categories: { id: AchievementCategory; label: string }[];
};

const LEVEL_ORDER: StudentLevel[] = [
  "beginner_seller",
  "research_expert",
  "brand_builder",
  "amazon_launcher",
];

const CATEGORIES: { id: AchievementCategory; label: string }[] = [
  { id: "all", label: "Achievements" },
  { id: "business_setup", label: "Business Setup" },
  { id: "product_research", label: "Product Research" },
  { id: "supplier_sourcing", label: "Supplier & Sourcing" },
  { id: "brand_listing", label: "Brand & Listing" },
  { id: "launch_sales", label: "Launch & Sales" },
  { id: "scaling", label: "Scaling" },
];

/** Special badge key overlays for milestones 4 / 5 / 7 (1-based order_index). */
const SPECIAL_BADGE_BY_ORDER: Record<number, string> = {
  4: "product_found",
  5: "supplier_selected",
  7: "first_sale",
};

const SPECIAL_TITLES: Record<string, string> = {
  product_found: "Product Found",
  supplier_selected: "Supplier Selected",
  first_sale: "First Sale",
};

function categoryForOrder(
  order: number
): Exclude<AchievementCategory, "all"> {
  if (order <= 2) return "business_setup";
  if (order <= 4) return "product_research";
  if (order === 5) return "supplier_sourcing";
  if (order === 6) return "brand_listing";
  if (order === 7) return "launch_sales";
  return "scaling";
}

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

function levelNumber(level: string | null | undefined): number {
  const idx = LEVEL_ORDER.indexOf(level as StudentLevel);
  return idx >= 0 ? idx + 1 : 1;
}

function lessonProgress(
  lessons: Lesson[],
  completedIds: Set<string>
): number {
  if (lessons.length === 0) return 0;
  const done = lessons.filter((l) => completedIds.has(l.id)).length;
  return Math.round((done / lessons.length) * 100);
}

export async function getAchievementsHubData(
  userId: string,
  profileName: string,
  premium: boolean,
  level: string | null
): Promise<AchievementsHubData> {
  const dashboard = await getDashboardData(userId, profileName, premium);
  const course = await getPublishedCourse();

  const empty: AchievementsHubData = {
    stats: {
      levelLabel: LEVEL_LABELS[level ?? "beginner_seller"] ?? "Beginner Seller",
      levelNumber: levelNumber(level),
      businessProgressPercent: dashboard.completionPercent,
      unlockedCount: 0,
      totalAchievements: 0,
      milestonesCompleted: 0,
      milestonesTotal: Math.max(dashboard.milestones.length, 8),
      certificatesEarned: 0,
      certificatesTotal: 1,
    },
    achievements: [],
    nextAchievement: null,
    defaultSelectedId: "",
    journeyMilestones: dashboard.milestones,
    continueHref: dashboard.continueHref || "/continue-learning",
    categories: CATEGORIES,
  };

  if (!course) return empty;

  await ensureEnrollment(userId, course.id);
  const [roadmap, completedIds, enrollment] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
    getEnrollment(userId, course.id),
  ]);

  const badgeByKey = new Map<string, Badge>(
    dashboard.badges.map((b) => [b.key, b])
  );
  const ordered = [...roadmap].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const achievements: AchievementItem[] = [];

  // Journey Started
  const journeyEarned = Boolean(enrollment);
  achievements.push({
    id: "journey_started",
    key: "journey_started",
    title: "Journey Started",
    description:
      "You’re enrolled in ScaleX LaunchPad and ready to build your Amazon brand.",
    category: "business_setup",
    state: journeyEarned ? "completed" : "locked",
    progressPercent: journeyEarned ? 100 : 0,
    earnedAt: enrollment?.enrolled_at ?? null,
    requirement: "Complete enrollment and activate your account",
    whyItMatters:
      "Enrollment unlocks your roadmap, lessons, and mentor support.",
    reward: "Access to Foundation milestone",
    estimatedTimeLabel: "—",
    milestoneId: null,
    milestoneOrder: null,
    href: "/continue-learning",
  });

  let milestonesApproved = 0;

  for (let i = 0; i < ordered.length; i++) {
    const ms = ordered[i]!;
    const order = ms.order_index ?? i + 1;
    const specialKey = SPECIAL_BADGE_BY_ORDER[order] ?? null;
    const catalogKey = specialKey ?? `milestone_${order}`;
    const lessons = orderedLessons(ms.modules);
    const tasks = await getTasksByMilestoneId(ms.id);
    const task = tasks[0] ?? null;
    const submission = task
      ? await getSubmissionForTask(task.id, userId)
      : null;
    const approved = submission?.status === "approved";
    const badge = specialKey ? badgeByKey.get(specialKey) : null;
    const milestoneBadge = badgeByKey.get(`milestone_${order}`);
    const completed = approved || Boolean(badge) || Boolean(milestoneBadge);
    if (approved) milestonesApproved++;

    const progressFromLessons = lessonProgress(lessons, completedIds);
    const isCurrent = ms.id === dashboard.currentMilestoneId;
    let state: AchievementState = "locked";
    let progressPercent = 0;

    if (completed) {
      state = "completed";
      progressPercent = 100;
    } else if (isCurrent) {
      state = "in_progress";
      progressPercent = Math.max(
        progressFromLessons,
        submission && submission.status !== "not_started" ? 50 : 0
      );
    } else if (progressFromLessons > 0) {
      state = "in_progress";
      progressPercent = progressFromLessons;
    }

    const nextMs = ordered[i + 1];
    const remaining = lessons.filter((l) => !completedIds.has(l.id));
    const seconds = remaining.reduce(
      (sum, l) => sum + (l.duration_seconds ?? 0),
      0
    );
    const estimatedTimeLabel =
      formatDuration(seconds) ??
      (remaining.length === 0
        ? completed
          ? "Complete"
          : "Ready to submit"
        : remaining.length === 1
          ? "1 lesson left"
          : `${remaining.length} lessons left`);

    const title =
      (specialKey && SPECIAL_TITLES[specialKey]) ||
      ms.title ||
      `Milestone ${order}`;

    const reviewDate = submission?.reviews?.[0]?.reviewed_at ?? null;

    achievements.push({
      id: catalogKey,
      key: catalogKey,
      title,
      description:
        task?.description?.trim() ||
        `Complete the ${ms.title} milestone and get mentor approval on your deliverable.`,
      category: categoryForOrder(order),
      state,
      progressPercent,
      earnedAt: completed
        ? badge?.earned_at ??
          milestoneBadge?.earned_at ??
          reviewDate ??
          submission?.submitted_at ??
          null
        : null,
      requirement: task
        ? `Submit: ${task.title}`
        : `Complete ${ms.title} lessons`,
      whyItMatters: `Finishing ${ms.title} keeps your Amazon launch path moving and unlocks what’s next.`,
      reward: nextMs ? `Unlock ${nextMs.title}` : "Program complete",
      estimatedTimeLabel,
      milestoneId: ms.id,
      milestoneOrder: order,
      href: task ? `/tasks/${task.id}` : `/continue-learning`,
    });
  }

  // Prefer a single in_progress: current journey milestone, else first incomplete
  const preferred =
    achievements.find(
      (a) =>
        a.milestoneId === dashboard.currentMilestoneId &&
        a.state !== "completed"
    ) ??
    achievements.find((a) => a.state === "in_progress") ??
    achievements.find((a) => a.state === "locked" && a.key !== "journey_started");

  for (const a of achievements) {
    if (a.state === "completed") continue;
    if (preferred && a.id === preferred.id) {
      a.state = "in_progress";
      if (a.progressPercent === 0) a.progressPercent = 5;
    } else if (a.state === "in_progress") {
      a.state = "locked";
    }
  }

  const unlockedCount = achievements.filter(
    (a) => a.state === "completed"
  ).length;

  const nextAchievement =
    achievements.find((a) => a.state === "in_progress") ??
    achievements.find((a) => a.state === "locked") ??
    null;

  const defaultSelectedId =
    nextAchievement?.id ?? achievements[0]?.id ?? "";

  return {
    stats: {
      levelLabel:
        LEVEL_LABELS[level ?? "beginner_seller"] ?? "Beginner Seller",
      levelNumber: levelNumber(level),
      businessProgressPercent: dashboard.completionPercent,
      unlockedCount,
      totalAchievements: achievements.length,
      milestonesCompleted: milestonesApproved,
      milestonesTotal: Math.max(ordered.length, 1),
      certificatesEarned: 0,
      certificatesTotal: 1,
    },
    achievements,
    nextAchievement,
    defaultSelectedId,
    journeyMilestones: dashboard.milestones,
    continueHref:
      dashboard.continueHref === "/roadmap"
        ? "/continue-learning"
        : dashboard.continueHref || "/continue-learning",
    categories: CATEGORIES,
  };
}
