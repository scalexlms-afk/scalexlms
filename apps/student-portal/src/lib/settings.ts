import { createClient } from "@scalex/db/server";
import { planLabel } from "@scalex/db";
import type { Profile } from "@scalex/db/types";
import {
  getStudentBadges,
  getStudentJourneySummary,
} from "@/lib/data";
import type { SettingsPageData } from "@/lib/settings-shared";

export type {
  SettingsLearningStats,
  SettingsPageData,
  SettingsPlanSummary,
  SettingsProfile,
  SettingsTabId,
} from "@/lib/settings-shared";
export {
  SETTINGS_TABS,
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
  ]);

  const hasName = Boolean(profile.name?.trim());
  const hasPhone = Boolean(profile.phone?.trim());
  const hasAvatar = Boolean(profile.avatar_url);
  const hasPlan = Boolean(profile.plan);

  const checklist = [
    { id: "photo", label: "Profile Photo", done: hasAvatar },
    { id: "basic", label: "Basic Information", done: hasName && hasPhone },
    { id: "learning", label: "Learning Preferences", done: false },
    { id: "notifications", label: "Notification Settings", done: false },
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
    },
    plan: {
      plan: profile.plan,
      planLabel: planLabel(profile.plan),
      enrolledAt: journey.enrolledAt,
      monthsRemaining: journey.monthsRemaining,
      accessUntil: accessUntilFromEnrolledAt(journey.enrolledAt),
    },
    stats: {
      coursesEnrolled: enrollmentCount ?? 0,
      tasksCompleted: approvedCount ?? 0,
      liveClassesAttended: sessionRegCount ?? 0,
      achievementsEarned: badges.length,
    },
    profileCompletionPercent,
    checklist,
  };
}
