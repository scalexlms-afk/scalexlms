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
    // Global moderation queue for all staff who can moderate (matches /community).
    countTable("community_posts", {
      column: "status",
      op: "eq",
      value: "pending_approval",
    }),
    countTable("live_sessions", {
      column: "scheduled_at",
      op: "gt",
      value: new Date().toISOString(),
    }),
    (async () => {
      let query = db
        .from("profiles")
        .select("id, status, plan, created_at", { count: "exact" })
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
  const premiumStudents = students.filter((s) => s.plan === "premium").length;
  const standardStudents = students.filter(
    (s) => s.plan === "standard" || !s.plan
  ).length;
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
    premiumStudents,
    standardStudents,
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
      href:
        scope.role === "sales" || scope.role === "super_admin"
          ? scope.role === "sales"
            ? "/crm"
            : "/finance"
          : "/students",
      variant: "pending",
    }
  );

  return insights;
}

export async function getCrmPipelineCounts(scope: AdminScope) {
  const db = getServiceDb();
  let query = db.from("leads").select("stage");
  if (scope.role === "sales") {
    query = query.eq("assigned_sales_id", scope.userId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("getCrmPipelineCounts:", error.message);
    return [] as { stage: string; count: number }[];
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.stage, (counts.get(row.stage) ?? 0) + 1);
  }
  const order = [
    "new_lead",
    "contacted",
    "interested",
    "demo",
    "payment_pending",
    "enrolled",
  ];
  return order.map((stage) => ({
    stage,
    count: counts.get(stage) ?? 0,
  }));
}

export async function getContentHealthStats() {
  const db = getServiceDb();
  const { data: courses, error } = await db
    .from("courses")
    .select(
      "id, status, milestones(id, modules(id, lessons(id)), tasks(id))"
    );
  if (error) {
    console.error("getContentHealthStats:", error.message);
    return {
      totalCourses: 0,
      published: 0,
      draft: 0,
      lessonCount: 0,
      taskCount: 0,
    };
  }
  let lessonCount = 0;
  let taskCount = 0;
  let published = 0;
  let draft = 0;
  const asArray = <T,>(value: T | T[] | null | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : [];
  for (const course of courses ?? []) {
    if (course.status === "published") published += 1;
    if (course.status === "draft") draft += 1;
    for (const ms of asArray(course.milestones as unknown) as Array<{
      tasks?: unknown;
      modules?: Array<{ lessons?: unknown }> | null;
    }>) {
      taskCount += asArray(ms.tasks as unknown).length;
      for (const mod of asArray(ms.modules)) {
        lessonCount += asArray(mod.lessons as unknown).length;
      }
    }
  }
  return {
    totalCourses: courses?.length ?? 0,
    published,
    draft,
    lessonCount,
    taskCount,
  };
}

export async function getAssignedStudentSummary(scope: AdminScope) {
  const ids = await getScopedStudentIds(scope);
  if (ids === null) {
    // Full academy — return top-line from profiles
    const db = getServiceDb();
    const { count } = await db
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("status", "active");
    return { assignedCount: count ?? 0, atRiskCount: 0 };
  }
  if (ids.length === 0) return { assignedCount: 0, atRiskCount: 0 };

  const db = getServiceDb();
  const { data: enrollments } = await db
    .from("enrollments")
    .select("student_id, completion_percent")
    .in("student_id", ids);
  const atRiskCount =
    enrollments?.filter((e) => e.completion_percent < 25).length ?? 0;
  return { assignedCount: ids.length, atRiskCount };
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

  const [payments, submissions, messages, activity, mentorCalls] =
    await Promise.all([
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
    db
      .from("mentor_calls")
      .select(
        "id, scheduled_at, duration_minutes, notes, status, mentor:profiles!mentor_id(name)"
      )
      .eq("student_id", studentId)
      .order("scheduled_at", { ascending: false })
      .limit(20),
  ]);

  return {
    student,
    payments: payments.data ?? [],
    submissions: submissions.data ?? [],
    messages: messages.data ?? [],
    activity: activity.data ?? [],
    mentorCalls: mentorCalls.data ?? [],
  };
}

export async function getSupportTickets(scope: AdminScope) {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  let query = db
    .from("support_tickets")
    .select(
      `
      id, subject, body, status, priority, created_at, updated_at, student_id,
      staff_reply, staff_reply_at, staff_replied_by,
      student:profiles!student_id(name, email, plan)
    `
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true });

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) return [];
    query = query.in("student_id", scopedStudentIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getSupportTickets:", error.message);
    return [];
  }
  return data ?? [];
}

