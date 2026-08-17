"use server";

import { requireStudentProfile } from "@/lib/auth";
import { getNotifications, getSidebarProgress } from "@/lib/data";

export type PortalChromeExtras = {
  name: string;
  email: string;
  avatarUrl: string | null;
  plan: string | null;
  unreadCount: number;
  completionPercent: number;
  milestoneIndex: number;
  milestoneTotal: number;
};

export async function loadPortalChromeExtras(): Promise<PortalChromeExtras> {
  const { userId, profile } = await requireStudentProfile();
  const [notifications, progress] = await Promise.all([
    getNotifications(userId).catch(() => []),
    getSidebarProgress(userId).catch(() => ({
      completionPercent: 0,
      milestoneIndex: 1,
      milestoneTotal: 8,
    })),
  ]);

  return {
    name: profile.name ?? "Student",
    email: profile.email ?? "",
    avatarUrl: profile.avatar_url ?? null,
    plan: profile.plan ?? null,
    unreadCount: notifications.filter((n) => !n.read_at).length,
    completionPercent: progress.completionPercent,
    milestoneIndex: progress.milestoneIndex,
    milestoneTotal: progress.milestoneTotal,
  };
}
