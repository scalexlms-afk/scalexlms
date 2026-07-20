import Link from "next/link";
import { Card } from "@scalex/ui";

export function CurrentTaskHero({
  title,
  milestoneTitle,
  description,
  estimatedTimeLabel,
  formatsLabel,
  unlockReward,
  lessonHref,
  canSubmit,
}: {
  title: string;
  milestoneTitle: string;
  description: string;
  estimatedTimeLabel: string;
  formatsLabel: string;
  unlockReward: string;
  lessonHref: string;
  canSubmit: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/25 bg-gradient-to-br from-scalex-red/15 via-surface-2 to-surface-2">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Current Task · {milestoneTitle}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Meta label="Estimated Time" value={estimatedTimeLabel} />
            <Meta label="Due Date" value="No deadline" />
            <Meta label="Formats" value={formatsLabel || "Any"} />
            <Meta label="Reward" value={`Unlock ${unlockReward}`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canSubmit ? (
              <a
                href="#submit"
                className="inline-flex rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white hover:bg-scalex-red-dark"
              >
                Start Task
              </a>
            ) : (
              <a
                href="#review-status"
                className="inline-flex rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white hover:bg-scalex-red-dark"
              >
                View Status
              </a>
            )}
            <Link
              href={lessonHref}
              className="inline-flex rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-3"
            >
              View Lesson
            </Link>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <FolderGraphic />
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function FolderGraphic() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-scalex-red/15 blur-2xl" />
      <svg viewBox="0 0 140 140" className="relative h-32 w-32" fill="none">
        <path
          d="M28 48h28l10 10h46a10 10 0 0 1 10 10v42a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10V58a10 10 0 0 1 10-10Z"
          fill="#1D1D26"
          stroke="#E31E24"
          strokeWidth="2.5"
        />
        <rect x="48" y="36" width="28" height="36" rx="4" fill="#2A2A35" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="96" cy="88" r="18" fill="#E31E24" />
        <path d="M96 78v16M88 86l8-8 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="96" r="12" fill="#22C55E" />
        <path d="m46 96 4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
