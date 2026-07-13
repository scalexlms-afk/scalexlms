import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile } from "@/lib/auth";
import {
  getAiInsights,
  getAssignedStudentSummary,
  getContentHealthStats,
  getCrmPipelineCounts,
  getDashboardStats,
  getMilestoneCompletionRates,
  getRevenueSeries,
  getStudentGrowthSeries,
} from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { canAccess } from "@scalex/db/rbac";
import {
  BarChartCard,
  Card,
  DonutChart,
  KpiCard,
  LineChartCard,
  StatusPill,
} from "@scalex/ui";

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActionLink({
  href,
  title,
  count,
  note,
}: {
  href: string;
  title: string;
  count: number | string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-line bg-surface-3 p-4 transition-colors hover:border-scalex-red/30"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        <span className="font-display text-xl font-bold">{count}</span>
      </div>
      <p className="mt-1 text-xs text-subtle">{note}</p>
    </Link>
  );
}

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

  const [pipeline, contentHealth, assigned] = await Promise.all([
    showCrm ? getCrmPipelineCounts(scope) : Promise.resolve([]),
    showContent && (role === "instructor" || role === "super_admin")
      ? getContentHealthStats()
      : Promise.resolve(null),
    role === "mentor" || role === "sales"
      ? getAssignedStudentSummary(scope)
      : Promise.resolve(null),
  ]);

  const subtitle =
    role === "sales"
      ? "Your pipeline and converted students."
      : role === "mentor"
        ? "Your assigned students and review queue."
        : role === "instructor"
          ? "Curriculum health, reviews, and sessions."
          : "Live business metrics from your academy data layer.";

  return (
    <AdminShell activePath="/">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Welcome back, {profile.name}
          </h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>

        {/* Sales-first: pipeline */}
        {role === "sales" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {showFinance && (
                <KpiCard
                  label="Pipeline revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  iconColor="bg-accent-green/15 text-accent-green"
                />
              )}
              <KpiCard
                label="Converted students"
                value={String(assigned?.assignedCount ?? stats.totalStudents)}
              />
              <KpiCard
                label="Active students"
                value={String(stats.activeStudents)}
              />
            </div>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">
                  CRM pipeline
                </h2>
                <Link
                  href="/crm"
                  className="text-sm font-medium text-scalex-red hover:underline"
                >
                  Open CRM
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pipeline.map((row) => (
                  <div
                    key={row.stage}
                    className="rounded-xl border border-line bg-surface-2 px-4 py-3"
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
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <ActionLink
                href="/students"
                title="My students"
                count={assigned?.assignedCount ?? 0}
                note="Converted enrollments in your book"
              />
              <ActionLink
                href="/crm"
                title="Payment risk"
                count={
                  insights.find((i) => i.id === "payment-risk")?.count ?? 0
                }
                note="Pending or overdue balances"
              />
            </div>
          </>
        )}

        {/* Mentor-first */}
        {role === "mentor" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="My students"
                value={String(assigned?.assignedCount ?? 0)}
              />
              <KpiCard
                label="At risk"
                value={String(assigned?.atRiskCount ?? 0)}
                iconColor="bg-accent-amber/15 text-accent-amber"
              />
              {showReviews && (
                <KpiCard
                  label="Pending reviews"
                  value={String(stats.pendingReviews)}
                  iconColor="bg-accent-amber/15 text-accent-amber"
                />
              )}
              {showCommunity && (
                <KpiCard
                  label="Moderation queue"
                  value={String(stats.communityModeration)}
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showReviews && (
                <ActionLink
                  href="/reviews"
                  title="Review center"
                  count={stats.pendingReviews}
                  note="Submissions waiting on you"
                />
              )}
              <ActionLink
                href="/students"
                title="Student roster"
                count={assigned?.assignedCount ?? 0}
                note="Assigned learners"
              />
              <ActionLink
                href="/messages"
                title="Student chat"
                count="Open"
                note="Message your assigned students"
              />
              {showCommunity && (
                <ActionLink
                  href="/community"
                  title="Community"
                  count={stats.communityModeration}
                  note="Pending posts to moderate"
                />
              )}
              {showSessions && (
                <ActionLink
                  href="/sessions"
                  title="Upcoming sessions"
                  count={stats.upcomingSessions}
                  note="Live classes on the calendar"
                />
              )}
            </div>
          </>
        )}

        {/* Instructor-first */}
        {role === "instructor" && (
          <>
            {contentHealth && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Courses"
                  value={String(contentHealth.totalCourses)}
                />
                <KpiCard
                  label="Published"
                  value={String(contentHealth.published)}
                  iconColor="bg-accent-green/15 text-accent-green"
                />
                <KpiCard label="Draft" value={String(contentHealth.draft)} />
                <KpiCard
                  label="Lessons"
                  value={String(contentHealth.lessonCount)}
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ActionLink
                href="/content"
                title="Content management"
                count={contentHealth?.taskCount ?? 0}
                note="Gating tasks across curriculum"
              />
              {showReviews && (
                <ActionLink
                  href="/reviews"
                  title="Pending reviews"
                  count={stats.pendingReviews}
                  note="Student submissions"
                />
              )}
              {showSessions && (
                <ActionLink
                  href="/sessions"
                  title="Live sessions"
                  count={stats.upcomingSessions}
                  note="Upcoming classes"
                />
              )}
              {showCommunity && (
                <ActionLink
                  href="/community"
                  title="Moderation"
                  count={stats.communityModeration}
                  note="Posts awaiting approval"
                />
              )}
            </div>
          </>
        )}

        {/* Super admin / shared academy KPIs */}
        {(role === "super_admin" ||
          role === "instructor" ||
          role === "mentor") && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {role === "super_admin" && showFinance && (
              <KpiCard
                label="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                iconColor="bg-accent-green/15 text-accent-green"
              />
            )}
            {showStudents && role !== "mentor" && (
              <>
                <KpiCard
                  label="Total Students"
                  value={String(stats.totalStudents)}
                  iconColor="bg-accent-blue/15 text-accent-blue"
                />
                <KpiCard
                  label="Active Students"
                  value={String(stats.activeStudents)}
                  iconColor="bg-accent-green/15 text-accent-green"
                />
                <KpiCard
                  label="Premium"
                  value={String(stats.premiumStudents)}
                  delta={`${stats.standardStudents} Standard`}
                  iconColor="bg-scalex-red/15 text-scalex-red"
                />
                <KpiCard
                  label="Completion Rate"
                  value={formatPercent(stats.completionRate)}
                  iconColor="bg-accent-purple/15 text-accent-purple"
                />
                {role === "super_admin" && (
                  <KpiCard
                    label="MoM Growth"
                    value={formatPercent(stats.momGrowth)}
                    delta={`${stats.studentsThisMonth} this month`}
                    deltaPositive={stats.momGrowth >= 0}
                    iconColor="bg-accent-amber/15 text-accent-amber"
                  />
                )}
              </>
            )}
          </div>
        )}

        {role === "super_admin" && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {showReviews && (
              <KpiCard
                label="Pending Reviews"
                value={String(stats.pendingReviews)}
                iconColor="bg-accent-amber/15 text-accent-amber"
              />
            )}
            {showCommunity && (
              <KpiCard
                label="Moderation Queue"
                value={String(stats.communityModeration)}
                iconColor="bg-accent-purple/15 text-accent-purple"
              />
            )}
            {showSessions && (
              <KpiCard
                label="Upcoming Sessions"
                value={String(stats.upcomingSessions)}
                iconColor="bg-accent-blue/15 text-accent-blue"
              />
            )}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {showFinance && role !== "sales" && (
            <LineChartCard
              title="Revenue Overview"
              data={revenueSeries}
              valuePrefix="$"
            />
          )}
          {showStudents && role !== "sales" && (
            <BarChartCard title="Student Growth" data={growthSeries} />
          )}
        </div>

        {showStudents &&
          role !== "sales" &&
          milestoneRates.length > 0 && (
            <DonutChart
              title="Completion Rate by Milestone (%)"
              data={milestoneRates}
            />
          )}

        {insights.length > 0 && role !== "sales" && (
          <Card>
            <h2 className="font-display text-lg font-semibold">AI Insights</h2>
            <p className="mt-1 text-sm text-muted">
              Signals detected from student activity, reviews, and payments.
            </p>
            <div className="mt-4 space-y-3">
              {insights.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border border-line bg-surface-3 p-3 transition-colors hover:border-scalex-red/30"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="font-display text-lg font-bold">
                      {item.count}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-subtle">{item.note}</p>
                    <StatusPill label="View" variant={item.variant} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {role === "sales" && insights.length > 0 && (
          <Card>
            <h2 className="font-display text-lg font-semibold">Signals</h2>
            <div className="mt-4 space-y-3">
              {insights
                .filter((i) => i.id !== "pending-reviews")
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-xl border border-line bg-surface-3 p-3 transition-colors hover:border-scalex-red/30"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="font-display text-lg font-bold">
                        {item.count}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-subtle">{item.note}</p>
                  </Link>
                ))}
            </div>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
