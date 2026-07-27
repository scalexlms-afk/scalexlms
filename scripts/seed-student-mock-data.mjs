/**
 * Seed rich relational mock data for student@scalex.dev (no Storage uploads).
 *
 * Run after ensuring test users exist:
 *   node scripts/seed-test-users.mjs
 *   node scripts/seed-student-mock-data.mjs
 *
 * Or via package script:
 *   pnpm seed:student-mock
 *
 * Idempotent: clears prior mock-tagged / student-owned seed rows for this
 * test account, then re-inserts. Never calls supabase.storage.
 */
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { createClient } = require(
  "../apps/student-portal/node_modules/@supabase/supabase-js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const STUDENT_EMAIL = "student@scalex.dev";
const MENTOR_EMAIL = "mentor@scalex.dev";
const TEST_PASSWORD = "ScaleXTest123!";
const MOCK_MARKER = "[Mock Seed]";
const MOCK_STRIPE_PREFIX = "mock_seed_";

function loadEnv() {
  const paths = [
    resolve(root, "apps/student-portal/.env.local"),
    resolve(root, ".env.local"),
  ];
  const env = {};
  for (const p of paths) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysFromNow(d) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

async function ensureUser({ email, name, role }) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: list } = await supabase.auth.admin.listUsers({
          perPage: 1000,
        });
        const found = list?.users?.find((u) => u.email === email);
        if (!found) throw error;
        userId = found.id;
      } else {
        throw error;
      }
    } else {
      userId = data.user.id;
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name,
      role,
      status: "active",
    })
    .eq("id", userId);

  if (profileError) throw profileError;
  return userId;
}

function assertOk(error, label) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

