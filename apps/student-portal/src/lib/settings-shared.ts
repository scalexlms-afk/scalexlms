/** Client-safe Settings types & helpers — no server imports. */

export type SettingsTabId =
  | "profile"
  | "learning"
  | "notifications"
  | "security"
  | "subscription"
  | "account";

export type SettingsLearningStats = {
  coursesEnrolled: number;
  tasksCompleted: number;
  liveClassesAttended: number;
  achievementsEarned: number;
};

export type SettingsPlanSummary = {
  plan: string | null;
  planLabel: string;
  enrolledAt: string | null;
  monthsRemaining: number | null;
  accessUntil: string | null;
};

export type SettingsProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
};

export type SettingsPageData = {
  profile: SettingsProfile;
  plan: SettingsPlanSummary;
  stats: SettingsLearningStats;
  profileCompletionPercent: number;
  checklist: Array<{ id: string; label: string; done: boolean }>;
};

export const SETTINGS_TABS: Array<{ id: SettingsTabId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "learning", label: "Learning Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "subscription", label: "Subscription" },
  { id: "account", label: "Account" },
];

export function formatSettingsDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function profileInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
