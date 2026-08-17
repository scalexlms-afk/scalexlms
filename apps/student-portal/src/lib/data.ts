import { cache } from "react";
import { createClient, createServiceClient } from "@scalex/db/server";
import type {
  Course,
  Milestone,
  Module,
  Lesson,
  Enrollment,
  Announcement,
} from "@scalex/db/types";

import type {
  CommunityChannel,
  CommunityComment,
  CommunityPost,
  LiveSession,
} from "@/lib/community-shared";
export type {
  CommunityChannel,
  CommunityComment,
  CommunityPost,
  LiveSession,
} from "@/lib/community-shared";
export { COMMUNITY_CHANNELS } from "@/lib/community-shared";

export type SubmissionStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "revision_required";

export interface Task {
  id: string;
  lesson_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  accepted_formats: string[];
  is_required?: boolean;
  review_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  task_id: string;
  student_id: string;
  content: Record<string, unknown>;
  status: SubmissionStatus;
  ai_score: number | null;
  ai_notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  decision: "approved" | "revision_required";
  feedback: string | null;
  reviewed_at: string;
  created_at: string;
}

export interface Badge {
  id: string;
  key: string;
  student_id: string;
  earned_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export async function isMilestoneUnlocked(
  studentId: string,
  milestoneId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "is_milestone_unlocked" as never,
    {
      p_student_id: studentId,
      p_milestone_id: milestoneId,
    } as never
  );

  if (error) throw new Error(error.message);
  return data === true;
}

export const getPublishedCourse = cache(async (): Promise<Course | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data;
});

export const getCourseWithRoadmap = cache(async (courseId: string) => {
  const supabase = await createClient();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*, modules(*, lessons(*))")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  return (milestones ?? []) as (Milestone & {
    modules: (Module & { lessons: Lesson[] })[];
  })[];
});

export async function getEnrollment(studentId: string, courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data as Enrollment | null;
}

export async function ensureEnrollment(studentId: string, courseId: string) {
  const existing = await getEnrollment(studentId, courseId);
  if (existing) return existing;

  // Prefer the caller's session for plan lookup; insert with service role so
  // admin-activated / test students without a paid payment row can enroll.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", studentId)
    .maybeSingle();
  const plan =
    (profile as { plan?: string | null } | null)?.plan === "premium"
      ? "premium"
      : "standard";

  const service = createServiceClient();
  const { data, error } = await service
    .from("enrollments")
    .upsert(
      { student_id: studentId, course_id: courseId, plan } as never,
      { onConflict: "student_id,course_id" }
    )
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Enrollment failed");
  return data as Enrollment;
}

export async function getCompletedLessonIds(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_completions")
    .select("lesson_id")
    .eq("student_id", studentId);
  return new Set(
    (data ?? []).map((r) => (r as { lesson_id: string }).lesson_id)
  );
}

const PROGRAM_ACCESS_MONTHS = 12;

export type StudentJourneySummary = {
  currentStage: string;
  currentMilestoneId: string | null;
  /** 1-based milestone step in the 8-milestone roadmap */
  milestoneIndex: number;
  milestoneTotal: number;
  completionPercent: number;
  continueHref: string;
  enrolledAt: string | null;
  monthsRemaining: number | null;
  /** 0–100 elapsed share of the 12-month program window */
  accessElapsedPercent: number;
};

function computeProgramAccess(enrolledAt: string | null): {
  monthsRemaining: number | null;
  accessElapsedPercent: number;
} {
  if (!enrolledAt) {
    return { monthsRemaining: null, accessElapsedPercent: 0 };
  }

  const start = new Date(enrolledAt).getTime();
  if (Number.isNaN(start)) {
    return { monthsRemaining: null, accessElapsedPercent: 0 };
  }

  const end = start + PROGRAM_ACCESS_MONTHS * 30.44 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const total = Math.max(1, end - start);
  const elapsed = Math.min(total, Math.max(0, now - start));
  const remainingMs = Math.max(0, end - now);
  const monthsRemaining = Math.max(
    0,
    Math.ceil(remainingMs / (30.44 * 24 * 60 * 60 * 1000))
  );

  return {
    monthsRemaining,
    accessElapsedPercent: Math.round((elapsed / total) * 100),
  };
}

export const getSidebarProgress = cache(
  async (
    studentId: string
  ): Promise<{
    completionPercent: number;
    milestoneIndex: number;
    milestoneTotal: number;
  }> => {
    const empty = {
      completionPercent: 0,
      milestoneIndex: 1,
      milestoneTotal: 8,
    };
    const course = await getPublishedCourse();
    if (!course) return empty;

    const supabase = await createClient();
    const [enrollment, milestoneCount] = await Promise.all([
      getEnrollment(studentId, course.id),
      supabase
        .from("milestones")
        .select("id", { count: "exact", head: true })
        .eq("course_id", course.id),
    ]);

    const milestoneTotal = Math.max(1, milestoneCount.count ?? 8);
    const completionPercent = enrollment?.completion_percent ?? 0;
    const milestoneIndex = Math.min(
      milestoneTotal,
      Math.max(1, Math.ceil((completionPercent / 100) * milestoneTotal) || 1)
    );

    return { completionPercent, milestoneIndex, milestoneTotal };
  }
);

