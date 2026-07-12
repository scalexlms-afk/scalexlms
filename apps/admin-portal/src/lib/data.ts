import { createClient } from "@scalex/db/server";
import type {
  LeadStage,
  Profile,
  UserRole,
} from "@scalex/db/types";
import {
  getSalesConvertedStudentIds,
  getServiceDb,
  type AdminScope,
} from "./admin-db";
import { monthKey, monthLabel } from "./format";
import { CHART_COLORS } from "@scalex/ui/tokens";

async function countTable(
  table: "submissions" | "community_posts" | "live_sessions",
  filter?: { column: string; op: "eq" | "in" | "gt"; value: string | string[] }
): Promise<number> {
  const db = getServiceDb();
  let query = db.from(table).select("*", { count: "exact", head: true });

  if (filter) {
    if (filter.op === "in" && Array.isArray(filter.value)) {
      query = query.in(filter.column, filter.value);
    } else if (filter.op === "eq" && typeof filter.value === "string") {
      query = query.eq(filter.column, filter.value);
    } else if (filter.op === "gt" && typeof filter.value === "string") {
      query = query.gt(filter.column, filter.value);
    }
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

function lastSixMonths(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

async function getScopedStudentIds(scope: AdminScope): Promise<string[] | null> {
  if (scope.role === "super_admin" || scope.role === "instructor") {
    return null;
  }
  if (scope.role === "mentor") {
    const db = getServiceDb();
    const { data } = await db
      .from("profiles")
      .select("id")
      .eq("role", "student")
      .eq("mentor_id", scope.userId);
    return (data ?? []).map((row) => row.id);
  }
  if (scope.role === "sales") {
    return getSalesConvertedStudentIds(scope.userId);
  }
  return [];
}

export async function getDashboardStats(scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  const [
    pendingReviews,
    communityModeration,
    upcomingSessions,
    studentsQuery,
    paymentsQuery,
    enrollmentsQuery,
  ] = await Promise.all([
    (async () => {
      let query = db
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .in("status", ["submitted", "under_review"]);
      if (scopedStudentIds) {
        if (scopedStudentIds.length === 0) return 0;
        query = query.in("student_id", scopedStudentIds);
      }
      const { count } = await query;
      return count ?? 0;
    })(),
    (async () => {
      let query = db
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_approval");
      if (scopedStudentIds) {
        if (scopedStudentIds.length === 0) return 0;
        query = query.in("author_id", scopedStudentIds);
      }
      const { count } = await query;
      return count ?? 0;
    })(),
    countTable("live_sessions", {
      column: "scheduled_at",
      op: "gt",
      value: new Date().toISOString(),
    }),
    (async () => {
      let query = db
        .from("profiles")
        .select("id, status, created_at", { count: "exact" })
        .eq("role", "student");
      if (scopedStudentIds) {
        if (scopedStudentIds.length === 0) return { students: [], count: 0 };
        query = query.in("id", scopedStudentIds);
      }
      const { data, count, error } = await query;
      if (error) return { students: [], count: 0 };
      return { students: data ?? [], count: count ?? 0 };
    })(),
    (async () => {
      let query = db
        .from("payments")
        .select("amount, status, paid_at, student_id, created_at")
        .eq("status", "paid");
      if (scopedStudentIds) {
        if (scopedStudentIds.length === 0) return [];
        query = query.in("student_id", scopedStudentIds);
      }
      const { data, error } = await query;
      if (error) return [];
      return data ?? [];
    })(),
    (async () => {
      let query = db.from("enrollments").select("completion_percent, student_id");
      if (scopedStudentIds) {
        if (scopedStudentIds.length === 0) return [];
        query = query.in("student_id", scopedStudentIds);
      }
      const { data, error } = await query;
      if (error) return [];
      return data ?? [];
    })(),
  ]);

  const students = studentsQuery.students;
  const totalStudents = studentsQuery.count;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const totalRevenue = paymentsQuery.reduce((sum, p) => sum + p.amount, 0);
  const completionRate =
    enrollmentsQuery.length > 0
      ? enrollmentsQuery.reduce((sum, e) => sum + e.completion_percent, 0) /
        enrollmentsQuery.length
      : 0;

  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);

  const studentsThisMonth = students.filter(
    (s) => monthKey(new Date(s.created_at)) === thisMonth
  ).length;
  const studentsLastMonth = students.filter(
    (s) => monthKey(new Date(s.created_at)) === lastMonth
  ).length;
  const momGrowth =
    studentsLastMonth > 0
      ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100
      : studentsThisMonth > 0
        ? 100
        : 0;

  return {
    pendingReviews,
    communityModeration,
    upcomingSessions,
    activeStudents,
    totalStudents,
    totalRevenue,
    completionRate,
    momGrowth,
    studentsThisMonth,
  };
}

export async function getRevenueSeries(scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);
  let query = db
    .from("payments")
    .select("amount, paid_at, created_at")
    .eq("status", "paid");

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) {
      return lastSixMonths().map((key) => ({ label: monthLabel(key), value: 0 }));
    }
    query = query.in("student_id", scopedStudentIds);
  }

  const { data, error } = await query;
  if (error) {
    return lastSixMonths().map((key) => ({ label: monthLabel(key), value: 0 }));
  }

  const buckets = new Map(lastSixMonths().map((key) => [key, 0]));
  for (const payment of data ?? []) {
    const date = payment.paid_at ?? payment.created_at;
    const key = monthKey(new Date(date));
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + payment.amount / 100);
    }
  }

  return lastSixMonths().map((key) => ({
    label: monthLabel(key),
    value: Math.round((buckets.get(key) ?? 0) * 100) / 100,
  }));
}

