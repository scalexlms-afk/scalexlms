"use client";

import { Ticket } from "@phosphor-icons/react";
import { StatusPill } from "@scalex/ui";
import {
  formatTicketDate,
  formatTicketId,
  ticketStatusLabel,
  ticketStatusVariant,
  type SupportTicketItem,
} from "@/lib/support-shared";

export function TicketList({ tickets }: { tickets: SupportTicketItem[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface-3/30 px-4 py-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15 text-accent-blue">
          <Ticket weight="duotone" className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          No tickets yet
        </p>
        <p className="mt-1 text-sm text-muted">
          Create a ticket when you need help with billing, access, or platform
          issues.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="flex items-start gap-3 rounded-xl border border-line bg-surface-3/30 px-3.5 py-3"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-blue/15 text-accent-blue">
            <Ticket weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {ticket.subject}
                </p>
                <p className="mt-0.5 text-xs text-subtle">
                  {formatTicketId(ticket.id)} · {formatTicketDate(ticket.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {ticket.priority === "high" ? (
                  <StatusPill label="Priority" variant="review" />
                ) : null}
                <StatusPill
                  label={ticketStatusLabel(ticket.status)}
                  variant={ticketStatusVariant(ticket.status)}
                />
              </div>
            </div>
            {ticket.staffReply ? (
              <p className="mt-2 line-clamp-2 text-xs text-muted">
                Reply: {ticket.staffReply}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