async function clearPriorMockData(studentId, mentorId) {
  // Invoices cascade from payments with mock stripe ids; also wipe any prior
  // payments for this test student so re-runs stay clean.
  const { data: payments, error: paySelErr } = await supabase
    .from("payments")
    .select("id, stripe_session_id")
    .eq("student_id", studentId);
  assertOk(paySelErr, "list payments");

  const paymentIds = (payments ?? []).map((p) => p.id);
  if (paymentIds.length) {
    const { error } = await supabase
      .from("payments")
      .delete()
      .in("id", paymentIds);
    assertOk(error, "clear payments");
  }

  // Dedicated test account: clear prior seeded notifications by marker / payload.
  const { data: priorNotifs, error: notifSelErr } = await supabase
    .from("notifications")
    .select("id, title, payload")
    .eq("user_id", studentId);
  assertOk(notifSelErr, "list notifications");
  const mockNotifIds = (priorNotifs ?? [])
    .filter((n) => {
      const title = typeof n.title === "string" ? n.title : "";
      const payload =
        n.payload && typeof n.payload === "object" ? n.payload : null;
      return (
        title.includes(MOCK_MARKER) ||
        (payload && payload.seed === "student-mock")
      );
    })
    .map((n) => n.id);
  if (mockNotifIds.length) {
    const { error: notifErr } = await supabase
      .from("notifications")
      .delete()
      .in("id", mockNotifIds);
    assertOk(notifErr, "clear mock notifications");
  }

  // Clear thread between student and mentor (test account only).
  const { error: msgErr1 } = await supabase
    .from("messages")
    .delete()
    .eq("sender_id", studentId)
    .eq("recipient_id", mentorId);
  assertOk(msgErr1, "clear student→mentor messages");

  const { error: msgErr2 } = await supabase
    .from("messages")
    .delete()
    .eq("sender_id", mentorId)
    .eq("recipient_id", studentId);
  assertOk(msgErr2, "clear mentor→student messages");

  const { data: priorTickets, error: ticketSelErr } = await supabase
    .from("support_tickets")
    .select("id, subject")
    .eq("student_id", studentId);
  assertOk(ticketSelErr, "list tickets");
  const mockTicketIds = (priorTickets ?? [])
    .filter((t) => String(t.subject ?? "").includes(MOCK_MARKER))
    .map((t) => t.id);
  if (mockTicketIds.length) {
    const { error: ticketErr } = await supabase
      .from("support_tickets")
      .delete()
      .in("id", mockTicketIds);
    assertOk(ticketErr, "clear mock tickets");
  }

  // Mock announcements (title includes [Mock Seed])
  const { data: mockAnnouncements, error: annSelErr } = await supabase
    .from("announcements")
    .select("id, title")
    .ilike("title", `%${MOCK_MARKER}%`);
  assertOk(annSelErr, "list mock announcements");
  if (mockAnnouncements?.length) {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .in(
        "id",
        mockAnnouncements.map((a) => a.id)
      );
    assertOk(error, "clear mock announcements");
  }

  // Mock community posts (student + mentor) — clear likes/comments first
  const { data: mockPosts, error: postSelErr } = await supabase
    .from("community_posts")
    .select("id, content, author_id")
    .in("author_id", [studentId, mentorId]);
  assertOk(postSelErr, "list posts");
  const postIds = (mockPosts ?? [])
    .filter((p) => String(p.content ?? "").includes(MOCK_MARKER))
    .map((p) => p.id);
  if (postIds.length) {
    const { error: likeErr } = await supabase
      .from("post_likes")
      .delete()
      .in("post_id", postIds);
    assertOk(likeErr, "clear mock post likes");

    const { error: commentErr } = await supabase
      .from("comments")
      .delete()
      .in("post_id", postIds);
    assertOk(commentErr, "clear mock post comments");

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .in("id", postIds);
    assertOk(error, "clear mock community posts");
  }

  const { error: regErr } = await supabase
    .from("session_registrations")
    .delete()
    .eq("student_id", studentId);
  assertOk(regErr, "clear session registrations");

  // Remove mock-hosted live sessions created by this seeder
  const { data: mockSessions, error: mockSessSelErr } = await supabase
    .from("live_sessions")
    .select("id, title")
    .ilike("title", `${MOCK_MARKER}%`);
  assertOk(mockSessSelErr, "list mock live sessions");
  if (mockSessions?.length) {
    const ids = mockSessions.map((s) => s.id);
    await supabase.from("session_registrations").delete().in("session_id", ids);
    const { error } = await supabase.from("live_sessions").delete().in("id", ids);
    assertOk(error, "clear mock live sessions");
  }

  const { error: lcErr } = await supabase
    .from("lesson_completions")
    .delete()
    .eq("student_id", studentId);
  assertOk(lcErr, "clear lesson completions");

  // Reviews for student's submissions, then submissions
  const { data: priorSubs, error: subSelErr } = await supabase
    .from("submissions")
    .select("id")
    .eq("student_id", studentId);
  assertOk(subSelErr, "list submissions for review clear");
  const priorSubIds = (priorSubs ?? []).map((s) => s.id);
  if (priorSubIds.length) {
    const { error: revErr } = await supabase
      .from("reviews")
      .delete()
      .in("submission_id", priorSubIds);
    assertOk(revErr, "clear reviews for student submissions");
  }

  const { error: subErr } = await supabase
    .from("submissions")
    .delete()
    .eq("student_id", studentId);
  assertOk(subErr, "clear submissions");

  const { error: badgeErr } = await supabase
    .from("badges")
    .delete()
    .eq("student_id", studentId)
    .in("key", ["milestone_1", "product_found"]);
  assertOk(badgeErr, "clear mock badges");

  const { data: mockChats, error: chatSelErr } = await supabase
    .from("ai_chats")
    .select("id, title")
    .eq("student_id", studentId);
  assertOk(chatSelErr, "list mock ai chats");
  const chatIds = (mockChats ?? [])
    .filter((c) => String(c.title ?? "").includes(MOCK_MARKER))
    .map((c) => c.id);
  if (chatIds.length) {
    const { error } = await supabase.from("ai_chats").delete().in("id", chatIds);
    assertOk(error, "clear mock ai chats");
  }
}