export async function getStudentGrowthSeries(scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);
  let query = db
    .from("profiles")
    .select("created_at")
    .eq("role", "student");

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) {
      return lastSixMonths().map((key) => ({ label: monthLabel(key), value: 0 }));
    }
    query = query.in("id", scopedStudentIds);
  }

  const { data, error } = await query;
  if (error) {
    return lastSixMonths().map((key) => ({ label: monthLabel(key), value: 0 }));
  }

  const buckets = new Map(lastSixMonths().map((key) => [key, 0]));
  for (const student of data ?? []) {
    const key = monthKey(new Date(student.created_at));
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return lastSixMonths().map((key) => ({
    label: monthLabel(key),
    value: buckets.get(key) ?? 0,
  }));
}

export async function getMilestoneCompletionRates(scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  const { data: milestones, error: milestoneError } = await db
    .from("milestones")
    .select("id, title, order_index")
    .order("order_index", { ascending: true });

  if (milestoneError || !milestones?.length) return [];

  const colors = CHART_COLORS;

  const results = [];
  for (const milestone of milestones) {
    const { data: tasks } = await db
      .from("tasks")
      .select("id")
      .eq("milestone_id", milestone.id);

    const taskIds = (tasks ?? []).map((t) => t.id);
    if (taskIds.length === 0) {
      results.push({
        name: milestone.title,
        value: 0,
        color: colors[(milestone.order_index - 1) % colors.length],
      });
      continue;
    }

    let submissionQuery = db
      .from("submissions")
      .select("status, student_id")
      .in("task_id", taskIds);

    if (scopedStudentIds) {
      if (scopedStudentIds.length === 0) {
        results.push({
          name: milestone.title,
          value: 0,
          color: colors[(milestone.order_index - 1) % colors.length],
        });
        continue;
      }
      submissionQuery = submissionQuery.in("student_id", scopedStudentIds);
    }

    const { data: submissions } = await submissionQuery;
    const total = submissions?.length ?? 0;
    const approved =
      submissions?.filter((s) => s.status === "approved").length ?? 0;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

    results.push({
      name: `M${milestone.order_index}`,
      value: rate,
      color: colors[(milestone.order_index - 1) % colors.length],
    });
  }

  return results;
}

export type AiInsight = {
  id: string;
  title: string;
  count: number;
  note: string;
  href: string;
  variant: "pending" | "review" | "not_started";
};

export async function getAiInsights(scope: AdminScope): Promise<AiInsight[]> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);
  const insights: AiInsight[] = [];

  const pendingReviews = await (async () => {
    let query = db
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]);
    if (scopedStudentIds) {
      if (scopedStudentIds.length === 0) return 0;
      query = query.in("student_id", scopedStudentIds);
    }
    const { count } = await query;
    return count ?? 0;
  })();

  let studentsQuery = db
    .from("profiles")
    .select("id, name, updated_at, status")
    .eq("role", "student")
    .eq("status", "active");

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) {
      return [];
    }
    studentsQuery = studentsQuery.in("id", scopedStudentIds);
  }

  const { data: students } = await studentsQuery;
  const inactiveCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const inactiveStudents =
    students?.filter(
      (s) => new Date(s.updated_at).getTime() < inactiveCutoff
    ).length ?? 0;

  let weakStudents = 0;
  if (students?.length) {
    const studentIds = students.map((s) => s.id);
    const { data: enrollments } = await db
      .from("enrollments")
      .select("student_id, completion_percent")
      .in("student_id", studentIds);
    weakStudents =
      enrollments?.filter((e) => e.completion_percent < 25).length ?? 0;
  }

  let paymentRisk = 0;
  let paymentsQuery = db
    .from("payments")
    .select("student_id")
    .in("status", ["pending", "overdue"]);
  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) {
      paymentRisk = 0;
    } else {
      paymentsQuery = paymentsQuery.in("student_id", scopedStudentIds);
      const { data: riskyPayments } = await paymentsQuery;
      paymentRisk = new Set((riskyPayments ?? []).map((p) => p.student_id)).size;
    }
  } else {
    const { data: riskyPayments } = await paymentsQuery;
    paymentRisk = new Set((riskyPayments ?? []).map((p) => p.student_id)).size;
  }

  if (scope.role !== "sales") {
    insights.push({
      id: "pending-reviews",
      title: "Pending Reviews",
      count: pendingReviews,
      note: "Submissions awaiting mentor review",
      href: "/reviews",
      variant: "pending",
    });
  }

  insights.push(
    {
      id: "inactive-students",
      title: "Inactive Students",
      count: inactiveStudents,
      note: "No activity in 14+ days",
      href: "/students",
      variant: "not_started",
    },
    {
      id: "weak-students",
      title: "Weak Performance",
      count: weakStudents,
      note: "Below 25% course completion",
      href: "/students",
      variant: "review",
    },
    {
      id: "payment-risk",
      title: "Payment Risk",
      count: paymentRisk,
      note: "Students with pending/overdue payments",
      href: "/finance",
      variant: "pending",
    }
  );

  return insights;
}

