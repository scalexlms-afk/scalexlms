import { Star } from "@phosphor-icons/react/dist/ssr";
import { Card, StatusPill } from "@scalex/ui";
import {
  submissionStatusLabel,
  submissionStatusVariant,
  type SubmissionStatus,
} from "@scalex/db";
import {
  AcademyCtaLink,
  academyEyebrowClass,
  academyEyebrowMutedClass,
} from "@/components/academy-cta";
import { AcademyIllustration } from "@/components/academy-illustration";

export function TodaysMission({
  title,
  description,
  status,
  lessonsLeft,
  unlocksLabel,
  continueHref,
  kind = "continue",
}: {
  title: string | null;
  description: string | null;
  status: SubmissionStatus;
  lessonsLeft: number;
  unlocksLabel: string;
  continueHref: string;
  kind?: "watch" | "submit" | "continue";
}) {
  const effortLabel =
    kind === "watch"
      ? "Watch next lesson"
      : kind === "submit"
        ? "Submit deliverable"
        : lessonsLeft === 0
          ? "Ready to submit"
          : lessonsLeft === 1
            ? "1 lesson left"
            : `${lessonsLeft} lessons left`;

  return (
    <Card className="relative overflow-hidden border-scalex-red/30 bg-scalex-red/[0.07]">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-scalex-red/15 text-scalex-red metallic-edge">
              <Star weight="fill" className="h-4 w-4" />
            </span>
            <p className={academyEyebrowMutedClass}>Today&apos;s Mission</p>
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

          <AcademyCtaLink href={continueHref} className="mt-6 w-full sm:w-auto">
            {kind === "watch"
              ? "Watch lesson →"
              : kind === "submit"
                ? "Submit task →"
                : "Continue Journey →"}
          </AcademyCtaLink>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <AcademyIllustration
            src="/illustrations/clipboard-checks.png"
            size={160}
          />
        </div>
      </div>
    </Card>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-3/60 px-3 py-2.5 metallic-edge">
      <p className={academyEyebrowClass}>{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
