"use client";

import Link from "next/link";
import { ArrowRight, Path, Robot, UserCircle } from "@phosphor-icons/react";
import { Card, ProgressBar } from "@scalex/ui";
import { RecentSubmissions } from "@/components/messages/recent-submissions";
import {
  mentorInitials,
  type MentorSummary,
  type MessagesLearningContext,
  type RecentSubmissionItem,
} from "@/lib/messages-shared";

export function MessagesRail({
  mentor,
  context,
  recentSubmissions,
}: {
  mentor: MentorSummary;
  context: MessagesLearningContext;
  recentSubmissions: RecentSubmissionItem[];
}) {
  const askHref = `/ai-mentor?q=${encodeURIComponent(
    `Help me prepare questions for my mentor about ${context.currentTaskTitle ?? context.milestoneTitle}`
  )}`;

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card className="border-accent-purple/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Learning Context
        </p>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div>
            <dt className="text-xs text-muted">Course</dt>
            <dd className="font-medium text-foreground">{context.courseTitle}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Milestone</dt>
            <dd className="font-medium text-accent-purple">
              {context.milestoneTitle}{" "}
              <span className="text-muted">
                (Step {context.milestoneIndex} of {context.milestoneTotal})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Current Lesson</dt>
            <dd className="font-medium text-foreground">
              {context.currentLessonTitle ?? "All lessons complete in stage"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Current Task</dt>
            <dd className="font-medium text-foreground">
              {context.currentTaskTitle ?? "No gating task yet"}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">Journey progress</span>
            <span className="font-semibold text-accent-purple">
              {context.completionPercent}%
            </span>
          </div>
          <ProgressBar value={context.completionPercent} showPercent={false} />
        </div>

        <Link
          href={context.continueHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          <Path weight="bold" className="h-4 w-4" aria-hidden />
          View in Roadmap
        </Link>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Recent Submissions
        </p>
        <div className="mt-3">
          <RecentSubmissions submissions={recentSubmissions} />
        </div>
      </Card>

      <Card className="border-accent-purple/15">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your Mentor
        </p>
        <div className="mt-3 flex items-center gap-3">
          {mentor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover ring-1 ring-line"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-purple/20 text-sm font-semibold text-accent-purple ring-1 ring-line">
              {mentorInitials(mentor.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {mentor.name}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-green">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden />
                Online
              </span>
              <span className="text-xs text-muted">· Amazon FBA Expert</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Mentors review milestone tasks and guide your Amazon launch. Use chat
          for questions about your current stage.
        </p>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-subtle opacity-60"
        >
          <UserCircle weight="bold" className="h-4 w-4" aria-hidden />
          View Profile
        </button>
      </Card>

      <Link
        href={askHref}
        className="flex items-center gap-3 rounded-2xl border border-accent-purple/30 bg-gradient-to-r from-accent-purple/15 via-accent-purple/8 to-transparent px-4 py-4 transition hover:border-accent-purple/50 hover:from-accent-purple/20"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge">
          <Robot weight="duotone" className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-foreground">
            Need immediate help?
          </p>
          <p className="mt-0.5 text-xs text-muted">Ask AI Mentor anytime</p>
        </div>
        <ArrowRight
          weight="bold"
          className="h-4 w-4 shrink-0 text-accent-purple"
          aria-hidden
        />
      </Link>
    </aside>
  );
}