export type MentorInboxThread = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  plan: string | null;
  lastMessage: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    fromStudent: boolean;
  } | null;
};

export async function getMentorMessageInbox(
  scope: AdminScope
): Promise<MentorInboxThread[]> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  let studentsQuery = db
    .from("profiles")
    .select("id, name, email, plan")
    .eq("role", "student")
    .eq("plan", "premium")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) return [];
    studentsQuery = studentsQuery.in("id", scopedStudentIds);
  }

  const { data: students, error } = await studentsQuery;
  if (error) {
    console.error("getMentorMessageInbox students:", error.message);
    return [];
  }

  const studentRows = (students ?? []) as {
    id: string;
    name: string;
    email: string;
    plan: string | null;
  }[];
  if (studentRows.length === 0) return [];

  const studentIds = studentRows.map((s) => s.id);

  // Mentors: only threads with themselves. Admins: any messages with these students.
  let messagesQuery = db
    .from("messages")
    .select("id, content, created_at, sender_id, recipient_id")
    .order("created_at", { ascending: false })
    .limit(300);

  if (scope.role === "mentor") {
    messagesQuery = messagesQuery.or(
      `sender_id.eq.${scope.userId},recipient_id.eq.${scope.userId}`
    );
  } else {
    messagesQuery = messagesQuery.or(
      `sender_id.in.(${studentIds.join(",")}),recipient_id.in.(${studentIds.join(",")})`
    );
  }

  const { data: messages, error: msgError } = await messagesQuery;
  if (msgError) {
    console.error("getMentorMessageInbox messages:", msgError.message);
  }

  const rows = (messages ?? []) as {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    recipient_id: string;
  }[];

  return studentRows
    .map((student) => {
      const thread = rows.filter((m) => {
        const involvesStudent =
          m.sender_id === student.id || m.recipient_id === student.id;
        if (!involvesStudent) return false;
        if (scope.role === "mentor") {
          return (
            m.sender_id === scope.userId || m.recipient_id === scope.userId
          );
        }
        return true;
      });
      const last = thread[0] ?? null;
      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        plan: student.plan,
        lastMessage: last
          ? {
              id: last.id,
              content: last.content,
              created_at: last.created_at,
              sender_id: last.sender_id,
              fromStudent: last.sender_id === student.id,
            }
          : null,
      };
    })
    .sort((a, b) => {
      const at = a.lastMessage?.created_at ?? "";
      const bt = b.lastMessage?.created_at ?? "";
      if (at || bt) return bt.localeCompare(at);
      return a.studentName.localeCompare(b.studentName);
    });
}

export async function getConversationWithStudent(
  studentId: string,
  staffId: string,
  limit = 40
) {
  const db = getServiceDb();
  const { data, error } = await db
    .from("messages")
    .select(
      "id, content, created_at, sender_id, recipient_id, sender:profiles!sender_id(name)"
    )
    .or(
      `and(sender_id.eq.${studentId},recipient_id.eq.${staffId}),and(sender_id.eq.${staffId},recipient_id.eq.${studentId})`
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getConversationWithStudent:", error.message);
    return [];
  }
  return data ?? [];
}

