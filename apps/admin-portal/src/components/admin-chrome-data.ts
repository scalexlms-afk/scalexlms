"use server";

import { requireAdminProfile } from "@/lib/auth";
import {
  getAdminNotifications,
  getCoursesList,
  getNavBadgeCounts,
} from "@/lib/data";
import type { AdminCourseOption } from "@/lib/admin-nav";
import type { AdminNotification } from "@/lib/data";
import type { UserRole } from "@scalex/db/types";

export type AdminChromeExtras = {
  name: string;
  email: string;
  role: UserRole;
  notifications: AdminNotification[];
  badges: {
    reviews: number;
    sessions: number;
    messages: number;
    support: number;
  };
  courses: AdminCourseOption[];
};

export async function loadAdminChromeExtras(): Promise<AdminChromeExtras> {
  const { profile, userId } = await requireAdminProfile();
  const [notifications, badgeCounts, courses] = await Promise.all([
    getAdminNotifications(userId).catch(() => [] as AdminNotification[]),
    getNavBadgeCounts({ userId, role: profile.role }).catch(() => ({
      pendingReviews: 0,
      upcomingSessions: 0,
      openTickets: 0,
    })),
    getCoursesList().catch(() => [] as AdminCourseOption[]),
  ]);

  return {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    notifications,
    badges: {
      reviews: badgeCounts.pendingReviews,
      sessions: badgeCounts.upcomingSessions,
      messages: notifications.filter((n) => !n.read_at).length,
      support: badgeCounts.openTickets,
    },
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      status: course.status,
    })),
  };
}
