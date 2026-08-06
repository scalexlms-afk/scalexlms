import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { TextArea } from "@/components/field";
import {
  AdminDetailRail,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getReviewQueue,
  getReviewQueueStats,
  type ReviewFilter,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { reviewSubmissionAction } from "./actions";
import {
  submissionStatusLabel,
  submissionStatusVariant,
  planLabel,
  planPillVariant,
  type SubmissionStatus,
} from "@scalex/db";
import { Button, StatusPill } from "@scalex/ui";

function formatSubmissionContent(content: Record<string, unknown>): string {
  if (typeof content.text === "string" && content.text) return content.text;
  if (typeof content.link === "string" && content.link) return content.link;
  if (typeof content.file_path === "string" && content.file_path) {
    return `File: ${content.file_path}`;
  }
  return JSON.stringify(content, null, 2);
}

function formatAiScore(score: number | null): string {
  if (score == null) return "—";
  return `${Math.round(score * 100)}%`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function isReviewFilter(value: string | undefined): value is ReviewFilter {
  return (
    value === "all" ||
    value === "pending" ||
    value === "reviewed" ||
    value === "returned" ||
    value === "approved"
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; tab?: string; q?: string }>;
}) {
  const { userId, profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "task_review");

  const params = await searchParams;
  const tab: ReviewFilter = isReviewFilter(params.tab) ? params.tab : "pending";
  const q = (params.q ?? "").trim().toLowerCase();

  const [stats, submissions] = await Promise.all([
    getReviewQueueStats(userId, profile.role),
    getReviewQueue(userId, profile.role, tab),
  ]);

  const filtered = q
    ? submissions.filter(
        (s) =>
          (s.student?.name ?? "").toLowerCase().includes(q) ||
          (s.student?.email ?? "").toLowerCase().includes(q) ||
          (s.task?.title ?? "").toLowerCase().includes(q)
      )
    : submissions;

  const selected =
    filtered.find((s) => s.id === params.id) ?? filtered[0] ?? null;

  const tabHref = (id: ReviewFilter) => {
    const sp = new URLSearchParams();
    if (id !== "pending") sp.set("tab", id);
    if (q) sp.set("q", q);
    if (selected && id === tab) sp.set("id", selected.id);
    const qs = sp.toString();
    return qs ? `/reviews?${qs}` : "/reviews";
  };

  return (
    <AdminShell activePath="/reviews">
      <AdminPageHeader
        eyebrow="Students"
        title="Task Reviews"
        description="Review and provide feedback on student tasks and submissions."
        secondaryAction={
          <form method="get" className="flex flex-wrap items-center gap-2">
            {tab !== "pending" ? (
              <input type="hidden" name="tab" value={tab} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search tasks or students..."
              className="admin-input max-w-xs"
              aria-label="Search tasks or students"
            />
            <button type="submit" className="admin-btn-secondary">
              Search
            </button>
            <button type="button" className="admin-btn-secondary">
              Export
            </button>
          </form>
        }
      />

      <AdminKpiGrid
        items={[
          {
            label: "Pending Reviews",
            value: String(stats.pending),
            tone: stats.pending > 0 ? "danger" : "default",
            hint: "Tasks waiting for review",
          },
          {
            label: "Reviewed Today",
            value: String(stats.reviewedToday),
            hint: "From reviews table",
          },
          {
            label: "Tasks This Month",
            value: String(stats.tasksThisMonth),
          },
          {
            label: "Priority Premium",
            value: String(stats.premiumPending),
            hint: "In pending queue",
          },
          {
            label: "Overdue Reviews",
            value: String(stats.overdue),
            hint: "No due dates configured",
            tone: stats.overdue > 0 ? "danger" : "default",
          },
        ]}
      />

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "all",
            label: "All",
            count: stats.pending + stats.reviewed,
            href: tabHref("all"),
          },
          {
            id: "pending",
            label: "Pending",
            count: stats.pending,
            href: tabHref("pending"),
          },
          {
            id: "reviewed",
            label: "Reviewed",
            count: stats.reviewed,
            href: tabHref("reviewed"),
          },
          {
            id: "returned",
            label: "Returned",
            count: stats.returned,
            href: tabHref("returned"),
          },
          {
            id: "approved",
            label: "Approved",
            count: stats.approved,
            href: tabHref("approved"),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <AdminPanel>
          <p className="text-sm text-muted">
            No submissions in this queue. Check another tab or wait for new
            student submissions.
          </p>
        </AdminPanel>
      ) : (
        <AdminSplit
          main={
            <AdminPanel
              title={`Showing ${filtered.length} task${filtered.length === 1 ? "" : "s"}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="px-2 py-2 font-semibold">Student</th>
                      <th className="px-2 py-2 font-semibold">Task</th>
                      <th className="px-2 py-2 font-semibold">Submitted</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 font-semibold">Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((submission) => {
                      const active = selected?.id === submission.id;
                      const hrefParams = new URLSearchParams();
                      if (tab !== "pending") hrefParams.set("tab", tab);
                      if (q) hrefParams.set("q", q);
                      hrefParams.set("id", submission.id);
                      return (
                        <tr
                          key={submission.id}
                          className={
                            active
                              ? "bg-scalex-red/5"
                              : "hover:bg-surface-3/50"
                          }
                        >
                          <td className="px-2 py-3">
                            <Link
                              href={`/reviews?${hrefParams.toString()}`}
                              className="flex items-center gap-2"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-scalex-red/15 text-[10px] font-bold text-scalex-red">
                                {initials(
                                  submission.student?.name ?? "?"
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block font-medium">
                                  {submission.student?.name ??
                                    "Unknown student"}
                                </span>
                                <span className="block truncate text-xs text-muted">
                                  {submission.student?.email}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-2 py-3">
                            <Link href={`/reviews?${hrefParams.toString()}`}>
                              <span className="block font-medium">
                                {submission.task?.title ?? "Task"}
                              </span>
                              {submission.task?.milestone?.title ? (
                                <span className="block text-xs text-subtle">
                                  {submission.task.milestone.title}
                                </span>
                              ) : null}
                            </Link>
                          </td>
                          <td className="px-2 py-3 text-xs text-muted">
                            {formatDateTime(submission.submitted_at)}
                          </td>
                          <td className="px-2 py-3">
                            <StatusPill
                              label={submissionStatusLabel(
                                submission.status as SubmissionStatus
                              )}
                              variant={submissionStatusVariant(
                                submission.status as SubmissionStatus
                              )}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <StatusPill
                              label={planLabel(
                                submission.student?.plan,
                                true
                              )}
                              variant={planPillVariant(
                                submission.student?.plan
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
          }
          rail={
            selected ? (
              <AdminDetailRail
                title={selected.task?.title ?? "Task detail"}
                footer={
                  ["submitted", "under_review"].includes(selected.status) ? (
                    <div className="space-y-3">
                      <form
                        action={reviewSubmissionAction}
                        className="space-y-2"
                      >
                        <input
                          type="hidden"
                          name="submissionId"
                          value={selected.id}
                        />
                        <input
                          type="hidden"
                          name="decision"
                          value="approved"
                        />
                        <TextArea
                          label="Feedback"
                          name="feedback"
                          placeholder="Write your feedback for the student..."
                        />
                        <Button
                          type="submit"
                          className="w-full !bg-accent-green hover:!opacity-90"
                        >
                          Approve
                        </Button>
                      </form>
                      <form
                        action={reviewSubmissionAction}
                        className="space-y-2"
                      >
                        <input
                          type="hidden"
                          name="submissionId"
                          value={selected.id}
                        />
                        <input
                          type="hidden"
                          name="decision"
                          value="revision_required"
                        />
                        <TextArea
                          label="Revision notes"
                          name="feedback"
                          placeholder="What should the student improve?"
                          required
                        />
                        <Button
                          type="submit"
                          variant="destructive"
                          className="w-full"
                        >
                          Return for Changes
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <p className="text-xs text-muted">
                      This submission is already{" "}
                      {submissionStatusLabel(
                        selected.status as SubmissionStatus
                      ).toLowerCase()}
                      .
                    </p>
                  )
                }
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-scalex-red/15 text-xs font-bold text-scalex-red">
                    {initials(selected.student?.name ?? "?")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {selected.student?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted">
                      {selected.student?.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill
                        label={submissionStatusLabel(
                          selected.status as SubmissionStatus
                        )}
                        variant={submissionStatusVariant(
                          selected.status as SubmissionStatus
                        )}
                      />
                      <StatusPill
                        label={planLabel(selected.student?.plan, true)}
                        variant={planPillVariant(selected.student?.plan)}
                      />
                    </div>
                    {selected.student_id ? (
                      <Link
                        href={`/students/${selected.student_id}`}
                        className="mt-2 inline-block text-xs font-semibold text-scalex-red"
                      >
                        View Profile
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Milestone
                  </p>
                  <p className="mt-1 text-sm">
                    {selected.task?.milestone?.title ?? "—"}
                  </p>
                  {selected.submitted_at ? (
                    <p className="mt-1 text-xs text-subtle">
                      Submitted {formatDateTime(selected.submitted_at)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Submission
                  </p>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-3 p-3 text-xs text-muted">
                    {formatSubmissionContent(selected.content)}
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    AI Pre-review
                  </p>
                  <p className="mt-1 text-sm">
                    Score: {formatAiScore(selected.ai_score)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {selected.ai_notes ?? "No AI notes available."}
                  </p>
                </div>
              </AdminDetailRail>
            ) : (
              <AdminPanel>
                <p className="text-sm text-muted">Select a submission.</p>
              </AdminPanel>
            )
          }
        />
      )}
    </AdminShell>
  );
}
