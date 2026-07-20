import Link from "next/link";
import { Card, ProgressBar } from "@scalex/ui";
import type { ContinueRoadmapStep } from "@/lib/continue-learning";

export function LessonRoadmap({
  steps,
  stepsCompleted,
  stepsTotal,
}: {
  steps: ContinueRoadmapStep[];
  stepsCompleted: number;
  stepsTotal: number;
}) {
  const percent = stepsTotal > 0 ? (stepsCompleted / stepsTotal) * 100 : 0;

  return (
    <div id="how-it-works" className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="font-display text-lg font-semibold">Your Lesson Roadmap</h2>
        {steps.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No lessons in this stage yet. Check the main roadmap.
          </p>
        ) : (
          <ol className="relative mt-5 space-y-0">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const content = (
                <>
                  <StepNode status={step.status} index={index + 1} />
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        step.status === "upcoming" ? "text-muted" : "text-foreground"
                      }`}
                    >
                      {index + 1}. {step.label}
                    </p>
                    <p className="text-xs text-subtle">
                      {step.status === "completed"
                        ? "Completed"
                        : step.status === "current"
                          ? "Up next"
                          : "Upcoming"}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute left-[11px] top-7 h-[calc(100%-0.5rem)] w-px bg-line"
                      aria-hidden
                    />
                  )}
                  {step.href ? (
                    <Link href={step.href} className="flex w-full gap-3 hover:opacity-90">
                      {content}
                    </Link>
                  ) : (
                    <div className="flex w-full gap-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Your Progress Today</h2>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {stepsCompleted} / {Math.max(stepsTotal, 1)} Steps Completed
        </p>
        <ul className="mt-5 space-y-2.5">
          {steps.map((step) => (
            <li key={`progress-${step.id}`} className="flex items-center gap-2 text-sm">
              <span
                className={
                  step.status === "completed"
                    ? "text-accent-green"
                    : step.status === "current"
                      ? "text-scalex-red"
                      : "text-subtle"
                }
              >
                {step.status === "completed" ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m4.5 8 2.2 2.2L11.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
              <span
                className={
                  step.status === "upcoming" ? "text-muted" : "text-foreground"
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ProgressBar value={percent} label="Stage checklist" />
        </div>
      </Card>
    </div>
  );
}

function StepNode({
  status,
  index,
}: {
  status: ContinueRoadmapStep["status"];
  index: number;
}) {
  if (status === "completed") {
    return (
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-scalex-red bg-scalex-red text-[10px] font-bold text-white">
        ✓
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
