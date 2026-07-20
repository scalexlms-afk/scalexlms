import Link from "next/link";
import {
  NavSidebar,
  MobileNav,
  Logo,
  NotificationBell,
  ThemeToggle,
} from "@scalex/ui";
import type { NavGroup } from "@scalex/ui";
import { getPermission, type Feature } from "@scalex/db/rbac";
import type { UserRole } from "@scalex/db/types";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminNotifications } from "@/lib/data";
import { markNotificationRead } from "@/app/notifications/actions";

const iconClass = "h-4 w-4";

const DashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"
      fill="currentColor"
    />
  </svg>
);

const ReviewIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="m9 12 2 2 4-4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CommunityIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 20v-2a4 4 0 0 0-3-3.87"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SessionsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StudentsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ContentIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 6h16M4 12h16M4 18h10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CrmIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FinanceIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M12 3v18M8 7h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 20V10M10 20V4M16 20v-8M22 20H2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.03 1.41 1.03H21a2 2 0 1 1 0 4h-.09c-.64 0-1.15.43-1.41 1.03Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type NavDef = {
  label: string;
  href: string;
  feature: Feature;
  icon: React.ReactNode;
};

const NAV_CATALOG: { title: string; items: NavDef[] }[] = [
  {
    title: "Academy",
    items: [
      { label: "Dashboard", href: "/", feature: "dashboard", icon: DashboardIcon },
      {
        label: "Task Review",
        href: "/reviews",
        feature: "task_review",
        icon: ReviewIcon,
      },
      {
        label: "Community",
        href: "/community",
        feature: "community",
        icon: CommunityIcon,
      },
      {
        label: "Live Sessions",
        href: "/sessions",
        feature: "live_sessions",
        icon: SessionsIcon,
      },
      {
        label: "Students",
        href: "/students",
        feature: "student_management",
        icon: StudentsIcon,
      },
      {
        label: "Student Chat",
        href: "/messages",
        feature: "student_management",
        icon: CommunityIcon,
      },
      {
        label: "Support",
        href: "/support",
        feature: "student_management",
        icon: ReviewIcon,
      },
      {
        label: "Content Management",
        href: "/content",
        feature: "course_content",
        icon: ContentIcon,
      },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "CRM", href: "/crm", feature: "crm", icon: CrmIcon },
      { label: "Finance", href: "/finance", feature: "finance", icon: FinanceIcon },
      { label: "Reports", href: "/reports", feature: "reports", icon: ReportsIcon },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "System Settings",
        href: "/settings",
        feature: "system_settings",
        icon: SettingsIcon,
      },
    ],
  },
];

function buildNavGroups(role: UserRole, activePath: string): NavGroup[] {
  return NAV_CATALOG.map((group) => ({
    title: group.title,
    items: group.items
      .filter((item) => getPermission(role, item.feature) !== "none")
      .map((item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
        active: activePath === item.href,
      })),
  })).filter((group) => group.items.length > 0);
}

function roleLabel(role: UserRole): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function AdminShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  const { profile, userId } = await requireAdminProfile();
  const groups = buildNavGroups(profile.role, activePath);
  const notifications = await getAdminNotifications(userId);

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <NavSidebar
          groups={groups}
          brand={<Logo size="md" showTagline />}
          linkComponent={Link}
          footer={
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {profile.name}
              </p>
              <p className="truncate text-xs text-muted">
                {profile.email}
              </p>
              <p className="mt-0.5 text-xs text-subtle">
                {roleLabel(profile.role)}
              </p>
              <form action="/auth/signout" method="post" className="mt-3">
                <button
                  type="submit"
                  className="text-xs text-scalex-red hover:underline"
                >
                  Sign out
                </button>
              </form>
            </div>
          }
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3 md:hidden">
            <MobileNav
              groups={groups}
              brand={<Logo size="sm" />}
              linkComponent={Link}
              footer={
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {profile.email}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {roleLabel(profile.role)}
                  </p>
                  <form action="/auth/signout" method="post" className="mt-3">
                    <button
                      type="submit"
                      className="text-xs text-scalex-red hover:underline"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              }
            />
            <Logo size="sm" />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell
              notifications={notifications}
              markReadAction={markNotificationRead}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
