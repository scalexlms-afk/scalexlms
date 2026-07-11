import { createClient } from "@scalex/db/server";
import type { UserRole } from "@scalex/db/types";

// Phase 2 tables are not yet in generated Database types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Phase2Client = { from: (table: string) => any };
async function countPhase2(
  table: string,
  filter: "in" | "eq" | "gt",
  column: string,
  value: string | string[]
): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (filter === "in" && Array.isArray(value)) {
    query = query.in(column, value);
  } else if (filter === "eq" && typeof value === "string") {
    query = query.eq(column, value);
  } else if (filter === "gt" && typeof value === "string") {
    query = query.gt(column, value);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [pendingReviews, communityModeration, upcomingSessions, activeStudents] =
    await Promise.all([
      countPhase2("submissions", "in", "status", [
        "submitted",
        "under_review",
      ]),
      countPhase2("community_posts", "eq", "status", "pending_approval"),
      countPhase2("live_sessions", "gt", "scheduled_at", new Date().toISOString()),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student")
        .eq("status", "active")
        .then(({ count, error }) => (error ? 0 : (count ?? 0))),
    ]);

  return {
    pendingReviews,
    communityModeration,
    upcomingSessions,
    activeStudents,
  };
}

export type PendingSubmission = {
  id: string;
  status: string;
  ai_score: number | null;
  ai_notes: string | null;
  content: Record<string, unknown>;
  submitted_at: string | null;
  student_id: string;
  student: { name: string; email: string; mentor_id: string | null } | null;
  task: {
    title: string;
    milestone: { order_index: number; title: string } | null;
  } | null;
};

export async function getPendingSubmissions(
  userId: string,
  role: UserRole
): Promise<PendingSubmission[]> {
  const supabase = (await createClient()) as Phase2Client;
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      status,
      ai_score,
      ai_notes,
      content,
      submitted_at,
      student_id,
      student:profiles!student_id(name, email, mentor_id),
      task:tasks(title, milestone:milestones(order_index, title))
    `
    )
    .in("status", ["submitted", "under_review"])
    .order("submitted_at", { ascending: true });

  if (error) throw new Error(error.message);

  let submissions = (data ?? []) as PendingSubmission[];

  if (role === "mentor") {
    submissions = submissions.filter((s) => s.student?.mentor_id === userId);
  }

  return submissions;
}

export type PendingPost = {
  id: string;
  channel: string;
  content: string;
  status: string;
  created_at: string;
  author: { name: string; email: string } | null;
};

export async function getPendingCommunityPosts(): Promise<PendingPost[]> {
  const supabase = (await createClient()) as Phase2Client;
  const { data, error } = await supabase
    .from("community_posts")
    .select(
      `
      id,
      channel,
      content,
      status,
      created_at,
      author:profiles!author_id(name, email)
    `
    )
    .eq("status", "pending_approval")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PendingPost[];
}

export type LiveSessionRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  meeting_url: string | null;
  recording_url: string | null;
  created_at: string;
  host: { name: string } | null;
};

export async function getLiveSessions(): Promise<LiveSessionRow[]> {
  const supabase = (await createClient()) as Phase2Client;
  const { data, error } = await supabase
    .from("live_sessions")
    .select(
      `
      id,
      type,
      title,
      description,
      scheduled_at,
      meeting_url,
      recording_url,
      created_at,
      host:profiles!host_id(name)
    `
    )
    .order("scheduled_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as LiveSessionRow[];
}

export type AdminNotification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export async function getAdminNotifications(
  userId: string
): Promise<AdminNotification[]> {
  const supabase = (await createClient()) as Phase2Client;
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminNotification[];
}
