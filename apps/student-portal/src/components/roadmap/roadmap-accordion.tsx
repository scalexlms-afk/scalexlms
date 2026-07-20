"use client";

import { useState } from "react";
import { CaretDown, Check, Lock } from "@phosphor-icons/react";
import { Card, StatusPill } from "@scalex/ui";
import type { RoadmapMilestoneItem } from "@/lib/roadmap";
import { MilestonePanel } from "./milestone-panel";

export function RoadmapAccordion({
  milestones,
  defaultOpenId,
  mentorHref,
  currentStage,
}: {
  milestones: RoadmapMilestoneItem[];
  defaultOpenId: string | null;
  mentorHref: string;
  currentStage: string;
}) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? milestones.find((m) => m.status === "current")?.id ?? null
  );

  const askAiHref = `/ai-mentor?q=${encodeURIComponent(
    `Help me with ${currentStage}`
  )}`;

  return (
    <div className="relative space-y-3">
      {milestones.map((ms, index) => {
        const isOpen = openId === ms.id;
        const isLast = index === milestones.length - 1;

        return (
          <div key={ms.id} className="relative flex gap-3">
            {!isLast && (
              <span
                className="absolute left-[19px] top-12 h-[calc(100%-0.5rem)] w-px bg-line"
                aria-hidden
              />
            )}

            <div className="relative z-10 pt-5">
              <MilestoneNode status={ms.status} unlocked={ms.unlocked} number={ms.orderIndex} />
            </div>

            <Card className="min-w-0 flex-1 !p-4 md:!p-5">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : ms.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {ms.title}
                    </h3>
                    {ms.status === "completed" && (
                      <StatusPill label="Completed" variant="approved" />
                    )}
                    {ms.status === "current" && (
                      <>
                        <span className="inline-flex items-center rounded-full bg-scalex-red/15 px-2.5 py-1 text-xs font-medium text-scalex-red">
                          Current
                        </span>
                        <span className="text-xs font-semibold text-scalex-red">
                          In Progress
                        </span>
                      </>
                    )}
                    {ms.status === "upcoming" && !ms.unlocked && (
                      <StatusPill label="Locked" variant="inactive" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {ms.status === "completed"
                      ? "100% complete"
                      : `${ms.lessonsDone}/${ms.lessonsTotal} lessons`}
                  </p>
                </div>
                <span className="mt-1 shrink-0 text-muted" aria-hidden>
                  <CaretDown
                    weight="bold"
                    className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {isOpen && (
                <MilestonePanel
                  milestone={ms}
                  mentorHref={mentorHref}
                  askAiHref={askAiHref}
                />
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function MilestoneNode({
  status,
  unlocked,
  number,
}: {
  status: RoadmapMilestoneItem["status"];
  unlocked: boolean;
  number: number;
}) {
  if (status === "completed") {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-green bg-accent-green/15 text-accent-green">
        <Check weight="bold" className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-scalex-red bg-scalex-red text-sm font-bold text-white ring-4 ring-scalex-red/20">
        {number}
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-surface-3 text-subtle">
      {unlocked ? (
        <span className="text-sm font-bold">{number}</span>
      ) : (
        <Lock weight="bold" className="h-4 w-4" aria-hidden />
      )}
    </span>
  );
}