/** Resolve which staff id to use for the conversation thread. */
export async function getStudentMentorId(studentId: string) {
  const db = getServiceDb();
  const { data } = await db
    .from("profiles")
    .select("mentor_id")
    .eq("id", studentId)
    .maybeSingle();
  return (data as { mentor_id?: string | null } | null)?.mentor_id ?? null;
}

export async function getActiveStudentsForSessions() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("profiles")
    .select("id, name, email, plan, status")
    .eq("role", "student")
    .eq("status", "active")
    .order("name", { ascending: true });
  if (error) {
    console.error("getActiveStudentsForSessions:", error.message);
    return [];
  }
  return data ?? [];
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
  if (error) {
    console.error("getLeads:", error.message);
    return [];
  }
  return (data ?? []) as LeadRow[];
}

export type PaymentRow = {
  id: string;
  amount: number;
  type: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  student: { name: string; email: string; plan: string | null } | null;
};

export async function getPayments(scope: AdminScope): Promise<PaymentRow[]> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);

  let query = db
    .from("payments")
    .select(
      `
      id, amount, type, status, paid_at, created_at,
      student:profiles!student_id(name, email, plan)
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
  if (error) {
    console.error("getPayments:", error.message);
    return [];
  }
  return (data ?? []) as PaymentRow[];
}

export async function getExpenses() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("expenses")
    .select("*, creator:profiles!created_by(name)")
    .order("incurred_at", { ascending: false });
  if (error) {
    console.error("getExpenses:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPaymentPlanSettings() {
  const db = getServiceDb();
  const { data, error } = await db
    .from("payment_plan_settings")
    .select("*")
    .order("plan_key", { ascending: true });
  if (error) {
    console.error("getPaymentPlanSettings:", error.message);
    return [];
  }
  return data ?? [];
}

export type CourseSummary = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  milestoneCount: number;
  lessonCount: number;
  moduleCount: number;
  taskCount: number;
};

export async function getCoursesSummary(): Promise<CourseSummary[]> {
  const db = getServiceDb();
  const { data: courses, error } = await db
    .from("courses")
    .select(
      `
      id, title, description, status, created_at,
      milestones(
        id,
        tasks(id),
        modules(id, lessons(id))
      )
    `
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const asArray = <T,>(value: T | T[] | null | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : [];

  return (courses ?? []).map((course) => {
    const milestones = asArray(course.milestones as unknown);
    let lessonCount = 0;
    let moduleCount = 0;
    let taskCount = 0;
    for (const ms of milestones as Array<{
      tasks?: { id: string }[] | { id: string } | null;
      modules?: Array<{
        lessons?: { id: string }[] | { id: string } | null;
      }> | null;
    }>) {
      taskCount += asArray(ms.tasks).length;
      const modules = asArray(ms.modules);
      moduleCount += modules.length;
      for (const mod of modules) {
        lessonCount += asArray(mod.lessons).length;
      }
    }
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      status: course.status,
      created_at: course.created_at,
      milestoneCount: milestones.length,
      lessonCount,
      moduleCount,
      taskCount,
    };
  });
}

export type ContentCourse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  milestones: Array<{
    id: string;
    title: string;
    order_index: number;
    tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      accepted_formats: string[];
    }>;
    modules: Array<{
      id: string;
      title: string;
      order_index: number;
      lessons: Array<{
        id: string;
        title: string;
        content_type: string;
        content_url: string | null;
        content_text: string | null;
        order_index: number;
      }>;
    }>;
  }>;
};

export async function getContentTree(courseId?: string): Promise<ContentCourse[]> {
  const db = getServiceDb();
  let query = db
    .from("courses")
    .select(
      `
      id, title, description, status,
      milestones(
        id, title, order_index,
        tasks(id, title, description, accepted_formats),
        modules(
          id, title, order_index,
          lessons(id, title, content_type, content_url, content_text, order_index)
        )
      )
    `
    )
    .order("created_at", { ascending: true });

  if (courseId) {
    query = query.eq("id", courseId);
  }

  const { data: courses, error } = await query;

  if (error) throw new Error(error.message);

  const asArray = <T,>(value: T | T[] | null | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : [];

  return ((courses ?? []) as unknown as Array<Record<string, unknown>>).map(
    (raw) => {
      const milestones = asArray(raw.milestones as unknown).map((msRaw) => {
        const ms = msRaw as Record<string, unknown>;
        return {
          id: ms.id as string,
          title: ms.title as string,
          order_index: ms.order_index as number,
          tasks: asArray(ms.tasks as unknown).map((tRaw) => {
            const t = tRaw as Record<string, unknown>;
            return {
              id: t.id as string,
              title: t.title as string,
              description: (t.description as string | null) ?? null,
              accepted_formats: (t.accepted_formats as string[]) ?? [],
            };
          }),
          modules: asArray(ms.modules as unknown).map((modRaw) => {
            const mod = modRaw as Record<string, unknown>;
            return {
              id: mod.id as string,
              title: mod.title as string,
              order_index: mod.order_index as number,
              lessons: asArray(mod.lessons as unknown).map((lRaw) => {
                const l = lRaw as Record<string, unknown>;
                return {
                  id: l.id as string,
                  title: l.title as string,
                  content_type: l.content_type as string,
                  content_url: (l.content_url as string | null) ?? null,
                  content_text: (l.content_text as string | null) ?? null,
                  order_index: l.order_index as number,
                };
              }),
            };
          }),
        };
      });

      return {
        id: raw.id as string,
        title: raw.title as string,
        description: (raw.description as string | null) ?? null,
        status: raw.status as string,
        milestones,
      } satisfies ContentCourse;
    }
  );
}

export async function getCourseById(courseId: string): Promise<ContentCourse | null> {
  const courses = await getContentTree(courseId);
  return courses[0] ?? null;
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
  if (error) {
    console.error("getAdminUsers:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getRecentAuditLogs(limit = 20) {
  const db = getServiceDb();
  const { data, error } = await db
    .from("audit_log")
    .select("id, action, target_type, target_id, created_at, actor:profiles!actor_id(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getRecentAuditLogs:", error.message);
    return [];
  }
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
  student: {
    name: string;
    email: string;
    mentor_id: string | null;
    plan: string | null;
  } | null;
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
      student:profiles!student_id(name, email, mentor_id, plan),
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

  submissions.sort((a, b) => {
    const aPremium = a.student?.plan === "premium" ? 0 : 1;
    const bPremium = b.student?.plan === "premium" ? 0 : 1;
    if (aPremium !== bPremium) return aPremium - bPremium;
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });

  return submissions;
}

export type CommunityModerationStatus =
  | "pending_approval"
  | "approved"
  | "rejected";

export type CommunityModerationPost = {
  id: string;
  channel: string;
  content: string;
  status: string;
  created_at: string;
  media_urls?: string[] | null;
  author: { name: string; email: string; role?: string } | null;
};

export async function getCommunityPostsByStatus(
  status: CommunityModerationStatus,
  limit = 50
): Promise<CommunityModerationPost[]> {
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
      media_urls,
      author:profiles!author_id(name, email, role)
    `
    )
    .eq("status", status)
    .order("created_at", {
      ascending: status === "pending_approval",
    })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as CommunityModerationPost[];
}

