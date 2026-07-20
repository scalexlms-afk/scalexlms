import Link from "next/link";
import { ProgressBar } from "@scalex/ui";
import type { RoadmapLessonItem, RoadmapMilestoneItem } from "@/lib/roadmap";

export function MilestonePanel({
  milestone,
  mentorHref,
  askAiHref,
}: {
  milestone: RoadmapMilestoneItem;
  mentorHref: string;
  askAiHref: string;
}) {
  return (
    <div className="mt-4 space-y-5 border-t border-line pt-5">
      <div className="rounded-xl border border-line bg-surface-3/40 p-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-scalex-red" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm2-4h12l2 4H4l2-4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Why This Matters
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {milestone.whyThisMatters}
            </p>
          </div>
        </div>
      </div>

      <div>
        <ProgressBar
          value={milestone.progressPercent}
          label={`${milestone.lessonsDone}/${milestone.lessonsTotal} Lessons Completed`}
          showPercent={false}
        />
      </div>

      <ul className="space-y-2">
        {milestone.lessons.map((lesson) => {
          const interactive = lesson.status !== "locked";
          const row = (
            <>
              <LessonIcon status={lesson.status} />
              <span
                className={`flex-1 text-sm ${
                  lesson.status === "completed"
                    ? "text-muted"
                    : lesson.status === "locked"
                      ? "text-subtle"
                      : "text-foreground"
                }`}
              >
                {lesson.title}
              </span>
            </>
          );

          return (
            <li key={lesson.id}>
              {interactive ? (
                <Link
                  href={lesson.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-3"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg px-2 py-2 opacity-70">
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {milestone.task && (
        <div className="rounded-xl border border-scalex-red/30 bg-scalex-red/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Milestone Task
          </p>
          <p className="mt-1 font-semibold text-foreground">
            {milestone.task.title}
          </p>
          {milestone.unlocked ? (
            <Link
              href={`/tasks/${milestone.id}`}
              className="mt-3 inline-flex rounded-lg bg-scalex-red px-4 py-2 text-sm font-semibold text-white hover:bg-scalex-red-dark"
            >
              Continue Task →
            </Link>
          ) : (
            <p className="mt-2 text-sm text-subtle">
              Unlock previous milestone to start this task.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={askAiHref}
          className="inline-flex items-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-4 py-2 text-sm font-semibold text-accent-purple hover:bg-accent-purple/15"
        >
          Ask AI
        </Link>
        <Link
          href={mentorHref}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3"
        >
          Book Mentor Call
        </Link>
      </div>
    </div>
  );
}

function LessonIcon({ status }: { status: RoadmapLessonItem["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-green/15 text-accent-green">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
          <path
            d="m3.5 8 3 3 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-subtle">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
          <path
            d="M8 11V8a4 4 0 1 1 8 0v3M7 11h10v9H7v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-scalex-red/15 text-scalex-red">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M9 7.5v9l8-4.5-8-4.5Z" />
      </svg>
    </span>
  );
}
