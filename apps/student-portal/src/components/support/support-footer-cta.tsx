"use client";

import { EnvelopeSimple, Headset } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

export function SupportFooterCta({ onContact }: { onContact: () => void }) {
  return (
    <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/12 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge"
            aria-hidden
          >
            <Headset weight="fill" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              Still need help?
            </p>
            <p className="mt-1 text-sm text-muted">
              Our support team is available 7 days a week.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContact}
          className="inline-flex items-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-4 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          <EnvelopeSimple weight="bold" className="h-4 w-4" aria-hidden />
          Contact Support Team
        </button>
      </div>
    </Card>
  );
}
