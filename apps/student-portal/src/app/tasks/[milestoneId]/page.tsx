import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import {
  getTaskByMilestoneId,
  getSubmissionForTask,
  isMilestoneUnlocked,
} from "@/lib/data";
import { createClient } from "@scalex/db/server";
import {
  submissionStatusLabel,
  submissionStatusVariant,
} from "@scalex/db";
import { Card, Button, StatusPill } from "@scalex/ui";
import { inputClasses } from "@/components/field";
import { submitTaskAction } from "../actions";

function SubmissionContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  if (content.type === "text" && typeof content.text === "string") {
    return (
      <p className="whitespace-pre-wrap text-sm text-text-primary-dark">
        {content.text}
      </p>
    );
  }
  if (content.type === "link" && typeof content.link === "string") {
    return (
      <a
        href={content.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-scalex-red hover:underline"
      >
        {content.link}
      </a>
    );
  }
  if (content.type === "file" && typeof content.file_name === "string") {
    return (
      <p className="text-sm text-text-primary-dark">
        Uploaded file: {content.file_name}
      </p>
    );
  }
  return (
    <pre className="overflow-x-auto text-xs text-text-secondary-dark">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ milestoneId: string }>;
}) {
  const { milestoneId } = await params;
  const { userId } = await requireStudentProfile();

  const supabase = await createClient();
  const { data: milestone } = await supabase
    .from("milestones")
    .select("*, courses(title)")
    .eq("id", milestoneId)
    .single();

  if (!milestone) notFound();

  const task = await getTaskByMilestoneId(milestoneId);
  if (!task) notFound();

  const unlocked = await isMilestoneUnlocked(userId, milestoneId);
  const submission = await getSubmissionForTask(task.id, userId);
  const status = submission?.status ?? "not_started";
  const latestReview = submission?.reviews?.[0];
  const canSubmit =
    unlocked && (status === "not_started" || status === "revision_required");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseTitle = (milestone as any).courses?.title as string | undefined;

  return (
    <PortalShell activePath="/roadmap">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-sm text-text-secondary-dark transition-colors hover:text-scalex-red"
          >
            ← Back to Roadmap
          </Link>
          {courseTitle && (
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-text-tertiary-dark">
              {courseTitle} · {(milestone as { title: string }).title}
            </p>
          )}
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {task.title}
            </h1>
            <StatusPill
              label={submissionStatusLabel(status)}
              variant={submissionStatusVariant(status)}
            />
          </div>
          {task.description && (
            <p className="mt-3 text-text-secondary-dark">{task.description}</p>
          )}
        </div>

        {!unlocked && (
          <Card className="border-accent-amber/30 bg-accent-amber/5">
            <p className="text-sm text-accent-amber">
              This milestone task is locked. Complete and get approval on the
              previous milestone task to unlock it.
            </p>
          </Card>
        )}

        {submission && status !== "not_started" && (
          <Card>
            <h2 className="font-display text-lg font-semibold">Your submission</h2>
            <div className="mt-3">
              <SubmissionContent content={submission.content} />
            </div>
            {submission.submitted_at && (
              <p className="mt-2 text-xs text-text-tertiary-dark">
                Submitted {new Date(submission.submitted_at).toLocaleString()}
              </p>
            )}
            {submission.ai_score != null && (
              <p className="mt-3 text-sm text-text-secondary-dark">
                AI pre-score:{" "}
                <span className="font-medium text-text-primary-dark">
                  {Math.round(submission.ai_score)}/100
                </span>
              </p>
            )}
            {submission.ai_notes && (
              <div className="mt-3 rounded-lg bg-scalex-charcoal-alt p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary-dark">
                  AI feedback
                </p>
                <p className="mt-1 text-sm text-text-secondary-dark">
                  {submission.ai_notes}
                </p>
              </div>
            )}
          </Card>
        )}

        {latestReview && (
          <Card>
            <h2 className="font-display text-lg font-semibold">Mentor feedback</h2>
            <div className="mt-2">
              <StatusPill
                label={
                  latestReview.decision === "approved"
                    ? "Approved"
                    : "Revision Required"
                }
                variant={
                  latestReview.decision === "approved" ? "approved" : "revision"
                }
              />
            </div>
            {latestReview.feedback && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary-dark">
                {latestReview.feedback}
              </p>
            )}
            <p className="mt-2 text-xs text-text-tertiary-dark">
              Reviewed {new Date(latestReview.reviewed_at).toLocaleString()}
            </p>
          </Card>
        )}

        {canSubmit && (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              {status === "revision_required" ? "Resubmit task" : "Submit task"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary-dark">
              Accepted formats: {task.accepted_formats.join(", ")}
            </p>

            <div className="mt-6 space-y-8">
              {task.accepted_formats.includes("text") && (
                <form action={submitTaskAction} className="space-y-3">
                  <input type="hidden" name="milestoneId" value={milestoneId} />
                  <input type="hidden" name="submissionType" value="text" />
                  <label className="block text-sm font-medium text-text-secondary-dark">
                    Text response
                  </label>
                  <textarea
                    name="text"
                    rows={5}
                    required
                    className={inputClasses}
                    placeholder="Describe your work…"
                  />
                  <Button type="submit">Submit text</Button>
                </form>
              )}

              {task.accepted_formats.includes("link") && (
                <form action={submitTaskAction} className="space-y-3">
                  <input type="hidden" name="milestoneId" value={milestoneId} />
                  <input type="hidden" name="submissionType" value="link" />
                  <label className="block text-sm font-medium text-text-secondary-dark">
                    Link submission
                  </label>
                  <input
                    name="link"
                    type="url"
                    required
                    className={inputClasses}
                    placeholder="https://…"
                  />
                  <Button type="submit">Submit link</Button>
                </form>
              )}

              {(task.accepted_formats.includes("pdf") ||
                task.accepted_formats.includes("image") ||
                task.accepted_formats.includes("excel")) && (
                <form action={submitTaskAction} className="space-y-3">
                  <input type="hidden" name="milestoneId" value={milestoneId} />
                  <input type="hidden" name="submissionType" value="file" />
                  <label className="block text-sm font-medium text-text-secondary-dark">
                    File upload
                  </label>
                  <input
                    name="file"
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.csv"
                    className="block w-full text-sm text-text-secondary-dark file:mr-3 file:rounded-lg file:border-0 file:bg-scalex-red file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                  />
                  <Button type="submit">Upload & submit</Button>
                </form>
              )}
            </div>
          </Card>
        )}

        {unlocked && !canSubmit && status !== "not_started" && (
          <Card>
            <p className="text-sm text-text-secondary-dark">
              Your submission is{" "}
              <span className="text-text-primary-dark">
                {submissionStatusLabel(status).toLowerCase()}
              </span>
              . You&apos;ll be notified when your mentor completes their review.
            </p>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
