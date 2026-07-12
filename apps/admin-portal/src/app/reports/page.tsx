import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getReportsSummary } from "@/lib/data";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/format";
import {
  BarChartCard,
  Card,
  DonutChart,
  KpiCard,
  LineChartCard,
} from "@scalex/ui";

export default async function ReportsPage() {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "reports");

  const { stats, revenueSeries, growthSeries, milestoneRates } =
    await getReportsSummary({ userId, role: profile.role });

  return (
    <AdminShell activePath="/reports">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Reports
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Academy Reports
          </h1>
          <p className="mt-1 text-muted">
            Revenue, growth, and completion summaries for export and review.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
          />
          <KpiCard label="Total Students" value={String(stats.totalStudents)} />
          <KpiCard
            label="Completion Rate"
            value={formatPercent(stats.completionRate)}
          />
          <KpiCard
            label="MoM Growth"
            value={formatPercent(stats.momGrowth)}
            deltaPositive={stats.momGrowth >= 0}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <LineChartCard
            title="Revenue Overview"
            data={revenueSeries}
            valuePrefix="$"
          />
          <BarChartCard title="Student Growth" data={growthSeries} />
        </div>

        <DonutChart
          title="Completion Rate by Milestone (%)"
          data={milestoneRates}
        />

        <Card>
          <h2 className="font-display text-lg font-semibold">Export Summary</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-surface-3 p-4 text-xs text-muted">
            {JSON.stringify(
              {
                generatedAt: new Date().toISOString(),
                stats,
                revenueSeries,
                growthSeries,
                milestoneRates,
              },
              null,
              2
            )}
          </pre>
        </Card>
      </div>
    </AdminShell>
  );
}
