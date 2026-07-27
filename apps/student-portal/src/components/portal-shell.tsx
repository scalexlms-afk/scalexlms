import { StatusPill } from "@scalex/ui";
import type { NavGroup } from "@scalex/ui";
import Image from "next/image";
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
import { planLabel, planPillVariant } from "@scalex/db";
import { getSessionProfile } from "@/lib/auth";
import { getNotifications, getStudentJourneySummary } from "@/lib/data";
import { PortalChrome } from "@/components/portal-chrome";
import { redirect } from "next/navigation";

const navIcon = "h-4 w-4";

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
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
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

      <div className="rounded-[var(--radius-card)] border border-line px-3 py-3 metallic-graphite metallic-edge">
        <p className="text-sm font-semibold text-foreground">Program Access</p>
        <p className="mt-0.5 text-xs text-muted">{accessLabel}</p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-scalex-red-dark to-scalex-red shadow-[0_0_12px_-2px_rgba(227,30,36,0.6)] transition-[width] duration-500"
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
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (session.profile.role !== "student") redirect("/unauthorized");

  const { userId, profile } = session;

  const [notifications, journey] = await Promise.all([
    getNotifications(userId),
    getStudentJourneySummary(userId),
  ]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const name = profile.name ?? "Student";
  const email = profile.email ?? "";

  const groups: NavGroup[] = [
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
          label: "Live Classes",
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

  const footer = (
    <SidebarFooter
      name={name}
      email={email}
      avatarUrl={profile.avatar_url ?? null}
      plan={profile.plan ?? null}
      monthsRemaining={journey.monthsRemaining}
      accessElapsedPercent={journey.accessElapsedPercent}
    />
  );

  return (
    <PortalChrome groups={groups} footer={footer}>
      {children}
    </PortalChrome>
  );
}
