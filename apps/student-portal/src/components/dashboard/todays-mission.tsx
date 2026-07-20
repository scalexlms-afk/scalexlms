import Link from "next/link";
import { Card, StatusPill } from "@scalex/ui";
import {
  submissionStatusLabel,
  submissionStatusVariant,
  type SubmissionStatus,
} from "@scalex/db";

export function TodaysMission({
  title,
  description,
  status,
  lessonsLeft,
  unlocksLabel,
  continueHref,
}: {
  title: string | null;
  description: string | null;
  status: SubmissionStatus;
  lessonsLeft: number;
  unlocksLabel: string;
  continueHref: string;
}) {
  const effortLabel =
    lessonsLeft === 0
      ? "Ready to submit"
      : lessonsLeft === 1
        ? "1 lesson left"
        : `${lessonsLeft} lessons left`;

  return (
    <Card className="relative overflow-hidden">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-scalex-red/15 text-scalex-red">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 2.5 14.2 8.2 20 9.1 15.7 13.2 16.9 19 12 16.2 7.1 19l1.2-5.8L4 9.1l5.8-.9L12 2.5Z" />
              </svg>
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Today&apos;s Mission
            </p>
          </div>

          <h2 className="mt-3 font-display text-xl font-bold text-foreground md:text-2xl">
            {title ?? "Continue your roadmap"}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetaChip label="Progress focus" value={effortLabel} />
            <MetaChip label="Priority" value="Required" />
            <MetaChip label="Unlocks next" value={unlocksLabel} />
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {description?.trim() ||
              "Complete the lessons for this stage, then submit your milestone deliverable for mentor review."}
          </p>

          <div className="mt-3">
            <StatusPill
              label={submissionStatusLabel(status)}
              variant={submissionStatusVariant(status)}
            />
          </div>

          <Link
            href={continueHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-scalex-red-dark sm:w-auto"
          >
            Continue Journey →
          </Link>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <ClipboardGraphic />
        </div>
      </div>
    </Card>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-3/60 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ClipboardGraphic() {
  return (
    <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-surface-3/80 ring-1 ring-line">
      <svg viewBox="0 0 80 80" className="h-24 w-24 text-scalex-red" fill="none">
        <rect
          x="18"
          y="14"
          width="44"
          height="54"
          rx="6"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M30 14v-2a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v2"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="m28 36 6 6 12-14M28 50h20"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M52 58c6-2 10-8 10-14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
