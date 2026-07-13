import {
  NavSidebar,
  MobileNav,
  Logo,
  NotificationBell,
  ThemeToggle,
  StatusPill,
} from "@scalex/ui";
import type { NavGroup } from "@scalex/ui";
import { createClient } from "@scalex/db/server";
import { planLabel, planPillVariant } from "@scalex/db";
import { redirect } from "next/navigation";
import { getNotifications } from "@/lib/data";
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

const RoadmapIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M9 6 4 4v14l5 2 6-2 5 2V6l-5-2-6 2Zm0 0v14m6-16v14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AiIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M12 3 14.5 8.5 20 9.5 16 14l1 5.5L12 17l-5 2.5 1-5.5L4 9.5l5.5-1L12 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
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
      d="M4 6h16v12H4V6Zm4 14h8M8 10h8M8 14h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SupportIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden="true">
    <path
      d="M12 21a9 9 0 1 0-9-9c0 1.6.4 3.1 1.2 4.4L3 21l4.6-1.2A8.9 8.9 0 0 0 12 21Z"
      stroke="currentColor"
      strokeWidth="1.8"
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

const navGroups: NavGroup[] = [
  {
    title: "Academy",
    items: [
      { label: "Dashboard", href: "/dashboard", active: false, icon: DashboardIcon },
      { label: "Roadmap", href: "/roadmap", active: false, icon: RoadmapIcon },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "AI Mentor", href: "/ai-mentor", active: false, icon: AiIcon },
      { label: "Community", href: "/community", active: false, icon: CommunityIcon },
      { label: "Sessions", href: "/sessions", active: false, icon: SessionsIcon },
      { label: "Messages", href: "/messages", active: false, icon: MessagesIcon },
      { label: "Support", href: "/support", active: false, icon: SupportIcon },
    ],
  },
];

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

  const [{ data: profile }, notifications] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, email, plan")
      .eq("id", user.id)
      .single(),
    getNotifications(user.id),
  ]);

  const profileData = profile as {
    name: string;
    email: string;
    plan: string | null;
  } | null;

  const groups = navGroups.map((g) => ({
    ...g,
    items: g.items.map((item) => ({
      ...item,
      active: activePath === item.href,
    })),
  }));

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <NavSidebar
          groups={groups}
          brand={<Logo size="md" showTagline />}
          footer={
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {profileData?.name ?? "Student"}
              </p>
              <p className="truncate text-xs text-muted">
                {profileData?.email}
              </p>
              <div className="mt-2">
                <StatusPill
                  label={planLabel(profileData?.plan, true)}
                  variant={planPillVariant(profileData?.plan)}
                />
              </div>
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
              footer={
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {profileData?.name ?? "Student"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {profileData?.email}
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
          <div className="ml-auto flex items-center gap-3">
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