/** Sidebar / continue-learning journey rollup for the student portal. */
export const getStudentJourneySummary = cache(
  async (studentId: string): Promise<StudentJourneySummary> => {
  const course = await getPublishedCourse();
  const empty: StudentJourneySummary = {
    currentStage: "Foundation",
    currentMilestoneId: null,
    milestoneIndex: 1,
    milestoneTotal: 8,
    completionPercent: 0,
    continueHref: "/roadmap",
    enrolledAt: null,
    monthsRemaining: null,
    accessElapsedPercent: 0,
  };

  if (!course) return empty;

  const enrollment = await getEnrollment(studentId, course.id);
  const access = computeProgramAccess(enrollment?.enrolled_at ?? null);

  if (!enrollment) {
    return { ...empty, ...access };
  }

  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(studentId),
  ]);

  const milestoneTotal = Math.max(1, roadmap.length || 8);
  const currentMilestone =
    roadmap.find((ms) => {
      const lessons = ms.modules.flatMap((m) => m.lessons);
      return lessons.some((l) => !completedIds.has(l.id));
    }) ?? roadmap[roadmap.length - 1];

  if (!currentMilestone) {
    return {
      ...empty,
      milestoneTotal,
      completionPercent: enrollment.completion_percent,
      enrolledAt: enrollment.enrolled_at,
      ...access,
    };
  }

  const milestoneIndexRaw =
    roadmap.findIndex((ms) => ms.id === currentMilestone.id) + 1;
  const milestoneIndex = milestoneIndexRaw > 0 ? milestoneIndexRaw : 1;

  let continueHref = "/roadmap";
  const orderedLessons = [...currentMilestone.modules]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap((m) =>
      [...m.lessons].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      )
    );
  const nextLesson = orderedLessons.find((l) => !completedIds.has(l.id));
  if (nextLesson) {
    continueHref = `/lessons/${nextLesson.id}`;
  } else {
    const tasks = await getTasksByMilestoneId(currentMilestone.id);
    const task = tasks[0] ?? null;
    if (task) continueHref = `/tasks/${task.id}`;
  }

  return {
    currentStage: currentMilestone.title,
    currentMilestoneId: currentMilestone.id,
    milestoneIndex,
    milestoneTotal,
    completionPercent: enrollment.completion_percent,
    continueHref,
    enrolledAt: enrollment.enrolled_at,
    monthsRemaining: access.monthsRemaining,
    accessElapsedPercent: access.accessElapsedPercent,
  };
});

export async function getAnnouncements(limit = 5): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Announcement[];
}

export async function getLessonById(lessonId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*, modules(*, milestones(*, courses(*)))")
    .eq("id", lessonId)
    .single();
  return data as
    | (Lesson & {
        modules: Module & {
          milestones: Milestone & { courses: Course };
        };
      })
    | null;
}

export type StudentQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export type StudentLessonQuiz = {
  id: string;
  title: string;
  pass_percent: number;
  questions: StudentQuizQuestion[];
};

/** Quiz meta + questions for the student player (correct_index stripped). */
export async function getLessonQuizForStudent(
  lessonId: string
): Promise<StudentLessonQuiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, title, pass_percent, quiz_questions(id, prompt, options, order_index)"
    )
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as {
    id: string;
    title: string;
    pass_percent: number;
    quiz_questions?:
      | {
          id: string;
          prompt: string;
          options: unknown;
          order_index: number;
        }[]
      | null;
  };

  const questions = (row.quiz_questions ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: Array.isArray(q.options)
        ? q.options.map((o) => String(o))
        : [],
    }));

  return {
    id: row.id,
    title: row.title,
    pass_percent: Number(row.pass_percent),
    questions,
  };
}

export async function getTasksByLessonId(lessonId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Task[];
}

