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
import { formatMomHint, formatPercent } from "@/lib/format";
import { BarChartCard, DonutChart } from "@scalex/ui";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "reports");

  const sp = await searchParams;
  const section =
    sp.section === "learning" || sp.section === "community"
      ? sp.section
      : "overview";

  const scope = { userId, role: profile.role };
  const [{ stats, growthSeries, milestoneRates }, insights] =
    await Promise.all([getReportsSummary(scope), getAiInsights(scope)]);

  const academicInsights = insights.filter((item) => item.id !== "payment-risk");

  return (
    <>
      <AdminPageHeader
        eyebrow="All academy"
        title="Academy analytics"
        description="Student performance and learning progress — finance lives on Finance."
      />

      <AdminKpiGrid
        items={[
          {
            label: "Total Students",
            value: String(stats.totalStudents),
            hint: formatMomHint(stats.momGrowth, stats.hasMomBaseline),
          },
          {
            label: "Active Students",
            value: String(stats.activeStudents),
            hint:
              stats.totalStudents > 0
                ? `${((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}% of total`
                : "Status = active",
          },
          {
            label: "Completion Rate",
            value: formatPercent(stats.completionRate),
            hint: "Avg enrollment progress",
          },
          {
            label: "Premium Students",
            value: String(stats.premiumStudents),
            hint: "Current premium roster",
          },
        ]}
      />

      <AdminFilterTabs
        active={section}
        tabs={[
          { id: "overview", label: "Overview", href: "/analytics" },
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

      {(section === "overview" || section === "learning") && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPanel title="Student Growth">
            <BarChartCard title="" data={growthSeries} />
          </AdminPanel>
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
        </div>
      )}

      {section === "learning" && milestoneRates.length > 0 ? (
        <AdminPanel title="Completion by milestone">
          <div className="space-y-3">
            {milestoneRates.map((row) => (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{row.name}</span>
                  <span className="text-muted">{formatPercent(row.value)}</span>
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
        </AdminPanel>
      ) : null}

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {academicInsights.length > 0
            ? academicInsights.map((item) => (
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
            { label: "Student Analytics", href: "/students" },
            {
              label: "Learning Analytics",
              href: "/analytics?section=learning",
            },
            { label: "Community Analytics", href: "/community" },
            { label: "Task Reviews", href: "/reviews" },
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
