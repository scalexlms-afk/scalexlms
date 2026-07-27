import { createClient } from "@scalex/db/server";
import { planLabel } from "@scalex/db";
import type { Profile } from "@scalex/db/types";
import {
  getStudentBadges,
  getStudentJourneySummary,
} from "@/lib/data";
import type {
  SettingsLearningPrefs,
  SettingsNotificationPrefs,
  SettingsPageData,
} from "@/lib/settings-shared";

export type {
  SettingsLearningStats,
  SettingsPageData,
  SettingsPlanSummary,
  SettingsProfile,
  SettingsTabId,
  SettingsNotificationPrefs,
  SettingsLearningPrefs,
} from "@/lib/settings-shared";
export {
  SETTINGS_TABS,
  SETTINGS_COUNTRIES,
  SETTINGS_LANGUAGES,
  formatSettingsDate,
  profileInitials,
} from "@/lib/settings-shared";

function accessUntilFromEnrolledAt(enrolledAt: string | null): string | null {
  if (!enrolledAt) return null;
  const start = new Date(enrolledAt).getTime();
  if (Number.isNaN(start)) return null;
  const end = start + 12 * 30.44 * 24 * 60 * 60 * 1000;
  return new Date(end).toISOString();
}

function parseLearning(raw: unknown): SettingsLearningPrefs {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const cadence = obj.digestCadence;
  const digestCadence =
    cadence === "daily" || cadence === "weekly" || cadence === "off"
      ? cadence
      : "weekly";
  const hourRaw = Number(obj.reminderHour);
  const reminderHour =
    Number.isFinite(hourRaw) && hourRaw >= 0 && hourRaw <= 23
      ? Math.floor(hourRaw)
      : 9;
  return { digestCadence, reminderHour };
}

const DEFAULT_NOTIF: SettingsNotificationPrefs = {
  inApp: true,
  email: true,
  browser: false,
  push: false,
  whatsapp: false,
};

export async function ensureNotificationPreferences(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("in_app, email, browser, push, whatsapp")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const row = data as {
      in_app: boolean;
      email: boolean;
      browser: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    return {
      inApp: row.in_app,
      email: row.email,
      browser: row.browser,
      push: row.push,
      whatsapp: row.whatsapp,
    } satisfies SettingsNotificationPrefs;
  }

  await supabase.from("notification_preferences").upsert(
    {
      user_id: userId,
      in_app: true,
      email: true,
      browser: false,
      push: false,
      whatsapp: false,
    } as never,
    { onConflict: "user_id" }
  );

  return { ...DEFAULT_NOTIF };
}

export async function ensureLearningSettings(
  userId: string
): Promise<SettingsLearningPrefs> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("learning")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    return parseLearning((data as { learning: unknown }).learning);
  }

  const defaults: SettingsLearningPrefs = {
    digestCadence: "weekly",
    reminderHour: 9,
  };

  await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      learning: defaults,
    } as never,
    { onConflict: "user_id" }
  );

  return defaults;
}

export async function getSettingsPageData(
  userId: string,
  profile: Profile
): Promise<SettingsPageData> {
  const supabase = await createClient();

  const [
    journey,
    badges,
    { count: enrollmentCount },
    { count: approvedCount },
    { count: sessionRegCount },
    notificationPrefs,
    learningPrefs,
  ] = await Promise.all([
    getStudentJourneySummary(userId),
    getStudentBadges(userId),
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("status", "approved"),
    supabase
      .from("session_registrations")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId),
    ensureNotificationPreferences(userId),
    ensureLearningSettings(userId),
  ]);

  const profileRow = profile as Profile & {
    country?: string | null;
    language?: string | null;
    stripe_customer_id?: string | null;
  };

  const hasName = Boolean(profile.name?.trim());
  const hasPhone = Boolean(profile.phone?.trim());
  const hasAvatar = Boolean(profile.avatar_url);
  const hasPlan = Boolean(profile.plan);
  const hasLearning =
    learningPrefs.digestCadence !== "off" || learningPrefs.reminderHour !== 9;
  const hasNotifPrefs = true;

  const checklist = [
    { id: "photo", label: "Profile Photo", done: hasAvatar },
    { id: "basic", label: "Basic Information", done: hasName && hasPhone },
    { id: "learning", label: "Learning Preferences", done: hasLearning },
    { id: "notifications", label: "Notification Settings", done: hasNotifPrefs },
    { id: "payment", label: "Payment Method", done: hasPlan },
  ];

  const doneCount = checklist.filter((c) => c.done).length;
  const profileCompletionPercent = Math.round(
    (doneCount / checklist.length) * 100
  );

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      country: profileRow.country ?? null,
      language: profileRow.language ?? "en",
    },
    plan: {
      plan: profile.plan,
      planLabel: planLabel(profile.plan),
      enrolledAt: journey.enrolledAt,
      monthsRemaining: journey.monthsRemaining,
      accessUntil: accessUntilFromEnrolledAt(journey.enrolledAt),
      stripeCustomerId: profileRow.stripe_customer_id ?? null,
    },
    stats: {
      coursesEnrolled: enrollmentCount ?? 0,
      tasksCompleted: approvedCount ?? 0,
      liveClassesAttended: sessionRegCount ?? 0,
      achievementsEarned: badges.length,
    },
    profileCompletionPercent,
    checklist,
    notificationPrefs,
    learningPrefs,
  };
}