export type PaymentPlanSettings = {
  id: string;
  plan_key: string;
  plan_type: "standard" | "premium";
  total_cents: number;
  first_payment_percent: number;
  remaining_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPaymentPlan() {
  return getPaymentPlanByType("standard");
}

export async function getPaymentPlanByType(
  planType: "standard" | "premium" = "standard"
): Promise<PaymentPlanSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_plan_settings")
    .select("*")
    .eq("is_active", true)
    .eq("plan_type", planType)
    .limit(1)
    .maybeSingle();

  if (data) return data as PaymentPlanSettings;

  // Fallback if plan_type column is not yet available in older environments.
  const { data: fallback } = await supabase
    .from("payment_plan_settings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (fallback as PaymentPlanSettings | null) ?? null;
}

export async function getTasksByMilestoneId(
  milestoneId: string
): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("milestone_id", milestoneId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Task[];
}

export async function getTasksByMilestoneIds(
  milestoneIds: string[]
): Promise<Task[]> {
  if (milestoneIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .in("milestone_id", milestoneIds)
    .order("created_at", { ascending: true });
  return (data ?? []) as Task[];
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  return data as Task | null;
}

export async function getSubmissionsForTasks(
  taskIds: string[],
  studentId: string
): Promise<(Submission & { reviews: Review[] })[]> {
  if (taskIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("*, reviews(*)")
    .eq("student_id", studentId)
    .in("task_id", taskIds);

  return ((data ?? []) as (Submission & { reviews: Review[] })[]).map(
    (row) => ({
      ...row,
      reviews: [...(row.reviews ?? [])].sort((a, b) =>
        a.reviewed_at < b.reviewed_at ? 1 : -1
      ),
    })
  );
}

export async function getSubmissionForTask(
  taskId: string,
  studentId: string
): Promise<(Submission & { reviews: Review[] }) | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("*, reviews(*)")
    .eq("task_id", taskId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!data) return null;

  const row = data as Submission & { reviews: Review[] };
  return {
    ...row,
    reviews: (row.reviews ?? []).sort(
      (a, b) =>
        new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
    ),
  };
}

export async function getStudentBadges(studentId: string): Promise<Badge[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("badges")
    .select("*")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false });
  return (data ?? []) as Badge[];
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

export async function getPendingRemainingPayment(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, amount, status")
    .eq("student_id", studentId)
    .eq("type", "remaining")
    .in("status", ["pending", "overdue"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; amount: number; status: string } | null;
}

export async function getUpcomingSessions(
  studentId: string,
  limit = 10
): Promise<(LiveSession & { registered: boolean })[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: sessions }, { data: registrations }] = await Promise.all([
    supabase
      .from("live_sessions")
      .select("*")
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(limit),
    supabase
      .from("session_registrations")
      .select("session_id")
      .eq("student_id", studentId),
  ]);

  const registeredIds = new Set(
    (registrations ?? []).map(
      (r) => (r as { session_id: string }).session_id
    )
  );

  return ((sessions ?? []) as LiveSession[]).map((session) => ({
    ...session,
    registered: registeredIds.has(session.id),
  }));
}

export async function getRecordedSessions(limit = 10): Promise<LiveSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_sessions")
    .select("*")
    .not("recording_url", "is", null)
    .order("scheduled_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as LiveSession[];
}

export async function getCommunityPosts(
  channel: CommunityChannel | "latest",
  userId: string,
  limit = 20,
  before?: string
): Promise<CommunityPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("community_posts")
    .select(
      "*, profiles:author_id(name, avatar_url, plan, level, role)"
    )
    .or(`status.eq.approved,author_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (channel !== "latest") {
    query = query.eq("channel", channel);
  }

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: posts } = await query;

  if (!posts || posts.length === 0) return [];

  const postIds = (posts as CommunityPost[]).map((p) => p.id);

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase
      .from("comments")
      .select("*, profiles:author_id(name, avatar_url, role)")
      .in("post_id", postIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds)
      .eq("user_id", userId),
  ]);

  const likedPostIds = new Set(
    (likes ?? []).map((l) => (l as { post_id: string }).post_id)
  );

  const commentsByPost = new Map<string, CommunityComment[]>();
  for (const comment of (comments ?? []) as CommunityComment[]) {
    const list = commentsByPost.get(comment.post_id) ?? [];
    list.push(comment);
    commentsByPost.set(comment.post_id, list);
  }

  return (posts as CommunityPost[]).map((post) => {
    const postComments = commentsByPost.get(post.id) ?? [];
    return {
      ...post,
      media_urls: (post as CommunityPost).media_urls ?? [],
      comments: postComments,
      comment_count: postComments.length,
      liked_by_user: likedPostIds.has(post.id),
    };
  });
}

export async function getCommunityPost(
  postId: string,
  userId: string
): Promise<CommunityPost | null> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("community_posts")
    .select("*, profiles:author_id(name, avatar_url, plan, level, role)")
    .eq("id", postId)
    .or(`status.eq.approved,author_id.eq.${userId}`)
    .maybeSingle();

  if (!post) return null;

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase
      .from("comments")
      .select("*, profiles:author_id(name, avatar_url, role)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }),
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    ...(post as CommunityPost),
    media_urls: (post as CommunityPost).media_urls ?? [],
    comments: (comments ?? []) as CommunityComment[],
    liked_by_user: Boolean(likes),
  };
}
