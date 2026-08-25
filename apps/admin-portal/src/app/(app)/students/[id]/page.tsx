import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, TextArea } from "@/components/field";
import {
  AdminDetailRail,
  AdminEmptyState,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAssignMentor, canManageFinance } from "@/lib/admin-db";
import { getMentors, getStudentDetail } from "@/lib/data";
import {
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatStatus,
  studentPublicCode,
} from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import {
  assignMentorAction,
  updateStudentPlanAction,
  logMentorCallAction,
  replyToStudentAction,
  grantComplimentaryAccessAction,
  deleteUnpaidStudentAction,
} from "../actions";
import { Button, DataTable, ProgressBar, StatusPill } from "@scalex/ui";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

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
  const mentor = detail.student.mentor as {
    id: string;
    name: string;
    email: string;
  } | null;

  const paidTotal = detail.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const pendingSubs = detail.submissions.filter((s) =>
    ["submitted", "under_review"].includes(String(s.status))
  ).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Students"
        title={detail.student.name}
        description={`${detail.student.email} · ID ${studentPublicCode(detail.student.id)}`}
        secondaryAction={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/students" className="admin-btn-secondary">
              ← Back
            </Link>
            <StatusPill
              label={formatStatus(detail.student.status)}
              variant={
                detail.student.status === "active" ? "approved" : "not_started"
              }
            />
          </div>
        }
      />

      <AdminKpiGrid
        items={[
          {
            label: "Progress",
            value: formatPercent(enrollment?.completion_percent ?? 0),
          },
          {
            label: "Plan",
            value: planLabel(detail.student.plan, true),
          },
          {
            label: "Stage",
            value: detail.student.current_stage ?? "—",
          },
          {
            label: "Pending Tasks",
            value: String(pendingSubs),
            tone: pendingSubs > 0 ? "danger" : "default",
          },
          {
            label: "Paid Volume",
            value: formatCurrency(paidTotal),
            tone: "success",
          },
          {
            label: "Level",
            value: formatStatus(detail.student.level ?? "—"),
          },
        ]}
      />

      <AdminSplit
        main={
          <div className="space-y-4">
            <AdminPanel title="Profile">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-scalex-red/15 text-lg font-bold text-scalex-red">
                  {initials(detail.student.name)}
                </span>
                <dl className="grid flex-1 gap-3 sm:grid-cols-2 text-sm">
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
                    <dd className="mt-1">
                      {detail.student.current_stage ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Mentor</dt>
                    <dd className="mt-1">{mentor?.name ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Access</dt>
                    <dd className="mt-1">
                      {detail.student.complimentary_access
                        ? "Complimentary (free)"
                        : "Standard billing"}
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
              </div>
            </AdminPanel>

            <AdminPanel title="Payments">
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
            </AdminPanel>

            <AdminPanel title="Task Submissions">
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
                      <StatusPill
                        label={formatStatus(row.status)}
                        variant="review"
                      />
                    ),
                  },
                  {
                    key: "submitted",
                    header: "Submitted",
                    render: (row) => formatDateTime(row.submitted_at),
                  },
                ]}
              />
            </AdminPanel>

            <div className="grid gap-4 lg:grid-cols-2">
              <AdminPanel title="Recent Messages">
                <div className="space-y-3">
                  {detail.messages.length === 0 ? (
                    <AdminEmptyState
                      title="No messages yet"
                      hint="Premium students can chat with their assigned mentor."
                    />
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
                {detail.student.plan === "premium" ? (
                  <form
                    action={replyToStudentAction}
                    className="mt-4 space-y-3"
                  >
                    <input type="hidden" name="studentId" value={id} />
                    <TextArea label="Reply" name="content" rows={3} required />
                    <Button type="submit">Send message</Button>
                  </form>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    Direct messaging is available for Premium students only.
                  </p>
                )}
              </AdminPanel>

              <AdminPanel title="Mentor calls">
                <div className="space-y-3">
                  {detail.mentorCalls.length === 0 ? (
                    <AdminEmptyState
                      title="No calls logged"
                      hint="Log a mentor call after a private session."
                    />
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
                          {(call.mentor as { name: string } | null)?.name ??
                            "Mentor"}{" "}
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
                  <form
                    action={logMentorCallAction}
                    className="mt-4 space-y-3"
                  >
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
                        className="admin-input"
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
              </AdminPanel>
            </div>

            <AdminPanel title="Activity">
              <div className="space-y-3">
                {detail.activity.length === 0 ? (
                  <AdminEmptyState
                    title="No audit activity yet"
                    hint="Mentorship actions on this student will log here."
                  />
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
            </AdminPanel>
          </div>
        }
        rail={
          <div className="space-y-4">
            <AdminDetailRail title="Student summary">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Contact
                </p>
                <p className="mt-1 text-sm font-medium">{detail.student.name}</p>
                <p className="text-xs text-muted">{detail.student.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Mentor
                </p>
                <p className="mt-1 text-sm">{mentor?.name ?? "Unassigned"}</p>
              </div>
              {pendingSubs > 0 ? (
                <Link
                  href="/reviews"
                  className="inline-block text-xs font-semibold text-scalex-red"
                >
                  Open review queue →
                </Link>
              ) : null}
            </AdminDetailRail>

            {canAssignMentor(profile.role) ? (
              <AdminPanel title="Assign Mentor">
                <form action={assignMentorAction} className="space-y-3">
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
                      className="admin-input"
                    >
                      <option value="">Unassigned</option>
                      {mentors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {mentors.length === 0 ? (
                    <AdminEmptyState
                      title="No mentors on staff"
                      hint="Add a mentor role from Team Members first."
                    />
                  ) : (
                    <Button type="submit" className="w-full">
                      Save assignment
                    </Button>
                  )}
                </form>
              </AdminPanel>
            ) : null}

            {profile.role === "super_admin" ? (
              <AdminPanel title="Access">
                <div className="space-y-4">
                  {detail.student.complimentary_access ? (
                    <p className="text-sm text-accent-green">
                      This student has complimentary (free) access.
                    </p>
                  ) : (
                    <form action={grantComplimentaryAccessAction}>
                      <input type="hidden" name="studentId" value={id} />
                      <p className="mb-3 text-xs text-muted">
                        Grant free access without payment. Status stays active.
                      </p>
                      <Button type="submit" className="w-full">
                        Grant free access
                      </Button>
                    </form>
                  )}
                  {!detail.student.complimentary_access &&
                  !detail.payments.some((pay) => pay.status === "paid") ? (
                    <form
                      action={deleteUnpaidStudentAction}
                      className="border-t border-line pt-4"
                    >
                      <input type="hidden" name="studentId" value={id} />
                      <p className="mb-3 text-xs text-muted">
                        Soft-deactivate this unpaid student (no paid invoices).
                      </p>
                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                      >
                        Delete unpaid student
                      </Button>
                    </form>
                  ) : null}
                </div>
              </AdminPanel>
            ) : null}

            {canManageFinance(profile.role) ? (
              <AdminPanel title="Student Plan">
                <p className="mb-3 text-xs text-muted">
                  Controls dashboard features (live sessions for Premium).
                </p>
                <form action={updateStudentPlanAction} className="space-y-3">
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
                      className="admin-input"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium Launch Program</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Update plan
                  </Button>
                </form>
              </AdminPanel>
            ) : null}
          </div>
        }
      />
    </>
  );
}
