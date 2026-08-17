import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile } from "@/lib/auth";
import {
  getAiInsights,
  getAssignedStudentSummary,
  getCommunityModerationStats,
  getContentHealthStats,
  getCrmPipelineCounts,
  getDashboardStats,
  getLiveSessions,
  getMilestoneCompletionRates,
  getOpenSupportTicketCount,
  getRecentAuditLogs,
  getRevenueSeries,
  getStudentGrowthSeries,
} from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { canAccess } from "@scalex/db/rbac";
import {
  BarChartCard,
  DonutChart,
  LineChartCard,
  StatusPill,
} from "@scalex/ui";

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const QUICK_ACTIONS = [
  { href: "/content", label: "New course" },
  { href: "/content", label: "Add Lesson" },
  { href: "/sessions", label: "Schedule Live Class" },
  { href: "/reviews", label: "Review Tasks", badgeKey: "reviews" as const },
  { href: "/students", label: "Add Student" },
  { href: "/community", label: "Create Announcement" },
] as const;

export default async function AdminDashboardPage() {
  const { profile, userId } = await requireAdminProfile();
  const scope = { userId, role: profile.role };
  const role = profile.role;

  const showReviews = canAccess(role, "task_review");
  const showCommunity = canAccess(role, "community");
  const showSessions = canAccess(role, "live_sessions");
  const showStudents = canAccess(role, "student_management");
  const showFinance = canAccess(role, "finance");
  const showCrm = canAccess(role, "crm");
  const showContent = canAccess(role, "course_content");

  const [stats, revenueSeries, growthSeries, milestoneRates, insights] =
    await Promise.all([
      getDashboardStats(scope),
      getRevenueSeries(scope),
      getStudentGrowthSeries(scope),
      getMilestoneCompletionRates(scope),
      getAiInsights(scope),
    ]);

  const [
    pipeline,
    contentHealth,
    assigned,
    communityStats,
    sessions,
    activity,
    supportOpen,
  ] = await Promise.all([
    showCrm ? getCrmPipelineCounts(scope) : Promise.resolve([]),
    showContent && (role === "instructor" || role === "super_admin")
      ? getContentHealthStats()
      : Promise.resolve(null),
    role === "mentor" || role === "sales"
      ? getAssignedStudentSummary(scope)
      : Promise.resolve(null),
    showCommunity
      ? getCommunityModerationStats()
      : Promise.resolve({ pendingCount: 0, postsThisWeek: 0 }),
    showSessions ? getLiveSessions() : Promise.resolve([]),
    getRecentAuditLogs(8),
    showStudents
      ? getOpenSupportTicketCount(scope)
      : Promise.resolve(0),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const upcomingSessions = sessions
    .filter((s) => new Date(s.scheduled_at).getTime() > Date.now())
    .slice(0, 4);
  const nextSession = upcomingSessions[0] ?? null;

  const studentCount =
    role === "mentor" ? (assigned?.assignedCount ?? 0) : stats.totalStudents;

  const momHint = (value: number) =>
    `${value >= 0 ? "↑" : "↓"} ${formatPercent(Math.abs(value))} vs last month`;

  return (
    <AdminShell activePath="/">
      <AdminPageHeader
        title="Dashboard"
        description="Track performance, manage students and grow ScaleX Academy."
        searchPlaceholder="Search anything..."
      />

      <div className="rounded-2xl border border-scalex-red/20 bg-scalex-red/5 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-foreground sm:text-xl">
              Welcome Back, {profile.name}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Live academy control room · {today}
            </p>
          </div>
          <span className="inline-flex items-center rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-muted">
            {today}
          </span>
        </div>
      </div>

      <AdminKpiGrid
        items={[
          ...(showStudents
            ? [
                {
                  label: "Total Students",
                  value: String(studentCount),
                  hint: momHint(stats.momGrowth),
                },
                {
                  label: "Active Students",
                  value: String(stats.activeStudents),
                  tone: "success" as const,
                  hint:
                    studentCount > 0
                      ? `${((stats.activeStudents / studentCount) * 100).toFixed(1)}% of total`
                      : undefined,
                },
              ]
            : []),
          ...(showFinance
            ? [
                {
                  label: "Total Revenue",
                  value: formatCurrency(stats.totalRevenue),
                  hint: "Paid volume",
                  tone: "success" as const,
                },
              ]
            : []),
          ...(showContent && contentHealth
            ? [
                {
                  label: "Total Courses",
                  value: String(contentHealth.totalCourses),
                },
              ]
            : []),
          ...(showStudents
            ? [
                {
                  label: "Premium Students",
                  value: String(stats.premiumStudents),
                },
                {
                  label: "Completion Rate",
                  value: formatPercent(stats.completionRate),
                },
              ]
            : []),
        ].slice(0, 6)}
      />

      {role === "super_admin" || role === "instructor" ? (
        <AdminPanel title="Quick Actions">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {QUICK_ACTIONS.map((action) => {
              const badge =
                "badgeKey" in action &&
                action.badgeKey === "reviews" &&
                stats.pendingReviews > 0
                  ? ` (${stats.pendingReviews})`
                  : "";
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="rounded-xl border border-scalex-red/25 bg-scalex-red/5 px-3 py-3 text-center text-xs font-semibold text-scalex-red transition hover:bg-scalex-red/10"
                >
                  {action.label}
                  {badge}
                </Link>
              );
            })}
          </div>
        </AdminPanel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel
          title="Today’s Action Center"
          action={
            showReviews ? (
              <Link
                href="/reviews"
                className="text-xs font-semibold text-scalex-red"
              >
                View All
              </Link>
            ) : null
          }
        >
          <div className="space-y-3">
            {showReviews ? (
              <Link
                href="/reviews"
                className="flex items-center justify-between rounded-xl border border-line bg-surface-3/70 px-4 py-3 hover:border-scalex-red/40"
              >
                <span className="text-sm font-medium">Pending Task Reviews</span>
                <span className="font-display text-lg font-bold text-scalex-red">
                  {stats.pendingReviews}
                </span>
              </Link>
            ) : null}
            {showStudents ? (
              <Link
                href="/support"
                className="flex items-center justify-between rounded-xl border border-line bg-surface-3/70 px-4 py-3 hover:border-scalex-red/40"
              >
                <span className="text-sm font-medium">Open Support Tickets</span>
                <span className="font-display text-lg font-bold">
                  {supportOpen}
                </span>
              </Link>
            ) : null}
            {showCommunity ? (
              <Link
                href="/community"
                className="flex items-center justify-between rounded-xl border border-line bg-surface-3/70 px-4 py-3 hover:border-scalex-red/40"
              >
                <span className="text-sm font-medium">
                  Community Moderation
                </span>
                <span className="font-display text-lg font-bold">
                  {stats.communityModeration}
                </span>
              </Link>
            ) : null}
            {showSessions ? (
              <Link
                href="/sessions"
                className="flex items-center justify-between rounded-xl border border-line bg-surface-3/70 px-4 py-3 hover:border-scalex-red/40"
              >
                <span className="text-sm font-medium">Upcoming Sessions</span>
                <span className="font-display text-lg font-bold">
                  {stats.upcomingSessions}
                </span>
              </Link>
            ) : null}
            {insights.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-line bg-surface-3/70 px-4 py-3 hover:border-scalex-red/40"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span className="font-display text-lg font-bold">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel
          title="Student Progress Overview"
          action={
            showStudents ? (
              <Link
                href="/analytics"
                className="text-xs font-semibold text-scalex-red"
              >
                View Report
              </Link>
            ) : null
          }
        >
          {milestoneRates.length > 0 ? (
            <div className="space-y-3">
              {milestoneRates.slice(0, 6).map((row) => (
                <div key={row.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {row.name}
                    </span>
                    <span className="text-muted">
                      {formatPercent(row.value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-scalex-red"
                      style={{
                        width: `${Math.min(100, Math.max(0, row.value))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No milestone progress yet.</p>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel
          title="Recent Student Activity"
          action={
            <Link
              href="/students"
              className="text-xs font-semibold text-scalex-red"
            >
              View All
            </Link>
          }
        >
          {activity.length === 0 ? (
            <p className="text-sm text-muted">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((entry) => {
                const actor = entry.actor as { name: string } | null;
                return (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {actor?.name ?? "System"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {entry.action.replace(/\./g, " · ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-subtle">
                      {relativeTime(entry.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminPanel>

        {showSessions ? (
          <AdminPanel
            title="Live Classes"
            action={
              <Link
                href="/sessions"
                className="text-xs font-semibold text-scalex-red"
              >
                View Schedule
              </Link>
            }
          >
            {nextSession ? (
              <div className="rounded-xl border border-scalex-red/20 bg-scalex-red/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Next session
                </p>
                <p className="mt-1 font-display text-base font-semibold">
                  {nextSession.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(nextSession.scheduled_at).toLocaleString()}
                  {nextSession.host?.name
                    ? ` · ${nextSession.host.name}`
                    : ""}
                </p>
                {nextSession.meeting_url ? (
                  <a
                    href={nextSession.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-primary mt-3 inline-flex"
                  >
                    Join
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted">No upcoming live classes.</p>
            )}
            {upcomingSessions.length > 1 ? (
              <ul className="mt-4 space-y-2">
                {upcomingSessions.slice(1).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate font-medium">{s.title}</span>
                    <span className="shrink-0 text-xs text-subtle">
                      {new Date(s.scheduled_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </AdminPanel>
        ) : (
          <AdminPanel title="AI Insights">
            {insights.length === 0 ? (
              <p className="text-sm text-muted">No insights yet.</p>
            ) : (
              <div className="space-y-3">
                {insights.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-xl border border-line bg-surface-3/60 p-3 hover:border-scalex-red/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <StatusPill
                        label={String(item.count)}
                        variant={item.variant}
                      />
                    </div>
                    <p className="mt-1 text-xs text-subtle">{item.note}</p>
                  </Link>
                ))}
              </div>
            )}
          </AdminPanel>
        )}
      </div>

      {showCrm && pipeline.length > 0 ? (
        <AdminPanel
          title="CRM Pipeline"
          action={
            <Link href="/crm" className="text-sm font-semibold text-scalex-red">
              Open CRM
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pipeline.map((row) => (
              <div
                key={row.stage}
                className="rounded-xl border border-line bg-surface-3/60 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wider text-muted">
                  {stageLabel(row.stage)}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {row.count}
                </p>
              </div>
            ))}
          </div>
        </AdminPanel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {showFinance ? (
          <AdminPanel title="Revenue Overview" className="lg:col-span-1">
            <LineChartCard title="" data={revenueSeries} valuePrefix="$" />
          </AdminPanel>
        ) : null}
        {showCommunity ? (
          <AdminPanel
            title="Community Overview"
            action={
              <Link
                href="/community"
                className="text-xs font-semibold text-scalex-red"
              >
                Go to Community →
              </Link>
            }
          >
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Pending Posts</dt>
                <dd className="font-semibold">{communityStats.pendingCount}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Posts This Week</dt>
                <dd className="font-semibold">{communityStats.postsThisWeek}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Moderation Queue</dt>
                <dd className="font-semibold">{stats.communityModeration}</dd>
              </div>
            </dl>
          </AdminPanel>
        ) : showStudents ? (
          <AdminPanel title="Student Growth">
            <BarChartCard title="" data={growthSeries} />
          </AdminPanel>
        ) : null}
        <AdminPanel
          title="AI Insights"
          action={
            <Link
              href="/analytics"
              className="text-xs font-semibold text-scalex-red"
            >
              Open Analytics →
            </Link>
          }
        >
          {insights.length === 0 ? (
            <p className="text-sm text-muted">No insights yet.</p>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border border-line bg-surface-3/60 p-3 hover:border-scalex-red/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <StatusPill
                      label={String(item.count)}
                      variant={item.variant}
                    />
                  </div>
                  <p className="mt-1 text-xs text-subtle">{item.note}</p>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>

      {showStudents && milestoneRates.length > 0 ? (
        <AdminPanel title="Completion Rate by Milestone">
          <DonutChart title="" data={milestoneRates} />
        </AdminPanel>
      ) : null}
    </AdminShell>
  );
}
