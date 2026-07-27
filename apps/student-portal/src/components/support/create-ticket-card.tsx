"use client";

import {
  ArrowRight,
  CheckCircle,
  Ticket,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

const TICKET_FEATURES = [
  "Quick response",
  "Track progress",
  "Priority support for Premium",
  "Detailed resolutions",
] as const;

export function CreateTicketCard({ onCreate }: { onCreate: () => void }) {
  return (
    <Card
      id="create-ticket"
      className="flex h-full flex-col border-accent-blue/25 bg-gradient-to-br from-accent-blue/10 via-surface-2 to-surface-2"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-blue/20 text-accent-blue metallic-edge">
          <Ticket weight="duotone" className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Create a Support Ticket
          </h2>
          <p className="mt-1 text-sm text-muted">
            For technical issues, billing, platform problems or general
            inquiries.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {TICKET_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-muted">
            <CheckCircle
              weight="fill"
              className="h-4 w-4 shrink-0 text-accent-blue"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(59,130,246,0.9)] transition hover:bg-accent-blue/90"
        >
          Create Ticket
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
        </button>
      </div>
    </Card>
  );
}
