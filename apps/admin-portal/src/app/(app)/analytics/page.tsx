import Link from "next/link";
import {
  AdminEmptyState,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getAiInsights, getReportsSummary } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { BarChartCard, DonutChart, LineChartCard } from "@scalex/ui";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "reports");

  const sp = await searchParams;
  const section =
    sp.section === "revenue" ||
    sp.section === "learning" ||
    sp.section === "community"
      ? sp.section
      : "overview";

  const scope = { userId, role: profile.role };
  const [{ stats, revenueSeries, growthSeries, milestoneRates }, insights] =
    await Promise.all([
      getReportsSummary(scope),
      getAiInsights(scope),
    ]);

  const momHint = (value: number) =>
    `${value >= 0 ? "↑" : "↓"} ${formatPercent(Math.abs(value))} vs last month`;

  return (
    <>
      <AdminPageHeader
        eyebrow="All academy"
        title="Academy analytics"
        description="Track academy performance and student success with data-driven insights."
      />

      <AdminKpiGrid
        items={[
          {
            label: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            hint: momHint(stats.momGrowth),
            tone: "success",
          },
          {
            label: "Total Students",
            value: String(stats.totalStudents),
            hint: "Enrolled roster",
          },
          {
            label: "Completion Rate",
            value: formatPercent(stats.completionRate),
            hint: "Avg enrollment progress",
          },
          {
            label: "Active Students",
            value: String(stats.activeStudents),
            hint:
              stats.totalStudents > 0
                ? `${((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}% of total`
                : "Status = active",
          },
        ]}
      />

      <AdminFilterTabs
        active={section}
        tabs={[
          { id: "overview", label: "Overview", href: "/analytics" },
          {
            id: "revenue",
            label: "Revenue",
            href: "/analytics?section=revenue",
          },
          {
            id: "learning",
            label: "Learning",
            href: "/analytics?section=learning",
          },
          {
            id: "community",
            label: "Community",
            href: "/analytics?section=community",
          },
        ]}
      />

      {(section === "overview" || section === "revenue") && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPanel title="Revenue Trend">
            <LineChartCard title="" data={revenueSeries} valuePrefix="$" />
          </AdminPanel>
          {section === "overview" ? (
            <AdminPanel title="Student Growth">
              <BarChartCard title="" data={growthSeries} />
            </AdminPanel>
          ) : (
            <AdminPanel title="Revenue pulse">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Paid volume</dt>
                  <dd className="font-semibold">
                    {formatCurrency(stats.totalRevenue)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">MoM student growth</dt>
                  <dd className="font-semibold">
                    {formatPercent(stats.momGrowth)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">New students this month</dt>
                  <dd className="font-semibold">{stats.studentsThisMonth}</dd>
                </div>
              </dl>
            </AdminPanel>
          )}
        </div>
      )}

      {(section === "overview" || section === "learning") && (
        <AdminPanel title="Milestone Completion Funnel">
          {milestoneRates.length > 0 ? (
            <DonutChart title="" data={milestoneRates} />
          ) : (
            <AdminEmptyState
              title="No milestone data yet"
              hint="Funnel numbers fill in as enrollments progress."
            />
          )}
        </AdminPanel>
      )}

      {section === "learning" && (
        <AdminPanel title="Student Growth">
          <BarChartCard title="" data={growthSeries} />
        </AdminPanel>
      )}

      {section === "community" && (
        <AdminPanel title="Community signals">
          <p className="text-sm text-muted">
            Community deep-dive charts are not wired yet. Use moderation queue
            and post stats on Community.
          </p>
          <Link
            href="/community"
            className="mt-3 inline-block text-sm font-semibold text-scalex-red"
          >
            Open Community →
          </Link>
        </AdminPanel>
      )}

      <AdminPanel
        title="AI Insights"
        action={
          <span className="text-xs text-subtle">
            Smart insights and alerts to help you take action
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {insights.length > 0
            ? insights.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-xl border border-line bg-surface-3/60 p-4 transition hover:border-scalex-red/40"
                >
                  <p className="text-sm font-semibold text-scalex-red">
                    {item.title}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {item.count}
                  </p>
                  <p className="mt-1 text-xs text-muted">{item.note}</p>
                </Link>
              ))
            : [
                {
                  title: "Inactive students",
                  body: "Review students with low recent activity.",
                  href: "/students",
                },
                {
                  title: "Pending tasks",
                  body: `${stats.pendingReviews} submissions need review.`,
                  href: "/reviews",
                },
                {
                  title: "Revenue pulse",
                  body: `MoM growth ${formatPercent(stats.momGrowth)}.`,
                  href: "/finance",
                },
              ].map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-xl border border-line bg-surface-3/60 p-4 transition hover:border-scalex-red/40"
                >
                  <p className="text-sm font-semibold text-scalex-red">
                    {card.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">{card.body}</p>
                </Link>
              ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Explore Detailed Reports">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Revenue Analytics", href: "/finance" },
            { label: "Student Analytics", href: "/students" },
            {
              label: "Learning Analytics",
              href: "/analytics?section=learning",
            },
            { label: "Community Analytics", href: "/community" },
            { label: "Task Reviews", href: "/reviews" },
            { label: "Finance Analytics", href: "/finance" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl border border-line bg-surface-3/50 px-4 py-3 text-sm font-semibold transition hover:border-scalex-red/40 hover:text-scalex-red"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </AdminPanel>
    </>
  );
}
