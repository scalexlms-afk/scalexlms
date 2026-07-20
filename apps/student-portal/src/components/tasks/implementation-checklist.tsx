import { Check } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import type { ChecklistStep } from "@/lib/tasks-hub";

export function ImplementationChecklist({ steps }: { steps: ChecklistStep[] }) {
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">
        Implementation Checklist
      </h2>
      <ol className="relative mt-5 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[11px] top-7 h-[calc(100%-0.5rem)] w-px bg-line"
                  aria-hidden
                />
              )}
              <StepNode status={step.status} index={index + 1} />
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    step.status === "upcoming" ? "text-muted" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-subtle">
                  {step.status === "completed"
                    ? "Completed"
                    : step.status === "current"
                      ? "Current step"
                      : "Upcoming"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function StepNode({
  status,
  index,
}: {
  status: ChecklistStep["status"];
  index: number;
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
        {index}
      </span>
    );
  }
  return (
    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-line bg-surface-3 text-[10px] font-bold text-subtle">
      {index}
    </span>
  );
}
