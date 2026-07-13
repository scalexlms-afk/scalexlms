import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile } from "@/lib/auth";
import {
  getAiInsights,
  getDashboardStats,
  getMilestoneCompletionRates,
  getRevenueSeries,
  getStudentGrowthSeries,
} from "@/lib/data";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/format";
import { canAccess } from "@scalex/db/rbac";
import {
  BarChartCard,
  Card,
  DonutChart,
  KpiCard,
  LineChartCard,
  StatusPill,
} from "@scalex/ui";

const iconClass = "h-5 w-5";

export default async function AdminDashboardPage() {
  const { profile, userId } = await requireAdminProfile();
  const scope = { userId, role: profile.role };

  const [stats, revenueSeries, growthSeries, milestoneRates, insights] =
    await Promise.all([
      getDashboardStats(scope),
      getRevenueSeries(scope),
      getStudentGrowthSeries(scope),
      getMilestoneCompletionRates(scope),
      getAiInsights(scope),
    ]);

  const showReviews = canAccess(profile.role, "task_review");
  const showCommunity = canAccess(profile.role, "community");
  const showSessions = canAccess(profile.role, "live_sessions");
  const showStudents = canAccess(profile.role, "student_management");
  const showFinance = canAccess(profile.role, "finance");

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
          <p className="mt-1 text-muted">
            Live business metrics from your academy data layer.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {showFinance && (
            <KpiCard
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              iconColor="bg-accent-green/15 text-accent-green"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                  <path
                    d="M12 3v18M8 7h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
          )}
          {showStudents && (
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
              <KpiCard
                label="MoM Growth"
                value={formatPercent(stats.momGrowth)}
                delta={`${stats.studentsThisMonth} this month`}
                deltaPositive={stats.momGrowth >= 0}
                iconColor="bg-accent-amber/15 text-accent-amber"
              />
            </>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {showFinance && (
            <LineChartCard
              title="Revenue Overview"
              data={revenueSeries}
              valuePrefix="$"
            />
          )}
          {showStudents && (
            <BarChartCard title="Student Growth" data={growthSeries} />
          )}
        </div>

        {showStudents && milestoneRates.length > 0 && (
          <DonutChart
            title="Completion Rate by Milestone (%)"
            data={milestoneRates}
          />
        )}

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

        {insights.length > 0 && (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              AI Insights
            </h2>
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
                    <p className="text-xs text-subtle">
                      {item.note}
                    </p>
                    <StatusPill label="View" variant={item.variant} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
