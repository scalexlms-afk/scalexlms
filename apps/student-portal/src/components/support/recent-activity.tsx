"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { ConversationPreview } from "@/components/support/conversation-preview";
import { TicketList } from "@/components/support/ticket-list";
import type {
  ConversationPreviewData,
  SupportMentorSummary,
  SupportTicketItem,
} from "@/lib/support-shared";

type ActivityTab = "conversations" | "tickets";

export function RecentActivity({
  premium,
  mentor,
  conversation,
  tickets,
}: {
  premium: boolean;
  mentor: SupportMentorSummary | null;
  conversation: ConversationPreviewData | null;
  tickets: SupportTicketItem[];
}) {
  const [tab, setTab] = useState<ActivityTab>("conversations");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Your Recent Activity
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Mentor conversations and support tickets in one place.
        </p>
      </div>

      {/* Mobile: tabbed */}
      <Card className="border-accent-purple/15 p-0 overflow-hidden lg:hidden">
        <div
          className="flex gap-1 border-b border-line px-3 pt-3"
          role="tablist"
          aria-label="Recent activity"
        >
          <TabButton
            active={tab === "conversations"}
            onClick={() => setTab("conversations")}
          >
            Mentor Conversations
          </TabButton>
          <TabButton
            active={tab === "tickets"}
            onClick={() => setTab("tickets")}
          >
            Support Tickets
            {tickets.length > 0 ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-bold text-muted">
                {tickets.length}
              </span>
            ) : null}
          </TabButton>
        </div>

        <div className="p-4" role="tabpanel">
          {tab === "conversations" ? (
            <ConversationPreview
              premium={premium}
              mentor={mentor}
              conversation={conversation}
            />
          ) : (
            <TicketList tickets={tickets} />
          )}
        </div>

        <div className="border-t border-line px-4 py-3">
          {tab === "conversations" ? (
            <ConversationsFooterLink premium={premium} />
          ) : (
            <span className="text-sm text-muted">
              {tickets.length === 0
                ? "No tickets yet"
                : `${tickets.length} recent ${tickets.length === 1 ? "ticket" : "tickets"}`}
            </span>
          )}
        </div>
      </Card>

      {/* Desktop: two columns matching mockup */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <Card className="border-accent-purple/15 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-sm font-semibold text-foreground">
              Mentor Conversations
            </h3>
          </div>
          <div className="p-5">
            <ConversationPreview
              premium={premium}
              mentor={mentor}
              conversation={conversation}
            />
          </div>
          <div className="border-t border-line px-5 py-3">
            <ConversationsFooterLink premium={premium} />
          </div>
        </Card>

        <Card className="border-accent-blue/15 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-sm font-semibold text-foreground">
              Support Tickets
            </h3>
            {tickets.length > 0 ? (
              <span className="text-xs text-muted">{tickets.length}</span>
            ) : null}
          </div>
          <div className="p-5">
            <TicketList tickets={tickets} />
          </div>
          <div className="border-t border-line px-5 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-purple">
              {tickets.length === 0
                ? "Create a ticket above to get started"
                : "All recent tickets listed"}
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function ConversationsFooterLink({ premium }: { premium: boolean }) {
  if (premium) {
    return (
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-purple hover:underline"
      >
        View all conversations
        <ArrowRight className="h-3.5 w-3.5" weight="bold" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href="/payment?mode=upgrade"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-purple hover:underline"
    >
      Upgrade for Mentor Chat
      <ArrowRight className="h-3.5 w-3.5" weight="bold" aria-hidden />
    </Link>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-3 py-2.5 text-sm font-semibold transition ${
        active ? "text-accent-purple" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-purple" />
      ) : null}
    </button>
  );
}
