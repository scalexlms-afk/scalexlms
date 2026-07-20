import Link from "next/link";
import { Card } from "@scalex/ui";

export function MissionHero({
  title,
  body,
  estimatedTimeLabel,
  difficultyLabel,
  continueHref,
}: {
  title: string;
  body: string;
  estimatedTimeLabel: string;
  difficultyLabel: string;
  continueHref: string;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/25 bg-gradient-to-br from-scalex-red/15 via-surface-2 to-surface-2">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-scalex-red/20 text-scalex-red">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 2.5 14.2 8.2 20 9.1 15.7 13.2 16.9 19 12 16.2 7.1 19l1.2-5.8L4 9.1l5.8-.9L12 2.5Z" />
              </svg>
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Today&apos;s Mission
            </p>
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {body}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <MetaChip icon="clock" label="Estimated Time" value={estimatedTimeLabel} />
            <MetaChip icon="flag" label="Priority" value="Required" />
            <MetaChip icon="signal" label="Format" value={difficultyLabel} />
          </div>

          <Link
            href={continueHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-scalex-red-dark sm:w-auto"
          >
            Continue Journey →
          </Link>
          <p className="mt-3 text-xs text-subtle">
            This step is required to unlock the next milestone.
          </p>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <FolderUploadGraphic />
        </div>
      </div>
    </Card>
  );
}

function MetaChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: "clock" | "flag" | "signal";
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/70 px-3 py-2">
      <span className="text-scalex-red">
        {icon === "clock" && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        {icon === "flag" && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M5 21V4h10l-1.5 3.5L18 11H5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        )}
        {icon === "signal" && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M5 18V14M10 18V10M15 18V7M20 18V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FolderUploadGraphic() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-scalex-red/10 blur-2xl" />
      <svg viewBox="0 0 140 140" className="relative h-36 w-36" fill="none" aria-hidden>
        <path
          d="M28 48h28l10 10h46a10 10 0 0 1 10 10v42a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10V58a10 10 0 0 1 10-10Z"
          fill="#1D1D26"
          stroke="#E31E24"
          strokeWidth="2.5"
        />
        <rect x="48" y="36" width="28" height="36" rx="4" fill="#2A2A35" stroke="#9CA3AF" strokeWidth="1.5" />
        <rect x="78" y="44" width="24" height="30" rx="3" fill="#2A2A35" stroke="#9CA3AF" strokeWidth="1.5" />
        <circle cx="96" cy="88" r="18" fill="#E31E24" />
        <path d="M96 78v16M88 86l8-8 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="96" r="12" fill="#22C55E" />
        <path d="m46 96 4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
