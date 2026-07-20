import {
  NavSidebar,
  MobileNav,
  Logo,
  ThemeToggle,
  StatusPill,
} from "@scalex/ui";
import type { NavGroup, NavItem } from "@scalex/ui";
import { createClient } from "@scalex/db/server";
import { planLabel, planPillVariant } from "@scalex/db";
import { redirect } from "next/navigation";
import { getNotifications, getStudentJourneySummary } from "@/lib/data";

const iconClass = "h-4 w-4";

const DashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"
      fill="currentColor"
    />
  </svg>
);

const ContinueIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
  </svg>
);

const RoadmapIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M5 5.5h10a2 2 0 0 1 2 2v11l-3-1.5-3 1.5-3-1.5-3 1.5v-11a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 9h6M9 12h6M9 15h3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const TasksIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M8 5h11v14H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m9.5 10 1.5 1.5L14 8.5M9.5 15.5h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AchievementsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M8 4h8v5a4 4 0 0 1-8 0V4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M10 13v2.5L12 17l2-1.5V13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AiIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M9 15V9h2.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H10.2M14.5 15l-1.4-2.4"
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
      d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 18v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1M12 18v-1a4 4 0 0 1 4-4h0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SessionsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 6h16v10H4V6Zm4 14h8M12 16v4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessagesIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M4 6h16v10H8l-4 4V6Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const SupportIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M5 12a7 7 0 0 1 14 0v3a2 2 0 0 1-2 2h-1v-5h3M5 12v3a2 2 0 0 0 2 2h1v-5H5Zm7 5v1a2 2 0 0 0 2 2h1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2 2 0 0 0 4 0"
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
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M19.4 13a7.7 7.7 0 0 0 .05-2l2-1.2-2-3.4-2.3.6a7.6 7.6 0 0 0-1.7-1L15 3.5h-6l-.45 2.5a7.6 7.6 0 0 0-1.7 1L4.55 6.4l-2 3.4 2 1.2a7.7 7.7 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6a7.6 7.6 0 0 0 1.7 1l.45 2.5h6l.45-2.5a7.6 7.6 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const BillingIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M3.5 7.5h17v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 10h17M7 14.5h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SignOutIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10M14 8l4 4-4 4M9 12h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function isItemActive(activePath: string, item: NavItem) {
  if (item.kind === "action") return false;
  if (item.label === "Continue Learning") {
    return activePath === "/continue-learning";
  }
  if (item.href === "/tasks") {
    return activePath === "/tasks" || activePath.startsWith("/tasks/");
  }
  if (item.href === "/billing") {
    return activePath === "/billing" || activePath.startsWith("/payment");
  }
  if (item.href === "/notifications") {
    return activePath === "/notifications";
  }
  if (item.href === "/achievements") {
    return activePath === "/achievements";
  }
  if (item.href === "/settings") {
    return activePath === "/settings";
  }
  return activePath === item.href || activePath.startsWith(`${item.href}/`);
}

function SidebarFooter({
  name,
  email,
  avatarUrl,
  plan,
  monthsRemaining,
  accessElapsedPercent,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  plan: string | null;
  monthsRemaining: number | null;
  accessElapsedPercent: number;
}) {
  const initials = initialsFromName(name);
  const accessLabel =
    monthsRemaining === null
      ? "Not enrolled"
      : monthsRemaining === 1
        ? "1 month remaining"
        : `${monthsRemaining} months remaining`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-foreground ring-1 ring-line">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {name}
          </p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
      </div>

      <StatusPill
        label={`${planLabel(plan, true)} Plan`}
        variant={planPillVariant(plan)}
      />

      <div className="rounded-xl border border-line bg-surface-2 px-3 py-3">
        <p className="text-sm font-semibold text-foreground">Program Access</p>
        <p className="mt-0.5 text-xs text-muted">{accessLabel}</p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent-green transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(0, accessElapsedPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export async function PortalShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, notifications, journey] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, email, plan, avatar_url")
      .eq("id", user.id)
      .single(),
    getNotifications(user.id),
    getStudentJourneySummary(user.id),
  ]);

  const profileData = profile as {
    name: string;
    email: string;
    plan: string | null;
    avatar_url: string | null;
  } | null;

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const name = profileData?.name ?? "Student";
  const email = profileData?.email ?? "";

  const navGroups: NavGroup[] = [
    {
      title: "Academy",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: DashboardIcon,
        },
        {
          label: "Continue Learning",
          href: "/continue-learning",
          icon: ContinueIcon,
          emphasis: "primary" as const,
        },
        {
          label: "Roadmap",
          href: "/roadmap",
          icon: RoadmapIcon,
        },
        {
          label: "Tasks",
          href: "/tasks",
          icon: TasksIcon,
        },
        {
          label: "Achievements",
          href: "/achievements",
          icon: AchievementsIcon,
        },
      ],
    },
    {
      title: "Connect",
      items: [
        {
          label: "AI Mentor",
          href: "/ai-mentor",
          icon: AiIcon,
          pillBadge: { label: "AI", tone: "ai" as const },
        },
        {
          label: "Community",
          href: "/community",
          icon: CommunityIcon,
        },
        {
          label: "Sessions",
          href: "/sessions",
          icon: SessionsIcon,
        },
        {
          label: "Messages",
          href: "/messages",
          icon: MessagesIcon,
        },
        {
          label: "Support",
          href: "/support",
          icon: SupportIcon,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: BellIcon,
          badge: unreadCount,
        },
        {
          label: "Settings",
          href: "/settings",
          icon: SettingsIcon,
        },
        {
          label: "Billing",
          href: "/billing",
          icon: BillingIcon,
        },
        {
          label: "Sign out",
          href: "/auth/signout",
          icon: SignOutIcon,
          kind: "action" as const,
          action: "/auth/signout",
        },
      ],
    },
  ];

  const groups: NavGroup[] = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: isItemActive(activePath, item),
    })),
  }));

  const footer = (
    <SidebarFooter
      name={name}
      email={email}
      avatarUrl={profileData?.avatar_url ?? null}
      plan={profileData?.plan ?? null}
      monthsRemaining={journey.monthsRemaining}
      accessElapsedPercent={journey.accessElapsedPercent}
    />
  );

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <NavSidebar
          groups={groups}
          brand={<Logo size="md" showTagline />}
          footer={footer}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3 md:hidden">
            <MobileNav
              groups={groups}
              brand={<Logo size="sm" />}
              footer={footer}
            />
            <Logo size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