async function main() {
  const summary = {
    profile: false,
    enrollment: false,
    prefs: false,
    payments: 0,
    invoices: 0,
    notifications: 0,
    messages: 0,
    tickets: 0,
    communityPosts: 0,
    comments: 0,
    postLikes: 0,
    announcements: 0,
    sessionRegs: 0,
    liveSessions: 0,
    lessonCompletions: 0,
    submissions: 0,
    reviews: 0,
    badges: 0,
    aiChats: 0,
    completionPercent: null,
  };

  console.log("Ensuring student + mentor accounts…");
  const studentId = await ensureUser({
    email: STUDENT_EMAIL,
    name: "Test Student",
    role: "student",
  });
  const mentorId = await ensureUser({
    email: MENTOR_EMAIL,
    name: "Mentor",
    role: "mentor",
  });
  console.log(`  student: ${studentId}`);
  console.log(`  mentor:  ${mentorId}`);

  console.log("Clearing prior mock seed rows…");
  await clearPriorMockData(studentId, mentorId);

  // 1) Premium profile (no avatar_url)
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      plan: "premium",
      country: "Pakistan",
      language: "en",
      phone: "+92 300 1234567",
      mentor_id: mentorId,
      level: "beginner_seller",
      current_stage: "Foundation",
      status: "active",
      avatar_url: null,
    })
    .eq("id", studentId);
  assertOk(profileErr, "update profile");
  summary.profile = true;
  console.log("✓ Profile → premium, country/language/phone, mentor linked");

  // 2) Enrollment in published course
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, title")
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  assertOk(courseErr, "fetch course");

  let milestonesForCourse = [];

  if (!course) {
    console.warn("⚠ No published course — skipping enrollment & submissions");
  } else {
    const { error: enrollErr } = await supabase.from("enrollments").upsert(
      {
        student_id: studentId,
        course_id: course.id,
        plan: "premium",
        completion_percent: 0,
      },
      { onConflict: "student_id,course_id" }
    );
    assertOk(enrollErr, "upsert enrollment");
    summary.enrollment = true;
    console.log(`✓ Enrolled in "${course.title}" (premium)`);

    // Lesson completions: ALL of milestone 1 + ~4 of milestone 2
    const { data: msRows, error: msCourseErr } = await supabase
      .from("milestones")
      .select("id, title, order_index")
      .eq("course_id", course.id)
      .order("order_index", { ascending: true });
    assertOk(msCourseErr, "list milestones for completions");
    milestonesForCourse = msRows ?? [];

    const ms1 = milestonesForCourse[0] ?? null;
    const ms2 = milestonesForCourse[1] ?? null;
    const targetMilestoneIds = [ms1?.id, ms2?.id].filter(Boolean);

    let completionLessonIds = [];
    if (targetMilestoneIds.length) {
      const { data: modules, error: modErr } = await supabase
        .from("modules")
        .select("id, order_index, milestone_id")
        .in("milestone_id", targetMilestoneIds)
        .order("order_index", { ascending: true });
      assertOk(modErr, "list modules");

      if (modules?.length) {
        const { data: lessons, error: lesErr } = await supabase
          .from("lessons")
          .select("id, module_id, order_index")
          .in(
            "module_id",
            modules.map((m) => m.id)
          )
          .order("order_index", { ascending: true });
        assertOk(lesErr, "list lessons");

        const moduleById = new Map(modules.map((m) => [m.id, m]));
        const sorted = (lessons ?? []).slice().sort((a, b) => {
          const ma = moduleById.get(a.module_id);
          const mb = moduleById.get(b.module_id);
          const msA =
            milestonesForCourse.find((m) => m.id === ma?.milestone_id)
              ?.order_index ?? 0;
          const msB =
            milestonesForCourse.find((m) => m.id === mb?.milestone_id)
              ?.order_index ?? 0;
          return (
            msA - msB ||
            (ma?.order_index ?? 0) - (mb?.order_index ?? 0) ||
            a.order_index - b.order_index
          );
        });

        const ms1LessonIds = sorted
          .filter((l) => moduleById.get(l.module_id)?.milestone_id === ms1?.id)
          .map((l) => l.id);
        const ms2LessonIds = sorted
          .filter((l) => moduleById.get(l.module_id)?.milestone_id === ms2?.id)
          .map((l) => l.id)
          .slice(0, 4);

        completionLessonIds = [...ms1LessonIds, ...ms2LessonIds];
      }
    }

    if (completionLessonIds.length) {
      const completionRows = completionLessonIds.map((lessonId, i) => ({
        student_id: studentId,
        lesson_id: lessonId,
        completed_at: hoursAgo(72 - i * 4),
      }));
      const { error: lcInsErr } = await supabase
        .from("lesson_completions")
        .upsert(completionRows, { onConflict: "student_id,lesson_id" });
      assertOk(lcInsErr, "insert lesson completions");
      summary.lessonCompletions = completionRows.length;
      console.log(
        `✓ Lesson completions: ${completionRows.length} (all MS1 + up to 4 MS2)`
      );
    } else {
      console.log("⊘ No lessons found — skipped completions");
    }

    // Refresh enrollment completion via RPC (fallback ~45% if permission denied)
    const { error: rpcErr } = await supabase.rpc(
      "refresh_enrollment_completion",
      {
        p_student_id: studentId,
        p_course_id: course.id,
      }
    );
    if (rpcErr) {
      const msg = String(rpcErr.message ?? rpcErr);
      const isPerm =
        /permission|denied|not granted|execute/i.test(msg) ||
        rpcErr.code === "42501";
      if (isPerm) {
        const { error: pctErr } = await supabase
          .from("enrollments")
          .update({ completion_percent: 45 })
          .eq("student_id", studentId)
          .eq("course_id", course.id);
        assertOk(pctErr, "set completion_percent fallback");
        summary.completionPercent = 45;
        console.log(
          `⚠ refresh_enrollment_completion RPC denied — set completion_percent=45`
        );
      } else {
        throw new Error(`refresh_enrollment_completion: ${msg}`);
      }
    } else {
      const { data: enrollRow } = await supabase
        .from("enrollments")
        .select("completion_percent")
        .eq("student_id", studentId)
        .eq("course_id", course.id)
        .maybeSingle();
      summary.completionPercent = enrollRow?.completion_percent ?? null;
      console.log(
        `✓ refresh_enrollment_completion → ${summary.completionPercent}%`
      );
    }
  }

  // 3) Prefs
  const { error: notifPrefErr } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: studentId,
        in_app: true,
        email: true,
        browser: true,
        push: false,
        whatsapp: false,
      },
      { onConflict: "user_id" }
    );
  assertOk(notifPrefErr, "upsert notification_preferences");

  const { error: settingsErr } = await supabase.from("user_settings").upsert(
    {
      user_id: studentId,
      learning: { digestCadence: "weekly", reminderHour: 9 },
    },
    { onConflict: "user_id" }
  );
  assertOk(settingsErr, "upsert user_settings");
  summary.prefs = true;
  console.log("✓ notification_preferences + user_settings.learning");

  // 4) Payments + invoices (pdf_url null)
  const { data: planRow } = await supabase
    .from("payment_plan_settings")
    .select("total_cents, first_payment_percent, remaining_percent")
    .eq("plan_type", "premium")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const totalCents = planRow?.total_cents ?? 199700;
  const firstPct = planRow?.first_payment_percent ?? 70;
  const remPct = planRow?.remaining_percent ?? 30;
  const firstAmount = Math.round((totalCents * firstPct) / 100);
  const remainingAmount = Math.round((totalCents * remPct) / 100);

  const paidAt = hoursAgo(72);
  const { data: paidPayment, error: paidErr } = await supabase
    .from("payments")
    .insert({
      student_id: studentId,
      type: "first_payment",
      amount: firstAmount,
      status: "paid",
      method: "card",
      stripe_session_id: `${MOCK_STRIPE_PREFIX}first_${studentId.slice(0, 8)}`,
      paid_at: paidAt,
    })
    .select("id")
    .single();
  assertOk(paidErr, "insert paid payment");

  const { data: pendingPayment, error: pendErr } = await supabase
    .from("payments")
    .insert({
      student_id: studentId,
      type: "remaining",
      amount: remainingAmount,
      status: "pending",
      method: null,
      stripe_session_id: `${MOCK_STRIPE_PREFIX}remaining_${studentId.slice(0, 8)}`,
      paid_at: null,
    })
    .select("id")
    .single();
  assertOk(pendErr, "insert pending payment");
  summary.payments = 2;

  const invNumber = `INV-MOCK-${Date.now()}`;
  const { error: invErr } = await supabase.from("invoices").insert({
    payment_id: paidPayment.id,
    number: invNumber,
    issued_at: paidAt,
    pdf_url: null,
  });
  assertOk(invErr, "insert invoice");
  summary.invoices = 1;
  console.log(
    `✓ Payments: paid first (${firstAmount}¢) + pending remaining (${remainingAmount}¢); invoice ${invNumber}`
  );

  // 5) Notifications
  const notifications = [
    {
      user_id: studentId,
      type: "submission_review",
      title: `${MOCK_MARKER} Task approved`,
      body: "Your mentor approved Submit Business Plan. Keep going!",
      payload: { seed: "student-mock", href: "/tasks" },
      read_at: null,
      created_at: hoursAgo(2),
    },
    {
      user_id: studentId,
      type: "message",
      title: `${MOCK_MARKER} New mentor message`,
      body: "Your mentor replied in Mentor Chat.",
      payload: { seed: "student-mock", href: "/messages" },
      read_at: null,
      created_at: hoursAgo(5),
    },
    {
      user_id: studentId,
      type: "session_scheduled",
      title: `${MOCK_MARKER} Live class upcoming`,
      body: "Premium Q&A is on the calendar — register if seats remain.",
      payload: { seed: "student-mock", href: "/sessions" },
      read_at: hoursAgo(1),
      created_at: hoursAgo(20),
    },
    {
      user_id: studentId,
      type: "payment_success",
      title: `${MOCK_MARKER} First payment received`,
      body: "Your premium first installment was recorded.",
      payload: { seed: "student-mock", href: "/billing" },
      read_at: hoursAgo(48),
      created_at: hoursAgo(72),
    },
    {
      user_id: studentId,
      type: "payment_reminder",
      title: `${MOCK_MARKER} Remaining balance due`,
      body: "Complete your remaining payment to stay fully current.",
      payload: { seed: "student-mock", href: "/billing" },
      read_at: null,
      created_at: hoursAgo(8),
    },
    {
      user_id: studentId,
      type: "community_moderation",
      title: `${MOCK_MARKER} Post approved`,
      body: "Your community post is live in Product Hunting.",
      payload: { seed: "student-mock", href: "/community" },
      read_at: hoursAgo(3),
      created_at: hoursAgo(10),
    },
  ];

  const { error: notifInsErr } = await supabase
    .from("notifications")
    .insert(notifications);
  assertOk(notifInsErr, "insert notifications");
  summary.notifications = notifications.length;
  console.log(`✓ Notifications: ${notifications.length}`);

  // 6) Messages thread (text only)
  const messageRows = [
    {
      sender_id: studentId,
      recipient_id: mentorId,
      content: `${MOCK_MARKER} Hi! I just finished drafting my business plan — can you review the niche choice?`,
      created_at: hoursAgo(30),
      read_at: hoursAgo(28),
    },
    {
      sender_id: mentorId,
      recipient_id: studentId,
      content: `${MOCK_MARKER} Looks solid. Narrow the TAM estimate and add your first 3 competitor ASINs.`,
      created_at: hoursAgo(26),
      read_at: hoursAgo(24),
    },
    {
      sender_id: studentId,
      recipient_id: mentorId,
      content: `${MOCK_MARKER} Updated — shared a Google Doc link in the task submission.`,
      created_at: hoursAgo(6),
      read_at: null,
    },
    {
      sender_id: mentorId,
      recipient_id: studentId,
      content: `${MOCK_MARKER} Great. I'll review tomorrow. Join the next premium Q&A if you can.`,
      created_at: hoursAgo(4),
      read_at: null,
    },
  ];
  const { error: msgInsErr } = await supabase.from("messages").insert(messageRows);
  assertOk(msgInsErr, "insert messages");
  summary.messages = messageRows.length;
  console.log(`✓ Messages: ${messageRows.length} with mentor`);

  // 7) Support tickets
  const { data: staff } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "superadmin@scalex.dev")
    .maybeSingle();
  const staffId = staff?.id ?? mentorId;

  const ticketRows = [
    {
      student_id: studentId,
      subject: `${MOCK_MARKER} Can't access live class link`,
      body: "The Sessions page shows an upcoming class but meeting URL is empty. Is that expected before the host publishes it?",
      priority: "normal",
      status: "open",
      staff_reply: null,
      staff_replied_by: null,
      staff_reply_at: null,
      created_at: hoursAgo(12),
    },
    {
      student_id: studentId,
      subject: `${MOCK_MARKER} Invoice PDF missing`,
      body: "Billing shows a paid first installment but no PDF download. Confirming that's OK for mock/test.",
      priority: "normal",
      status: "resolved",
      staff_reply:
        "Confirmed — invoice PDFs are optional when Storage is not used. Your payment row is valid.",
      staff_replied_by: staffId,
      staff_reply_at: hoursAgo(18),
      created_at: hoursAgo(36),
    },
  ];
  const { error: ticketInsErr } = await supabase
    .from("support_tickets")
    .insert(ticketRows);
  assertOk(ticketInsErr, "insert support tickets");
  summary.tickets = ticketRows.length;
  console.log(`✓ Support tickets: ${ticketRows.length} (open + resolved)`);

  // 8) Announcements
  const announcementRows = [
    {
      title: `${MOCK_MARKER} Welcome to LaunchPad Premium`,
      content:
        "Your premium seat is active. Start with Foundation lessons, then submit your Business Plan for mentor review.",
      published_at: hoursAgo(96),
    },
    {
      title: `${MOCK_MARKER} Live Q&A this week`,
      content:
        "Bring product research questions to the Weekly Q&A. Register on the Sessions page — seats are limited.",
      published_at: hoursAgo(36),
    },
    {
      title: `${MOCK_MARKER} Reminder: remaining balance`,
      content:
        "Complete your remaining installment when ready. Billing shows status and invoice for the first payment.",
      published_at: hoursAgo(12),
    },
  ];
  const { error: annInsErr } = await supabase
    .from("announcements")
    .insert(announcementRows);
  assertOk(annInsErr, "insert announcements");
  summary.announcements = announcementRows.length;
  console.log(`✓ Announcements: ${announcementRows.length}`);

  // 9) Community posts (student + mentor announcements), then comments + likes
  const studentPostRows = [
    {
      author_id: studentId,
      channel: "product_hunting",
      content: `${MOCK_MARKER} Looking for feedback on kitchen gadget niches under $30 — demand vs competition tips?`,
      status: "approved",
      media_urls: [],
      like_count: 0,
      created_at: hoursAgo(40),
    },
    {
      author_id: studentId,
      channel: "questions",
      content: `${MOCK_MARKER} Do I need brand registry before ordering samples, or after first sale?`,
      status: "approved",
      media_urls: [],
      like_count: 0,
      created_at: hoursAgo(22),
    },
    {
      author_id: studentId,
      channel: "student_wins",
      content: `${MOCK_MARKER} Finished Foundation business plan draft — first real deliverable done!`,
      status: "approved",
      media_urls: [],
      like_count: 0,
      created_at: hoursAgo(15),
    },
  ];
  const mentorPostRow = {
    author_id: mentorId,
    channel: "announcements",
    content: `${MOCK_MARKER} Mentors online this week — drop your milestone blockers in Questions and tag your niche.`,
    status: "approved",
    media_urls: [],
    like_count: 0,
    created_at: hoursAgo(18),
  };

  const { data: insertedStudentPosts, error: postInsErr } = await supabase
    .from("community_posts")
    .insert(studentPostRows)
    .select("id, channel");
  assertOk(postInsErr, "insert student community posts");

  const { data: insertedMentorPost, error: mentorPostErr } = await supabase
    .from("community_posts")
    .insert(mentorPostRow)
    .select("id, channel")
    .single();
  assertOk(mentorPostErr, "insert mentor community post");

  const studentPostIds = (insertedStudentPosts ?? []).map((p) => p.id);
  const mentorPostId = insertedMentorPost?.id;
  summary.communityPosts =
    studentPostIds.length + (mentorPostId ? 1 : 0);

  const commentRows = [];
  if (studentPostIds[0]) {
    commentRows.push({
      post_id: studentPostIds[0],
      author_id: mentorId,
      content: `${MOCK_MARKER} Check review velocity on page-1 ASINs before locking the niche.`,
      created_at: hoursAgo(38),
    });
  }
  if (studentPostIds[1]) {
    commentRows.push({
      post_id: studentPostIds[1],
      author_id: studentId,
      content: `${MOCK_MARKER} Following up — anyone brand-registered before samples?`,
      created_at: hoursAgo(20),
    });
    commentRows.push({
      post_id: studentPostIds[1],
      author_id: mentorId,
      content: `${MOCK_MARKER} Brand Registry after you have a trademark filing is typical — samples can come first.`,
      created_at: hoursAgo(19),
    });
  }
  if (mentorPostId) {
    commentRows.push({
      post_id: mentorPostId,
      author_id: studentId,
      content: `${MOCK_MARKER} Thanks! I'll post my Business Setup questions there.`,
      created_at: hoursAgo(16),
    });
  }

  if (commentRows.length) {
    const { error: commentInsErr } = await supabase
      .from("comments")
      .insert(commentRows);
    assertOk(commentInsErr, "insert comments");
    summary.comments = commentRows.length;
  }

  // Mentor likes student posts (trigger bumps like_count)
  const likeRows = studentPostIds.map((postId) => ({
    post_id: postId,
    user_id: mentorId,
    created_at: hoursAgo(14),
  }));
  if (likeRows.length) {
    const { error: likeInsErr } = await supabase
      .from("post_likes")
      .insert(likeRows);
    assertOk(likeInsErr, "insert post likes");
    summary.postLikes = likeRows.length;

    // Ensure like_count matches inserted likes (trigger should already bump)
    for (const postId of studentPostIds) {
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      await supabase
        .from("community_posts")
        .update({ like_count: count ?? 1 })
        .eq("id", postId);
    }
  }

  console.log(
    `✓ Community: ${summary.communityPosts} posts, ${summary.comments} comments, ${summary.postLikes} likes`
  );

  // 10) Live sessions: 2 upcoming + 1 past (no recordings/storage)
  const sessionRows = [
    {
      title: `${MOCK_MARKER} Product Hunting Masterclass`,
      description: "Live walkthrough of product research for Private Label.",
      type: "masterclass",
      audience: "all_premium",
      scheduled_at: daysFromNow(2),
      host_id: mentorId,
      meeting_url: "https://meet.google.com/mock-seed-product-hunting",
      recording_url: null,
    },
    {
      title: `${MOCK_MARKER} Weekly Q&A with Mentor`,
      description: "Ask anything about your current milestone.",
      type: "qa",
      audience: "all_premium",
      scheduled_at: daysFromNow(5),
      host_id: mentorId,
      meeting_url: "https://meet.google.com/mock-seed-weekly-qa",
      recording_url: null,
    },
    {
      title: `${MOCK_MARKER} Orientation Kickoff`,
      description: "Past orientation session for new Premium students.",
      type: "batch_class",
      audience: "all_premium",
      scheduled_at: daysAgo(7),
      host_id: mentorId,
      meeting_url: "https://meet.google.com/mock-seed-orientation",
      recording_url: null,
    },
  ];
  const { data: createdSessions, error: sessInsErr } = await supabase
    .from("live_sessions")
    .insert(sessionRows)
    .select("id, title");
  assertOk(sessInsErr, "insert live sessions");
  summary.liveSessions = createdSessions?.length ?? 0;

  if (createdSessions?.length) {
    const regs = createdSessions.map((s) => ({
      session_id: s.id,
      student_id: studentId,
    }));
    const { error: regInsErr } = await supabase
      .from("session_registrations")
      .upsert(regs, { onConflict: "session_id,student_id" });
    assertOk(regInsErr, "upsert session registrations");
    summary.sessionRegs = regs.length;
    console.log(
      `✓ Live sessions + registrations: ${regs.length} (2 upcoming + 1 past)`
    );
  }

  // 11) Submissions + reviews (MS1 approved → then MS2 under_review)
  if (course) {
    const { data: milestones, error: msErr } = await supabase
      .from("milestones")
      .select("id, title, order_index")
      .eq("course_id", course.id)
      .order("order_index", { ascending: true })
      .limit(3);
    assertOk(msErr, "list milestones");

    let taskList = [];
    if (milestones?.length) {
      const { data: byMs, error: taskErr } = await supabase
        .from("tasks")
        .select("id, title, milestone_id")
        .in(
          "milestone_id",
          milestones.map((m) => m.id)
        );
      assertOk(taskErr, "list tasks");
      const orderByMs = new Map(milestones.map((m) => [m.id, m.order_index]));
      taskList = (byMs ?? []).sort(
        (a, b) =>
          (orderByMs.get(a.milestone_id) ?? 0) -
          (orderByMs.get(b.milestone_id) ?? 0)
      );
    }

    if (taskList.length >= 1) {
      const t0 = taskList[0];
      const { data: sub0, error: sub0Err } = await supabase
        .from("submissions")
        .upsert(
          {
            task_id: t0.id,
            student_id: studentId,
            status: "approved",
            content: {
              type: "text",
              text: `${MOCK_MARKER} Business plan draft: Target kitchen gadgets under $30 AOV, Pakistan-based sourcing, launch US storefront in 6 months.`,
            },
            submitted_at: hoursAgo(48),
            ai_score: 86,
            ai_notes: "Strong plan; niche and timeline look realistic.",
          },
          { onConflict: "task_id,student_id" }
        )
        .select("id")
        .single();
      assertOk(sub0Err, "upsert submission MS1");
      summary.submissions += 1;

      if (sub0?.id) {
        const { error: revErr } = await supabase.from("reviews").insert({
          submission_id: sub0.id,
          reviewer_id: mentorId,
          decision: "approved",
          feedback: `${MOCK_MARKER} Approved — clear niche, solid TAM sketch, and competitor ASINs look good. Proceed to Business Setup.`,
          reviewed_at: hoursAgo(40),
        });
        assertOk(revErr, "insert MS1 review");
        summary.reviews += 1;
      }

      // Align profile stage with approved MS1
      const ms1Title =
        milestones?.find((m) => m.id === t0.milestone_id)?.title ?? "Foundation";
      await supabase
        .from("profiles")
        .update({ current_stage: ms1Title })
        .eq("id", studentId);
    }

    if (taskList.length >= 2) {
      const t1 = taskList[1];
      const { error: sub1Err } = await supabase.from("submissions").upsert(
        {
          task_id: t1.id,
          student_id: studentId,
          status: "under_review",
          content: {
            type: "link",
            link: "https://docs.google.com/document/d/mock-seed-business-docs",
            comments: `${MOCK_MARKER} Shared folder with registration docs (link only, no file upload).`,
          },
          submitted_at: hoursAgo(10),
          ai_score: 74,
          ai_notes:
            "Docs link is present; confirm NTN / bank letter filenames match checklist.",
        },
        { onConflict: "task_id,student_id" }
      );
      assertOk(sub1Err, "upsert submission MS2");
      summary.submissions += 1;
    }

    console.log(
      `✓ Submissions: ${summary.submissions} (MS1 approved + review, MS2 under_review)`
    );

    // Re-run completion RPC after approvals (ignore permission; already handled)
    const { error: rpc2Err } = await supabase.rpc(
      "refresh_enrollment_completion",
      {
        p_student_id: studentId,
        p_course_id: course.id,
      }
    );
    if (!rpc2Err) {
      const { data: enrollRow } = await supabase
        .from("enrollments")
        .select("completion_percent")
        .eq("student_id", studentId)
        .eq("course_id", course.id)
        .maybeSingle();
      summary.completionPercent = enrollRow?.completion_percent ?? summary.completionPercent;
    } else if (
      !/permission|denied|not granted|execute/i.test(String(rpc2Err.message)) &&
      rpc2Err.code !== "42501"
    ) {
      // Non-permission failure after submissions — leave prior percent
      console.warn(
        `⚠ post-submission refresh_enrollment_completion: ${rpc2Err.message}`
      );
    } else if (summary.completionPercent == null) {
      await supabase
        .from("enrollments")
        .update({ completion_percent: 45 })
        .eq("student_id", studentId)
        .eq("course_id", course.id);
      summary.completionPercent = 45;
    }
  }

  // 12) Badges + AI chat
  const { error: badgeInsErr } = await supabase.from("badges").upsert(
    [
      {
        student_id: studentId,
        key: "milestone_1",
        earned_at: hoursAgo(40),
      },
      {
        student_id: studentId,
        key: "product_found",
        earned_at: hoursAgo(12),
      },
    ],
    { onConflict: "key,student_id" }
  );
  assertOk(badgeInsErr, "upsert badges");
  summary.badges = 2;

  const { data: chat, error: chatErr } = await supabase
    .from("ai_chats")
    .insert({
      student_id: studentId,
      title: `${MOCK_MARKER} Product research tips`,
    })
    .select("id")
    .single();
  assertOk(chatErr, "insert ai chat");

  if (chat?.id) {
    const { error: chatMsgErr } = await supabase.from("ai_chat_messages").insert([
      {
        chat_id: chat.id,
        role: "user",
        content: `${MOCK_MARKER} How do I estimate monthly demand for a kitchen gadget niche?`,
        created_at: hoursAgo(14),
      },
      {
        chat_id: chat.id,
        role: "assistant",
        content: `${MOCK_MARKER} Start with keyword search volume, review velocity on page-1 ASINs, and seasonality. Cross-check with Keepa/Helium10-style demand before committing to samples.`,
        created_at: hoursAgo(14),
      },
    ]);
    assertOk(chatMsgErr, "insert ai chat messages");
    summary.aiChats = 1;
  }
  console.log("✓ Badges milestone_1 + product_found + AI chat thread");

  // Summary
  console.log("\n========== Mock seed complete ==========");
  console.log("Login (student portal):");
  console.log(`  Email:    ${STUDENT_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  Plan:     premium`);
  console.log("\nSeeded:");
  console.log(`  profile:          ${summary.profile}`);
  console.log(`  enrollment:       ${summary.enrollment}`);
  console.log(`  completion %:     ${summary.completionPercent}`);
  console.log(`  prefs/settings:   ${summary.prefs}`);
  console.log(`  payments:         ${summary.payments}`);
  console.log(`  invoices:         ${summary.invoices} (pdf_url null)`);
  console.log(`  notifications:    ${summary.notifications}`);
  console.log(`  messages:         ${summary.messages}`);
  console.log(`  support tickets:  ${summary.tickets}`);
  console.log(`  announcements:    ${summary.announcements}`);
  console.log(`  community posts:  ${summary.communityPosts}`);
  console.log(`  comments:         ${summary.comments}`);
  console.log(`  post likes:       ${summary.postLikes}`);
  console.log(`  live sessions:    ${summary.liveSessions}`);
  console.log(`  session regs:     ${summary.sessionRegs}`);
  console.log(`  lesson completes: ${summary.lessonCompletions}`);
  console.log(`  submissions:      ${summary.submissions}`);
  console.log(`  reviews:          ${summary.reviews}`);
  console.log(`  badges:           ${summary.badges}`);
  console.log(`  ai chats:         ${summary.aiChats}`);
  console.log("\nNo Storage uploads. Media/avatar/pdf URLs left null/empty.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
