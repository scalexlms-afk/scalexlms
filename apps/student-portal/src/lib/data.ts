import { createClient, createServiceClient } from "@scalex/db/server";
import type {
  Course,
  Milestone,
  Module,
  Lesson,
  Enrollment,
  Announcement,
} from "@scalex/db/types";

export type SubmissionStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "revision_required";

export type CommunityChannel =
  | "announcements"
  | "product_hunting"
  | "supplier_help"
  | "ppc_discussion"
  | "questions"
  | "student_wins";

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  accepted_formats: string[];
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

export interface LiveSession {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  host_id: string;
  meeting_url: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  channel: CommunityChannel;
  author_id: string;
  content: string;
  status: "pending_approval" | "approved" | "rejected";
  like_count: number;
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    avatar_url?: string | null;
    plan?: string | null;
    level?: string | null;
  } | null;
  comments?: CommunityComment[];
  liked_by_user?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string | null;
  } | null;
}

export const COMMUNITY_CHANNELS: { key: CommunityChannel; label: string }[] = [
  { key: "announcements", label: "Announcements" },
  { key: "product_hunting", label: "Product Hunting" },
  { key: "supplier_help", label: "Supplier Help" },
  { key: "ppc_discussion", label: "PPC Discussion" },
  { key: "questions", label: "Questions" },
  { key: "student_wins", label: "Student Wins" },
];

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

export async function getPublishedCourse(): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data;
}

export async function getCourseWithRoadmap(courseId: string) {
  const supabase = await createClient();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*, modules(*, lessons(*))")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  return (milestones ?? []) as (Milestone & {
    modules: (Module & { lessons: Lesson[] })[];
  })[];
}

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

export async function getTaskByMilestoneId(
  milestoneId: string
): Promise<Task | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("milestone_id", milestoneId)
    .maybeSingle();
  return data as Task | null;
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
  channel: CommunityChannel,
  userId: string,
  limit = 20,
  before?: string
): Promise<CommunityPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("community_posts")
    .select(
      "*, profiles:author_id(name, avatar_url, plan, level)"
    )
    .eq("channel", channel)
    .or(`status.eq.approved,author_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: posts } = await query;

  if (!posts || posts.length === 0) return [];

  const postIds = (posts as CommunityPost[]).map((p) => p.id);

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase
      .from("comments")
      .select("*, profiles:author_id(name, avatar_url)")
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

  return (posts as CommunityPost[]).map((post) => ({
    ...post,
    media_urls: (post as CommunityPost).media_urls ?? [],
    comments: commentsByPost.get(post.id) ?? [],
    liked_by_user: likedPostIds.has(post.id),
  }));
}

export async function getCommunityPost(
  postId: string,
  userId: string
): Promise<CommunityPost | null> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("community_posts")
    .select("*, profiles:author_id(name, avatar_url, plan, level)")
    .eq("id", postId)
    .or(`status.eq.approved,author_id.eq.${userId}`)
    .maybeSingle();

  if (!post) return null;

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase
      .from("comments")
      .select("*, profiles:author_id(name, avatar_url)")
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
