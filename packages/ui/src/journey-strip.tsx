"use client";

export interface JourneyStep {
  id: string;
  number: number;
  title: string;
  description?: string;
  color?: string;
  status?: "completed" | "current" | "upcoming";
}

interface JourneyStripProps {
  steps: JourneyStep[];
  onStepClick?: (step: JourneyStep) => void;
}

const statusRing: Record<NonNullable<JourneyStep["status"]>, string> = {
  completed: "border-accent-green bg-accent-green/10 text-accent-green",
  current:
    "border-scalex-red bg-scalex-red/10 ring-4 ring-scalex-red/20 text-scalex-red",
  upcoming: "border-line bg-surface-3 text-subtle",
};

export function JourneyStrip({ steps, onStepClick }: JourneyStripProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-start gap-1 px-1">
        {steps.map((step, index) => {
          const status = step.status ?? "upcoming";
          const isCompleted = status === "completed";

          return (
            <div key={step.id} className="flex items-start">
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                disabled={!onStepClick}
                className="group flex w-36 flex-col items-center text-center outline-none disabled:cursor-default"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-transform duration-200 group-enabled:group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-scalex-red/50 ${statusRing[status]}`}
                >
                  {isCompleted ? (
                    <span aria-label="completed">✓</span>
                  ) : (
                    step.number
                  )}
                </div>
                <p
                  className={`mt-3 text-sm font-semibold ${
                    status === "upcoming"
                      ? "text-muted"
                      : "text-foreground"
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-1 text-xs text-subtle">
                    {step.description}
                  </p>
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`mx-1 mt-6 h-0.5 w-8 rounded-full ${
                    isCompleted
                      ? "bg-accent-green/50"
                      : "border-t-2 border-dashed border-line bg-transparent"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
