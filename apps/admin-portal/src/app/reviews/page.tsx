import { AdminShell } from "@/components/admin-shell";
import { TextArea } from "@/components/field";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getPendingSubmissions } from "@/lib/data";
import { reviewSubmissionAction } from "./actions";
import {
  submissionStatusLabel,
  submissionStatusVariant,
  type SubmissionStatus,
} from "@scalex/db";
import { Button, Card, StatusPill } from "@scalex/ui";

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

export default async function ReviewsPage() {
  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "task_review");

  const submissions = await getPendingSubmissions(userId, profile.role);

  return (
    <AdminShell activePath="/reviews">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Task &amp; Review Center
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Review student submissions awaiting mentor or instructor feedback.
          </p>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary-dark">
              No submissions pending review. Check back when students submit
              tasks.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {submission.task?.title ?? "Task"}
                    </h2>
                    <p className="mt-0.5 text-sm text-text-secondary-dark">
                      {submission.student?.name ?? "Unknown student"}
                      {submission.student?.email
                        ? ` · ${submission.student.email}`
                        : ""}
                    </p>
                    {submission.task?.milestone?.title && (
                      <p className="mt-0.5 text-xs text-text-tertiary-dark">
                        Milestone: {submission.task.milestone.title}
                      </p>
                    )}
                  </div>
                  <StatusPill
                    label={submissionStatusLabel(
                      submission.status as SubmissionStatus
                    )}
                    variant={submissionStatusVariant(
                      submission.status as SubmissionStatus
                    )}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.06] bg-scalex-charcoal-alt p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary-dark">
                      Submission
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap text-sm text-text-secondary-dark">
                      {formatSubmissionContent(submission.content)}
                    </pre>
                    {submission.submitted_at && (
                      <p className="mt-2 text-xs text-text-tertiary-dark">
                        Submitted{" "}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-scalex-charcoal-alt p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary-dark">
                      AI Pre-review (read-only)
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="text-text-tertiary-dark">Score: </span>
                      <span className="font-medium">
                        {formatAiScore(submission.ai_score)}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-text-secondary-dark">
                      {submission.ai_notes ?? "No AI notes available."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <form action={reviewSubmissionAction} className="space-y-3">
                    <input
                      type="hidden"
                      name="submissionId"
                      value={submission.id}
                    />
                    <input type="hidden" name="decision" value="approved" />
                    <TextArea
                      label="Approval feedback (optional)"
                      name="feedback"
                      placeholder="Great work — approved!"
                    />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>

                  <form action={reviewSubmissionAction} className="space-y-3">
                    <input
                      type="hidden"
                      name="submissionId"
                      value={submission.id}
                    />
                    <input
                      type="hidden"
                      name="decision"
                      value="revision_required"
                    />
                    <TextArea
                      label="Revision feedback"
                      name="feedback"
                      placeholder="What should the student improve?"
                      required
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Request revision
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
