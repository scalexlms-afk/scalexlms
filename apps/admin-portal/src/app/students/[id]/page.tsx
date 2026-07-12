import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { canAssignMentor } from "@/lib/admin-db";
import { getMentors, getStudentDetail } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatStatus,
} from "@/lib/format";
import { assignMentorAction } from "../actions";
import { Button, Card, DataTable, ProgressBar, StatusPill } from "@scalex/ui";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  let detail;
  try {
    detail = await getStudentDetail(id, { userId, role: profile.role });
  } catch {
    notFound();
  }

  const mentors = canAssignMentor(profile.role) ? await getMentors() : [];
  const enrollment = Array.isArray(detail.student.enrollment)
    ? detail.student.enrollment[0]
    : detail.student.enrollment;

  return (
    <AdminShell activePath="/students">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/students"
              className="text-xs text-text-secondary-dark hover:text-scalex-red"
            >
              ← Back to students
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold">
              {detail.student.name}
            </h1>
            <p className="text-text-secondary-dark">{detail.student.email}</p>
          </div>
          <StatusPill
            label={formatStatus(detail.student.status)}
            variant={
              detail.student.status === "active" ? "approved" : "not_started"
            }
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Profile</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-text-tertiary-dark">Plan</dt>
                <dd>{formatStatus(detail.student.plan ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary-dark">Stage</dt>
                <dd>{detail.student.current_stage ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary-dark">Level</dt>
                <dd>{formatStatus(detail.student.level ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary-dark">Mentor</dt>
                <dd>
                  {detail.student.mentor
                    ? (detail.student.mentor as { name: string }).name
                    : "Unassigned"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-text-tertiary-dark">Course Progress</dt>
                <dd className="mt-1">
                  <ProgressBar
                    value={enrollment?.completion_percent ?? 0}
                    showPercent
                  />
                </dd>
              </div>
            </dl>
          </Card>

          {canAssignMentor(profile.role) && (
            <Card>
              <h2 className="font-display text-lg font-semibold">
                Assign Mentor
              </h2>
              <form action={assignMentorAction} className="mt-4 space-y-3">
                <input type="hidden" name="studentId" value={id} />
                <div>
                  <label
                    htmlFor="mentorId"
                    className="mb-1.5 block text-sm font-medium text-text-secondary-dark"
                  >
                    Mentor
                  </label>
                  <select
                    id="mentorId"
                    name="mentorId"
                    defaultValue={detail.student.mentor_id ?? ""}
                    className="w-full rounded-lg border border-white/10 bg-scalex-charcoal-alt px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Save assignment
                </Button>
              </form>
            </Card>
          )}
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Payments</h2>
          <div className="mt-4">
            <DataTable
              rows={detail.payments}
              getRowKey={(row) => row.id}
              emptyMessage="No payments recorded."
              columns={[
                {
                  key: "type",
                  header: "Type",
                  render: (row) => formatStatus(row.type),
                },
                {
                  key: "amount",
                  header: "Amount",
                  render: (row) => formatCurrency(row.amount),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <StatusPill
                      label={formatStatus(row.status)}
                      variant={
                        row.status === "paid" ? "approved" : "pending"
                      }
                    />
                  ),
                },
                {
                  key: "paid",
                  header: "Paid At",
                  render: (row) => formatDateTime(row.paid_at),
                },
              ]}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Task Submissions</h2>
          <div className="mt-4">
            <DataTable
              rows={detail.submissions}
              getRowKey={(row) => row.id}
              emptyMessage="No submissions yet."
              columns={[
                {
                  key: "task",
                  header: "Task",
                  render: (row) =>
                    (row.task as { title: string } | null)?.title ?? "—",
                },
                {
                  key: "milestone",
                  header: "Milestone",
                  render: (row) => {
                    const task = row.task as {
                      milestone: { title: string } | null;
                    } | null;
                    return task?.milestone?.title ?? "—";
                  },
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <StatusPill label={formatStatus(row.status)} variant="review" />
                  ),
                },
                {
                  key: "submitted",
                  header: "Submitted",
                  render: (row) => formatDateTime(row.submitted_at),
                },
              ]}
            />
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-lg font-semibold">
              Recent Messages
            </h2>
            <div className="mt-4 space-y-3">
              {detail.messages.length === 0 ? (
                <p className="text-sm text-text-secondary-dark">
                  No messages yet.
                </p>
              ) : (
                detail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-white/[0.06] bg-scalex-charcoal-alt p-3"
                  >
                    <p className="text-xs text-text-tertiary-dark">
                      {(msg.sender as { name: string } | null)?.name} ·{" "}
                      {formatDateTime(msg.created_at)}
                    </p>
                    <p className="mt-1 text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold">Activity</h2>
            <div className="mt-4 space-y-3">
              {detail.activity.length === 0 ? (
                <p className="text-sm text-text-secondary-dark">
                  No audit activity yet.
                </p>
              ) : (
                detail.activity.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-white/[0.06] bg-scalex-charcoal-alt p-3"
                  >
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-text-tertiary-dark">
                      {formatDateTime(entry.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
