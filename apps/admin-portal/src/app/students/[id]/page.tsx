import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAssignMentor, canManageFinance } from "@/lib/admin-db";
import { getMentors, getStudentDetail } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatStatus,
} from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { assignMentorAction, updateStudentPlanAction, logMentorCallAction, replyToStudentAction } from "../actions";
import { Field, TextArea } from "@/components/field";
import { Button, Card, DataTable, ProgressBar, StatusPill } from "@scalex/ui";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

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
              className="text-xs text-muted hover:text-scalex-red"
            >
              ← Back to students
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold">
              {detail.student.name}
            </h1>
            <p className="text-muted">{detail.student.email}</p>
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
                <dt className="text-subtle">Plan</dt>
                <dd className="mt-1">
                  <StatusPill
                    label={planLabel(detail.student.plan)}
                    variant={planPillVariant(detail.student.plan)}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Enrollment Plan</dt>
                <dd className="mt-1">
                  <StatusPill
                    label={planLabel(enrollment?.plan)}
                    variant={planPillVariant(enrollment?.plan)}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Stage</dt>
                <dd>{detail.student.current_stage ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-subtle">Level</dt>
                <dd>{formatStatus(detail.student.level ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-subtle">Mentor</dt>
                <dd>
                  {detail.student.mentor
                    ? (detail.student.mentor as { name: string }).name
                    : "Unassigned"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-subtle">Course Progress</dt>
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
                    className="mb-1.5 block text-sm font-medium text-muted"
                  >
                    Mentor
                  </label>
                  <select
                    id="mentorId"
                    name="mentorId"
                    defaultValue={detail.student.mentor_id ?? ""}
                    className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm"
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

          {canManageFinance(profile.role) && (
            <Card>
              <h2 className="font-display text-lg font-semibold">
                Student Plan
              </h2>
              <p className="mt-1 text-xs text-muted">
                Controls dashboard features (live sessions for Premium).
              </p>
              <form action={updateStudentPlanAction} className="mt-4 space-y-3">
                <input type="hidden" name="studentId" value={id} />
                <div>
                  <label
                    htmlFor="plan"
                    className="mb-1.5 block text-sm font-medium text-muted"
                  >
                    Plan
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    defaultValue={detail.student.plan ?? "standard"}
                    className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium Launch Program</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Update plan
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
                <p className="text-sm text-muted">No messages yet.</p>
              ) : (
                detail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-line bg-surface-3 p-3"
                  >
                    <p className="text-xs text-subtle">
                      {(msg.sender as { name: string } | null)?.name} ·{" "}
                      {formatDateTime(msg.created_at)}
                    </p>
                    <p className="mt-1 text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <form action={replyToStudentAction} className="mt-4 space-y-3">
              <input type="hidden" name="studentId" value={id} />
              <TextArea label="Reply" name="content" rows={3} required />
              <Button type="submit">Send message</Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold">
              Mentor calls
            </h2>
            <div className="mt-4 space-y-3">
              {detail.mentorCalls.length === 0 ? (
                <p className="text-sm text-muted">No calls logged yet.</p>
              ) : (
                detail.mentorCalls.map((call) => (
                  <div
                    key={call.id}
                    className="rounded-lg border border-line bg-surface-3 p-3"
                  >
                    <p className="text-sm font-medium">
                      {formatDateTime(call.scheduled_at as string)}
                    </p>
                    <p className="text-xs text-subtle">
                      {(call.mentor as { name: string } | null)?.name ?? "Mentor"}{" "}
                      · {formatStatus(call.status as string)}
                      {call.duration_minutes
                        ? ` · ${call.duration_minutes} min`
                        : ""}
                    </p>
                    {call.notes && (
                      <p className="mt-1 text-sm text-muted">
                        {call.notes as string}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
            {detail.student.plan === "premium" && (
              <form action={logMentorCallAction} className="mt-4 space-y-3">
                <input type="hidden" name="studentId" value={id} />
                <Field
                  label="Scheduled at"
                  name="scheduled_at"
                  type="datetime-local"
                  required
                />
                <Field
                  label="Duration (minutes)"
                  name="duration_minutes"
                  type="number"
                />
                <div>
                  <label
                    htmlFor="callStatus"
                    className="mb-1.5 block text-sm font-medium text-muted"
                  >
                    Status
                  </label>
                  <select
                    id="callStatus"
                    name="status"
                    defaultValue="completed"
                    className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No show</option>
                  </select>
                </div>
                <TextArea label="Notes" name="notes" rows={2} />
                <Button type="submit">Log call</Button>
              </form>
            )}
            {detail.student.plan !== "premium" && (
              <p className="mt-3 text-xs text-subtle">
                Call logging is available for Premium students.
              </p>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Activity</h2>
          <div className="mt-4 space-y-3">
            {detail.activity.length === 0 ? (
              <p className="text-sm text-muted">No audit activity yet.</p>
            ) : (
              detail.activity.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-line bg-surface-3 p-3"
                >
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-subtle">
                    {formatDateTime(entry.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
