import { Check } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import type { TimelineStage } from "@/lib/tasks-hub";

export function ReviewTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <Card id="review-status" variant="glass" className="metallic-edge">
      <h2 className="font-display text-lg font-semibold tracking-[-0.025em]">
        Review Status
      </h2>
      <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {stages.map((stage, index) => {
          const next = stages[index + 1];
          const segmentDone =
            stage.state === "done" &&
            (next?.state === "done" || next?.state === "current");

          return (
            <li
              key={stage.id}
              className="relative flex flex-1 items-start gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:pb-0 sm:text-center"
            >
              {index < stages.length - 1 && (
                <>
                  <span
                    className="absolute left-4 top-8 hidden h-[calc(100%-0.5rem)] w-px bg-line sm:hidden"
                    aria-hidden
                  />
                  <span
                    className="absolute left-[calc(50%+1rem)] top-4 hidden h-0.5 w-[calc(100%-2rem)] sm:block"
                    aria-hidden
                  >
                    <span
                      className={`block h-full rounded-full ${
                        segmentDone
                          ? "bg-gradient-to-r from-scalex-red to-scalex-red/70 shadow-[0_0_12px_-2px_rgba(227,30,36,0.55)]"
                          : stage.state === "done"
                            ? "bg-gradient-to-r from-scalex-red/80 to-line"
                            : "bg-line"
                      }`}
                    />
                  </span>
                </>
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold metallic-edge ${
                  stage.state === "done"
                    ? "border border-scalex-red/30 bg-scalex-red text-white shadow-[0_0_20px_-8px_rgba(227,30,36,0.85)]"
                    : stage.state === "current"
                      ? "border border-scalex-red/40 bg-scalex-red text-white ring-4 ring-scalex-red/20 shadow-[0_0_24px_-6px_rgba(227,30,36,0.9)]"
                      : "border border-line bg-surface-3 text-subtle"
                }`}
              >
                {stage.state === "done" ? (
                  <Check weight="bold" className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <p
                className={`max-w-[5.5rem] text-xs text-balance sm:mt-2.5 ${
                  stage.state === "current"
                    ? "font-semibold text-foreground"
                    : stage.state === "done"
                      ? "font-medium text-foreground"
                      : "font-medium text-muted"
                }`}
              >
                {stage.label}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
