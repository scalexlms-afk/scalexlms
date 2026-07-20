import { Card } from "@scalex/ui";
import type { TimelineStage } from "@/lib/tasks-hub";

export function ReviewTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <Card id="review-status">
      <h2 className="font-display text-lg font-semibold">Review Status</h2>
      <ol className="mt-5 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            className="relative flex flex-1 items-start gap-3 pb-4 sm:flex-col sm:items-center sm:pb-0 sm:text-center"
          >
            {index < stages.length - 1 && (
              <span
                className="absolute left-3 top-6 hidden h-px w-[calc(100%-1.5rem)] translate-x-1/2 bg-line sm:block"
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                stage.state === "done"
                  ? "bg-accent-green text-white"
                  : stage.state === "current"
                    ? "bg-scalex-red text-white ring-4 ring-scalex-red/20"
                    : "bg-surface-3 text-subtle"
              }`}
            >
              {stage.state === "done" ? "✓" : index + 1}
            </span>
            <p
              className={`text-xs font-medium sm:mt-2 ${
                stage.state === "upcoming" ? "text-muted" : "text-foreground"
              }`}
            >
              {stage.label}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
