import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewTimeline } from "@/components/tasks/review-timeline";
import { TaskSubmitForm } from "@/components/tasks/task-submit-form";
import { requireStudentProfile } from "@/lib/auth";
import {
  getTaskByMilestoneId,
  getSubmissionForTask,
  isMilestoneUnlocked,
} from "@/lib/data";
import { buildReviewTimeline } from "@/lib/tasks-hub";
import { createClient } from "@scalex/db/server";
import {
  submissionStatusLabel,
  submissionStatusVariant,
} from "@scalex/db";
import { Card, StatusPill } from "@scalex/ui";

function SubmissionContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  if (content.type === "text" && typeof content.text === "string") {
    return (
      <p className="whitespace-pre-wrap text-sm text-foreground">
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
      <p className="text-sm text-foreground">
        Uploaded file: {content.file_name}
      </p>
    );
  }
  if (typeof content.comments === "string" && content.comments) {
    return (
      <p className="whitespace-pre-wrap text-sm text-foreground">
        {content.comments}
      </p>
    );
  }
  return (
    <pre className="overflow-x-auto text-xs text-muted">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

export default async function TaskDetailPage({
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
  const hasAiNotes = Boolean(
    submission?.ai_notes || submission?.ai_score != null
  );
  const hasMentorReview = Boolean(latestReview);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseTitle = (milestone as any).courses?.title as string | undefined;
  const milestoneTitle = (milestone as { title: string }).title;

  return (
    <>
      <div className="academy-page mx-auto max-w-3xl space-y-6">
        <div>
          {courseTitle ? (
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              <Link href="/tasks" className="hover:text-foreground">
                Tasks
              </Link>
              <span className="mx-1.5 text-faint">·</span>
              {courseTitle} · {milestoneTitle}
            </p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              <Link href="/tasks" className="hover:text-foreground">
                ← Back to Tasks
              </Link>
            </p>
          )}
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
              {task.title}
            </h1>
            <StatusPill
              label={submissionStatusLabel(status)}
              variant={submissionStatusVariant(status)}
            />
          </div>
          {task.description ? (
            <p className="mt-3 text-muted">{task.description}</p>
          ) : null}
        </div>

        {!unlocked ? (
          <Card className="border-accent-amber/30 bg-accent-amber/5">
            <p className="text-sm text-accent-amber">
              This milestone task is locked. Complete and get approval on the
              previous milestone task to unlock it.
            </p>
          </Card>
        ) : null}

        <ReviewTimeline
          stages={buildReviewTimeline(status, hasAiNotes, hasMentorReview)}
        />

        {submission && status !== "not_started" ? (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              Your submission
            </h2>
            <div className="mt-3">
              <SubmissionContent content={submission.content} />
            </div>
            {typeof submission.content?.comments === "string" &&
            submission.content.comments &&
            submission.content.type !== "text" ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                Comments: {String(submission.content.comments)}
              </p>
            ) : null}
            {submission.submitted_at ? (
              <p className="mt-2 text-xs text-subtle">
                Submitted {new Date(submission.submitted_at).toLocaleString()}
              </p>
            ) : null}
            {submission.ai_score != null ? (
              <p className="mt-3 text-sm text-muted">
                AI pre-score:{" "}
                <span className="font-medium text-foreground">
                  {Math.round(submission.ai_score)}/100
                </span>
              </p>
            ) : null}
            {submission.ai_notes ? (
              <div className="mt-3 rounded-lg bg-surface-3 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  AI feedback
                </p>
                <p className="mt-1 text-sm text-muted">{submission.ai_notes}</p>
              </div>
            ) : null}
          </Card>
        ) : null}

        {latestReview ? (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              Mentor feedback
            </h2>
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
            {latestReview.feedback ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                {latestReview.feedback}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-subtle">
              Reviewed {new Date(latestReview.reviewed_at).toLocaleString()}
            </p>
          </Card>
        ) : null}

        <TaskSubmitForm
          milestoneId={milestoneId}
          acceptedFormats={task.accepted_formats}
          canSubmit={canSubmit}
          lockedMessage={
            !unlocked
              ? "This milestone task is locked."
              : status === "approved"
                ? "This task was approved. No further submission needed."
                : "Your submission is under review. You'll be notified when your mentor finishes."
          }
        />
      </div>
    </>
  );
}
