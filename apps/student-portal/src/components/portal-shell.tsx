import {
  NavSidebar,
  MobileNav,
  Logo,
  ThemeToggle,
  StatusPill,
} from "@scalex/ui";
import type { NavGroup, NavItem } from "@scalex/ui";
import {
  Bell,
  ChatCircle,
  CheckSquare,
  CreditCard,
  Gear,
  Lifebuoy,
  MapTrifold,
  PlayCircle,
  Robot,
  SignOut,
  SquaresFour,
  Trophy,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@scalex/db/server";
import { planLabel, planPillVariant } from "@scalex/db";
import { redirect } from "next/navigation";
import { getNotifications, getStudentJourneySummary } from "@/lib/data";

const navIcon = "h-4 w-4";

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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-foreground ring-1 ring-line metallic-edge">
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

      <div className="rounded-xl border border-line bg-surface-2/80 px-3 py-3 metallic-edge">
        <p className="text-sm font-semibold text-foreground">Program Access</p>
        <p className="mt-0.5 text-xs text-muted">{accessLabel}</p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-scalex-red transition-[width] duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, accessElapsedPercent))}%`,
            }}
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
          icon: <SquaresFour weight="duotone" className={navIcon} />,
        },
        {
          label: "Continue Learning",
          href: "/continue-learning",
          icon: <PlayCircle weight="duotone" className={navIcon} />,
          emphasis: "primary" as const,
        },
        {
          label: "Roadmap",
          href: "/roadmap",
          icon: <MapTrifold weight="duotone" className={navIcon} />,
        },
        {
          label: "Tasks",
          href: "/tasks",
          icon: <CheckSquare weight="duotone" className={navIcon} />,
        },
        {
          label: "Achievements",
          href: "/achievements",
          icon: <Trophy weight="duotone" className={navIcon} />,
        },
      ],
    },
    {
      title: "Connect",
      items: [
        {
          label: "AI Mentor",
          href: "/ai-mentor",
          icon: <Robot weight="duotone" className={navIcon} />,
          pillBadge: { label: "AI", tone: "ai" as const },
        },
        {
          label: "Community",
          href: "/community",
          icon: <UsersThree weight="duotone" className={navIcon} />,
        },
        {
          label: "Sessions",
          href: "/sessions",
          icon: <VideoCamera weight="duotone" className={navIcon} />,
        },
        {
          label: "Messages",
          href: "/messages",
          icon: <ChatCircle weight="duotone" className={navIcon} />,
        },
        {
          label: "Support",
          href: "/support",
          icon: <Lifebuoy weight="duotone" className={navIcon} />,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: <Bell weight="duotone" className={navIcon} />,
          badge: unreadCount,
        },
        {
          label: "Settings",
          href: "/settings",
          icon: <Gear weight="duotone" className={navIcon} />,
        },
        {
          label: "Billing",
          href: "/billing",
          icon: <CreditCard weight="duotone" className={navIcon} />,
        },
        {
          label: "Sign out",
          href: "/auth/signout",
          icon: <SignOut weight="bold" className={navIcon} />,
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
    <div className="flex min-h-screen bg-surface">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <NavSidebar
          groups={groups}
          brand={<Logo size="md" showTagline />}
          footer={footer}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line glass-strong px-4 py-3">
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