export async function getCommunityModerationStats() {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [pending, approvedWeek] = await Promise.all([
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("created_at", weekAgo),
  ]);
  return {
    pendingCount: pending.count ?? 0,
    postsThisWeek: approvedWeek.count ?? 0,
  };
}

/** @deprecated use getCommunityPostsByStatus('pending_approval') */
export async function getPendingCommunityPosts(): Promise<
  CommunityModerationPost[]
> {
  return getCommunityPostsByStatus("pending_approval");
}

export type PendingPost = CommunityModerationPost;

export type LiveSessionRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  meeting_url: string | null;
  recording_url: string | null;
  created_at: string;
  audience?: string;
  invite_count?: number;
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
      audience,
      host:profiles!host_id(name),
      session_registrations(count)
    `
    )
    .order("scheduled_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<LiveSessionRow & {
    session_registrations?: { count: number }[];
  }>).map((row) => ({
    ...row,
    invite_count: row.session_registrations?.[0]?.count ?? 0,
  }));
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

export type AcademyResourceRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  course_id: string | null;
  file_type: string;
  file_path: string | null;
  file_url: string | null;
  file_size_bytes: number | null;
  visibility: "public" | "private" | "draft";
  download_count: number;
  updated_at: string;
  course?: { title: string } | null;
  updater?: { name: string } | null;
};

export async function getAcademyResources(): Promise<AcademyResourceRow[]> {
  const db = getServiceDb();
  const { data, error } = await db
    .from("academy_resources")
    .select(
      `
      id, title, description, category, course_id, file_type, file_path, file_url,
      file_size_bytes, visibility, download_count, updated_at,
      course:courses(title),
      updater:profiles!updated_by(name)
    `
    )
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("getAcademyResources:", error.message);
    return [];
  }
  return (data ?? []) as unknown as AcademyResourceRow[];
}

export async function getAcademyResourceStats() {
  const rows = await getAcademyResources();
  const totalBytes = rows.reduce((sum, r) => sum + (r.file_size_bytes ?? 0), 0);
  const categories = new Set(rows.map((r) => r.category)).size;
  return {
    total: rows.length,
    publicCount: rows.filter((r) => r.visibility === "public").length,
    privateCount: rows.filter((r) => r.visibility === "private").length,
    draftCount: rows.filter((r) => r.visibility === "draft").length,
    downloads: rows.reduce((sum, r) => sum + r.download_count, 0),
    categories,
    storageBytes: totalBytes,
  };
}

export type KnowledgeArticleRow = {
  id: string;
  title: string;
  body: string;
  category:
    | "guide"
    | "policy"
    | "tutorial"
    | "template"
    | "faq"
    | "case_study";
  course_id: string | null;
  status: "draft" | "published";
  view_count: number;
  updated_at: string;
  course?: { title: string } | null;
  updater?: { name: string } | null;
};

export async function getKnowledgeArticles(): Promise<KnowledgeArticleRow[]> {
  const db = getServiceDb();
  const { data, error } = await db
    .from("ai_knowledge_articles")
    .select(
      `
      id, title, body, category, course_id, status, view_count, updated_at,
      course:courses(title),
      updater:profiles!updated_by(name)
    `
    )
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("getKnowledgeArticles:", error.message);
    return [];
  }
  return (data ?? []) as unknown as KnowledgeArticleRow[];
}

export async function getKnowledgeArticleStats() {
  const rows = await getKnowledgeArticles();
  const published = rows.filter((r) => r.status === "published");
  const latest = rows[0]?.updated_at ?? null;
  const views = rows.reduce((sum, r) => sum + r.view_count, 0);
  const chars = published.reduce((sum, r) => sum + r.body.length, 0);
  return {
    total: rows.length,
    published: published.length,
    draft: rows.length - published.length,
    views,
    lastUpdated: latest,
    approxBytes: chars,
  };
}

export async function getOpenSupportTicketCount(
  scope: AdminScope
): Promise<number> {
  const db = getServiceDb();
  const scopedStudentIds = await getScopedStudentIds(scope);
  let query = db
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "in_progress"]);
  if (scopedStudentIds) {
    if (scopedStudentIds.length === 0) return 0;
    query = query.in("student_id", scopedStudentIds);
  }
  const { count } = await query;
  return count ?? 0;
}

export async function getAiUsageThisMonth(): Promise<number> {
  const db = getServiceDb();
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await db
    .from("ai_chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", start.toISOString());
  return count ?? 0;
}

export async function getCoursesOptions(): Promise<
  { id: string; title: string }[]
> {
  const db = getServiceDb();
  const { data, error } = await db
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });
  if (error) return [];
  return data ?? [];
}