export type StudentRow = Profile & {
  enrollment: { completion_percent: number } | null;
  mentor: { name: string } | null;
};

export async function getStudents(scope: AdminScope): Promise<StudentRow[]> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  let query = db
    .from("profiles")
    .select(
      `
      *,
      enrollment:enrollments(completion_percent),
      mentor:profiles!mentor_id(name)
    `
    )
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) return [];
    query = query.in("id", scopedStudentIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...(row as Profile),
    enrollment: Array.isArray(row.enrollment)
      ? row.enrollment[0] ?? null
      : row.enrollment,
    mentor: row.mentor as { name: string } | null,
  }));
}

export async function getStudentDetail(studentId: string, scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);
  if (scopedStudentIds && !scopedStudentIds.includes(studentId)) {
    throw new Error("Forbidden");
  }

  const { data: student, error } = await db
    .from("profiles")
    .select(
      `
      *,
      mentor:profiles!mentor_id(id, name, email),
      enrollment:enrollments(completion_percent, plan, enrolled_at, course:courses(title))
    `
    )
    .eq("id", studentId)
    .single();

  if (error || !student) throw new Error("Student not found");

  const [payments, submissions, messages, activity] = await Promise.all([
    db
      .from("payments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    db
      .from("submissions")
      .select("id, status, submitted_at, task:tasks(title, milestone:milestones(title))")
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false }),
    db
      .from("messages")
      .select("id, content, created_at, sender:profiles!sender_id(name)")
      .or(`sender_id.eq.${studentId},recipient_id.eq.${studentId}`)
      .order("created_at", { ascending: false })
      .limit(10),
    db
      .from("audit_log")
      .select("id, action, created_at, metadata")
      .eq("target_id", studentId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    student,
    payments: payments.data ?? [],
    submissions: submissions.data ?? [],
    messages: messages.data ?? [],
    activity: activity.data ?? [],
  };
}

export async function getMentors(): Promise<Profile[]> {
  const db = getServiceDb();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("role", "mentor")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export type LeadRow = {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  source: string | null;
  stage: LeadStage;
  notes: string | null;
  created_at: string;
  assigned_sales_id: string | null;
  converted_user_id: string | null;
  sales: { name: string } | null;
};

export async function getLeads(scope: AdminScope): Promise<LeadRow[]> {
  const db = getServiceDb();
  let query = db
    .from("leads")
    .select(
      `
      *,
      sales:profiles!assigned_sales_id(name)
    `
    )
    .order("created_at", { ascending: false });

  if (scope.role === "sales") {
    query = query.eq("assigned_sales_id", scope.userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as LeadRow[];
}

export type PaymentRow = {
  id: string;
  amount: number;
  type: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  student: { name: string; email: string } | null;
};

export async function getPayments(scope: AdminScope): Promise<PaymentRow[]> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  let query = db
    .from("payments")
    .select(
      `
      id, amount, type, status, paid_at, created_at,
      student:profiles!student_id(name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (scope.role === "sales") {
    const convertedIds = await getSalesConvertedStudentIds(scope.userId);
    if (convertedIds.length === 0) return [];
    query = query.in("student_id", convertedIds);
  } else if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) return [];
    query = query.in("student_id", scopedStudentIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as PaymentRow[];
}

export async function getExpenses() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("expenses")
    .select("*, creator:profiles!created_by(name)")
    .order("incurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPaymentPlanSettings() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("payment_plan_settings")
    .select("*")
    .order("plan_key", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContentTree() {
  const db = getServiceDb();
  const { data: courses, error } = await db
    .from("courses")
    .select(
      `
      id, title, description, status,
      milestones(
        id, title, order_index,
        tasks(id, title),
        modules(
          id, title, order_index,
          lessons(id, title, content_type, content_url, content_text, order_index)
        )
      )
    `
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return courses ?? [];
}

export async function getReportsSummary(scope: AdminScope) {
  const [stats, revenueSeries, growthSeries, milestoneRates] = await Promise.all([
    getDashboardStats(scope),
    getRevenueSeries(scope),
    getStudentGrowthSeries(scope),
    getMilestoneCompletionRates(scope),
  ]);

  return { stats, revenueSeries, growthSeries, milestoneRates };
}

export async function getAdminUsers() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("profiles")
    .select("id, name, email, role, status, created_at")
    .neq("role", "student")
    .order("role", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentAuditLogs(limit = 20) {
  const db = getServiceDb();
  const { data, error } = await db
    .from("audit_log")
    .select("id, action, target_type, target_id, created_at, actor:profiles!actor_id(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// --- Phase 2 queries (typed, no casts) ---

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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminNotification[];
}
