import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { canAccess } from "@scalex/db/rbac";
import { Card, KpiCard, StatusPill } from "@scalex/ui";

const iconClass = "h-5 w-5";

export default async function AdminDashboardPage() {
  const { profile } = await requireAdminProfile();
  const stats = await getDashboardStats();

  const showReviews = canAccess(profile.role, "task_review");
  const showCommunity = canAccess(profile.role, "community");
  const showSessions = canAccess(profile.role, "live_sessions");
  const showStudents = canAccess(profile.role, "student_management");

  const insights = [
    showReviews && {
      title: "Pending Reviews",
      count: stats.pendingReviews,
      variant: "pending" as const,
      note: "Task submissions awaiting review",
      href: "/reviews",
    },
    showCommunity && {
      title: "Community Moderation",
      count: stats.communityModeration,
      variant: "review" as const,
      note: "Posts awaiting approval",
      href: "/community",
    },
    showSessions && {
      title: "Upcoming Sessions",
      count: stats.upcomingSessions,
      variant: "not_started" as const,
      note: "Live sessions scheduled ahead",
      href: "/sessions",
    },
  ].filter(Boolean) as {
    title: string;
    count: number;
    variant: "pending" | "review" | "not_started";
    note: string;
    href: string;
  }[];

  return (
    <AdminShell activePath="/">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Welcome back, {profile.name}
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Your academy control room — live counts from Supabase.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {showReviews && (
            <KpiCard
              label="Pending Reviews"
              value={String(stats.pendingReviews)}
              iconColor="bg-accent-amber/15 text-accent-amber"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                  <path
                    d="m9 12 2 2 4-4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}
          {showCommunity && (
            <KpiCard
              label="Moderation Queue"
              value={String(stats.communityModeration)}
              iconColor="bg-accent-purple/15 text-accent-purple"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                  <path
                    d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}
          {showSessions && (
            <KpiCard
              label="Upcoming Sessions"
              value={String(stats.upcomingSessions)}
              iconColor="bg-accent-blue/15 text-accent-blue"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}
          {showStudents && (
            <KpiCard
              label="Active Students"
              value={String(stats.activeStudents)}
              iconColor="bg-accent-green/15 text-accent-green"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                  <path
                    d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}
        </div>

        {insights.length > 0 && (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              Action Queue
            </h2>
            <div className="mt-4 space-y-3">
              {insights.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block rounded-xl border border-white/[0.06] bg-scalex-charcoal-alt p-3 transition-colors hover:border-scalex-red/30"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="font-display text-lg font-bold">
                      {item.count}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-text-tertiary-dark">
                      {item.note}
                    </p>
                    <StatusPill label="View" variant={item.variant} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {insights.length === 0 && (
          <Card>
            <p className="text-sm text-text-secondary-dark">
              No action queues available for your role. Contact a super admin if
              you need additional access.
            </p>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
