import { createClient } from "@scalex/db/server";

export async function collectAccountExport(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: enrollments },
    { data: submissions },
    { data: payments },
    { data: tickets },
    { data: badges },
    { data: notifications },
    { data: lessonCompletions },
    { data: sessionRegs },
    { data: notifPrefs },
    { data: userSettings },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("enrollments").select("*").eq("student_id", userId),
    supabase.from("submissions").select("*").eq("student_id", userId),
    supabase.from("payments").select("*, invoices(*)").eq("student_id", userId),
    supabase.from("support_tickets").select("*").eq("student_id", userId),
    supabase.from("badges").select("*").eq("student_id", userId),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("lesson_completions").select("*").eq("student_id", userId),
    supabase.from("session_registrations").select("*").eq("student_id", userId),
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    enrollments: enrollments ?? [],
    submissions: submissions ?? [],
    payments: payments ?? [],
    supportTickets: tickets ?? [],
    badges: badges ?? [],
    notifications: notifications ?? [],
    lessonCompletions: lessonCompletions ?? [],
    sessionRegistrations: sessionRegs ?? [],
    notificationPreferences: notifPrefs,
    userSettings: userSettings,
  };
}
