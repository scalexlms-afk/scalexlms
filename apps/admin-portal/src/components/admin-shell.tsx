import type { ReactNode } from "react";
import type { NavGroup } from "@scalex/ui";
import { getPermission, type Feature } from "@scalex/db/rbac";
import type { UserRole } from "@scalex/db/types";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminNotifications, getCoursesList, getNavBadgeCounts } from "@/lib/data";
import { markNotificationRead } from "@/app/(app)/notifications/actions";
import { AdminChrome } from "@/components/admin-chrome";

const iconClass = "h-4 w-4";

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" fill="currentColor" />
    </svg>
  ),
  analytics: (
    <Ico d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  ),
  courses: (
    <Ico d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  ),
  resources: (
    <Ico d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  ),
  ai: (
    <Ico d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
  ),
  students: (
    <Ico d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
  ),
  reviews: (
    <Ico d="m9 12 2 2 4-4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
  ),
  community: (
    <Ico d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
  ),
  sessions: (
    <Ico d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
  ),
  messages: (
    <Ico d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  ),
  support: (
    <Ico d="M12 1a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a4 4 0 0 0 8 0v-1h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2V5a4 4 0 0 0-4-4Z" />
  ),
  crm: (
    <Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  ),
  finance: (
    <Ico d="M12 3v18M8 7h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6" />
  ),
  team: (
    <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  ),
  roles: (
    <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  ),
  settings: (
    <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  ),
};

type NavDef = {
  label: string;
  href: string;
  feature: Feature;
  icon: ReactNode;
  badgeKey?: "reviews" | "sessions" | "messages" | "support";
};

const NAV_CATALOG: { title: string; items: NavDef[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", feature: "dashboard", icon: icons.dashboard },
      { label: "Analytics", href: "/analytics", feature: "reports", icon: icons.analytics },
    ],
  },
  {
    title: "Academy",
    items: [
      { label: "Courses", href: "/content", feature: "course_content", icon: icons.courses },
      { label: "Resources", href: "/resources", feature: "course_content", icon: icons.resources },
      {
        label: "AI Knowledge Base",
        href: "/ai-knowledge",
        feature: "ai_mentor",
        icon: icons.ai,
      },
    ],
  },
  {
    title: "Students",
    items: [
      {
        label: "Students",
        href: "/students",
        feature: "student_management",
        icon: icons.students,
      },
      {
        label: "Task Reviews",
        href: "/reviews",
        feature: "task_review",
        icon: icons.reviews,
        badgeKey: "reviews",
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Community", href: "/community", feature: "community", icon: icons.community },
      {
        label: "Live Sessions",
        href: "/sessions",
        feature: "live_sessions",
        icon: icons.sessions,
        badgeKey: "sessions",
      },
      {
        label: "Messages",
        href: "/messages",
        feature: "student_management",
        icon: icons.messages,
        badgeKey: "messages",
      },
      {
        label: "Support Tickets",
        href: "/support",
        feature: "student_management",
        icon: icons.support,
        badgeKey: "support",
      },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "CRM", href: "/crm", feature: "crm", icon: icons.crm },
      { label: "Finance", href: "/finance", feature: "finance", icon: icons.finance },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Team Members",
        href: "/team",
        feature: "system_settings",
        icon: icons.team,
      },
      {
        label: "Roles & Permissions",
        href: "/roles",
        feature: "system_settings",
        icon: icons.roles,
      },
      {
        label: "Settings",
        href: "/settings",
        feature: "system_settings",
        icon: icons.settings,
      },
    ],
  },
];

function buildNavGroups(
  role: UserRole,
  badges: Partial<Record<NonNullable<NavDef["badgeKey"]>, number>>
): NavGroup[] {
  return NAV_CATALOG.map((group) => ({
    title: group.title,
    items: group.items
      .filter((item) => getPermission(role, item.feature) !== "none")
      .map((item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge:
          item.badgeKey && badges[item.badgeKey]
            ? badges[item.badgeKey]
            : undefined,
      })),
  })).filter((group) => group.items.length > 0);
}

function roleLabel(role: UserRole): string {
  if (role === "super_admin") return "Super Admin";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, userId } = await requireAdminProfile();
  const [notifications, badgeCounts, courses] = await Promise.all([
    getAdminNotifications(userId),
    getNavBadgeCounts({ userId, role: profile.role }).catch(() => ({
      pendingReviews: 0,
      upcomingSessions: 0,
      openTickets: 0,
    })),
    getCoursesList().catch(() => []),
  ]);

  const badges = {
    reviews: badgeCounts.pendingReviews,
    sessions: badgeCounts.upcomingSessions,
    messages: notifications.filter((n) => !n.read_at).length,
    support: badgeCounts.openTickets,
  };

  const groups = buildNavGroups(profile.role, badges);

  const footer = (
    <div className="text-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-scalex-red/20 text-xs font-bold text-scalex-red">
          {profile.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {roleLabel(profile.role)}
          </p>
          <p className="truncate text-xs text-muted">{profile.email}</p>
        </div>
      </div>
      <form action="/auth/signout" method="post" className="mt-3">
        <button
          type="submit"
          className="text-xs font-medium text-accent-danger hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <AdminChrome
      groups={groups}
      footer={footer}
      notifications={notifications}
      markReadAction={markNotificationRead}
      courses={courses.map((course) => ({
        id: course.id,
        title: course.title,
        status: course.status,
      }))}
    >
      {children}
    </AdminChrome>
  );
}
