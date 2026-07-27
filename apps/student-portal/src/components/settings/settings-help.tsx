"use client";

import Link from "next/link";
import { ArrowSquareOut, GearSix } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

export function SettingsHelp() {
  return (
    <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/12 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <GearSix weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm text-foreground">
            Need help with settings? Read our help articles or contact support.
          </p>
        </div>
        <Link
          href="/support"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3.5 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          Visit Help Center
          <ArrowSquareOut weight="bold" className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
