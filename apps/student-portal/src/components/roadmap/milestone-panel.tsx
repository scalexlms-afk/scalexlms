import Link from "next/link";
import {
  Check,
  Gift,
  Lock,
  Play,
  Robot,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { AcademyCtaLink } from "@/components/academy-cta";
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
      <div className="rounded-xl border border-line bg-surface-3/40 p-4 metallic-edge">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-accent-purple" aria-hidden>
            <Gift weight="duotone" className="h-4 w-4" />
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
            <AcademyCtaLink
              href={`/tasks/${milestone.task.id}`}
              className="mt-3 !px-4 !py-2"
            >
              Continue Task →
            </AcademyCtaLink>
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
          <Robot weight="duotone" className="h-4 w-4" aria-hidden />
          Ask AI
        </Link>
        <Link
          href={mentorHref}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3"
        >
          <UserCircle weight="duotone" className="h-4 w-4" aria-hidden />
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
        <Check weight="bold" className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-subtle">
        <Lock weight="bold" className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-scalex-red/15 text-scalex-red">
      <Play weight="fill" className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}
