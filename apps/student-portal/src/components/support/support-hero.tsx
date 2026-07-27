"use client";

import { Headset } from "@phosphor-icons/react";
import { planLabel, planPillVariant } from "@scalex/db";
import { StatusPill } from "@scalex/ui";

export function SupportHero({ plan }: { plan: string | null }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <Headset weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Support
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Get help from your mentor or our support team.
            </p>
          </div>
        </div>
      </div>
      <StatusPill label={planLabel(plan)} variant={planPillVariant(plan)} />
    </div>
  );
}
