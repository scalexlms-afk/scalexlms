import Link from "next/link";
import { Check, Gift } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import type { DashboardMilestone } from "@/lib/dashboard";

export function JourneyProgress({
  milestones,
  nextMilestone,
}: {
  milestones: DashboardMilestone[];
  nextMilestone: DashboardMilestone | null;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Your Journey Progress
          </h2>
          <Link
            href="/roadmap"
            className="text-sm font-medium text-scalex-red hover:underline"
          >
            Full roadmap
          </Link>
        </div>

        {milestones.length === 0 ? (
          <p className="text-sm text-muted">
            Roadmap will appear once a course is published.
          </p>
        ) : (
          <ol className="relative space-y-0">
            {milestones.map((ms, index) => {
              const isLast = index === milestones.length - 1;
              return (
                <li key={ms.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute left-[11px] top-7 h-[calc(100%-0.5rem)] w-px bg-line"
                      aria-hidden
                    />
                  )}
                  <Node status={ms.status} />
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        ms.status === "upcoming"
                          ? "text-muted"
                          : "text-foreground"
                      }`}
                    >
                      {ms.title}
                    </p>
                    <p className="text-xs text-subtle">
                      {ms.status === "completed"
                        ? "Completed"
                        : ms.status === "current"
                          ? "In progress"
                          : "Upcoming"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Card className="flex flex-col">
        <p className={academyEyebrowMutedClass}>Next Unlock</p>
        {nextMilestone ? (
          <>
            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-scalex-red/15 text-scalex-red metallic-edge">
                <Gift weight="duotone" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {nextMilestone.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {nextMilestone.firstModuleTitle
                    ? `Up next: ${nextMilestone.firstModuleTitle}. ${nextMilestone.moduleCount} module${
                        nextMilestone.moduleCount === 1 ? "" : "s"
                      } in this stage.`
                    : `Unlock the next stage of your Amazon launch journey with ${nextMilestone.moduleCount} module${
                        nextMilestone.moduleCount === 1 ? "" : "s"
                      }.`}
                </p>
              </div>
            </div>
            <Link
              href="/roadmap"
              className="mt-auto inline-flex pt-6 text-sm font-semibold text-scalex-red hover:underline"
            >
              See What You&apos;ll Learn →
            </Link>
          </>
        ) : (
          <>
            <h3 className="mt-3 font-display text-xl font-bold text-foreground">
              You&apos;re at the final stage
            </h3>
            <p className="mt-2 text-sm text-muted">
              Finish your current milestone task to complete the program
              pathway.
            </p>
            <Link
              href="/roadmap"
              className="mt-auto inline-flex pt-6 text-sm font-semibold text-scalex-red hover:underline"
            >
              Review roadmap →
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

function Node({ status }: { status: DashboardMilestone["status"] }) {
  if (status === "completed") {
    return (
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-accent-green bg-accent-green/15 text-accent-green">
        <Check weight="bold" className="h-3 w-3" />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-scalex-red bg-scalex-red/15 ring-4 ring-scalex-red/20">
        <span className="h-2 w-2 rounded-full bg-scalex-red" />
      </span>
    );
  }

  return (
    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-line bg-surface-3">
      <span className="h-1.5 w-1.5 rounded-full bg-subtle" />
    </span>
  );
}
