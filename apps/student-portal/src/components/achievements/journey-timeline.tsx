import { Check, Circle } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import type { DashboardMilestone } from "@/lib/dashboard";

export function JourneyTimeline({
  milestones,
}: {
  milestones: DashboardMilestone[];
}) {
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">
        Business Journey Timeline
      </h2>
      {milestones.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No milestones available yet.</p>
      ) : (
        <ol className="relative mt-5 space-y-0">
          {milestones.map((ms, index) => {
            const isLast = index === milestones.length - 1;
            return (
              <li key={ms.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-[11px] top-7 h-[calc(100%-0.5rem)] w-px bg-line"
                    aria-hidden
                  />
                )}
                <TimelineNode status={ms.status} />
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
                        ? "In Progress"
                        : "Upcoming"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function TimelineNode({
  status,
}: {
  status: DashboardMilestone["status"];
}) {
  if (status === "completed") {
    return (
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green text-[10px] font-bold text-white">
        <Check weight="bold" className="h-3 w-3" aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-scalex-red bg-scalex-red/15 text-[10px] font-bold text-scalex-red ring-4 ring-scalex-red/15">
        <Circle weight="fill" className="h-2 w-2" aria-hidden />
      </span>
    );
  }
  return (
    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-line bg-surface-3 text-[10px] font-bold text-subtle">
      <Circle weight="regular" className="h-2.5 w-2.5" aria-hidden />
    </span>
  );
}
