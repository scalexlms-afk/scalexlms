"use client";

import Link from "next/link";
import {
  Funnel,
  Lifebuoy,
  PencilSimple,
  Robot,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  formatThreadTime,
  mentorInitials,
  type MentorSummary,
} from "@/lib/messages-shared";

function Avatar({
  name,
  avatarUrl,
  tone = "purple",
}: {
  name: string;
  avatarUrl?: string | null;
  tone?: "purple" | "muted" | "ai";
}) {
  const toneClass =
    tone === "ai"
      ? "bg-accent-purple/20 text-accent-purple"
      : tone === "muted"
        ? "bg-surface-3 text-muted"
        : "bg-accent-purple/20 text-accent-purple";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-10 w-10 rounded-full object-cover ring-1 ring-line"
      />
    );
  }

  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line ${toneClass}`}
    >
      {tone === "ai" ? (
        <Robot weight="fill" className="h-4 w-4" aria-hidden />
      ) : tone === "muted" ? (
        <Lifebuoy weight="fill" className="h-4 w-4" aria-hidden />
      ) : (
        mentorInitials(name)
      )}
    </span>
  );
}

function ConversationList({
  mentor,
  unreadFromMentor,
  lastMessagePreview,
  lastMessageAt,
}: {
  mentor: MentorSummary;
  unreadFromMentor: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Conversations
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="cursor-default rounded-lg p-1.5 text-subtle/70"
            aria-label="Filter conversations"
          >
            <Funnel className="h-4 w-4" weight="bold" />
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="cursor-default rounded-lg p-1.5 text-subtle/70"
            aria-label="New message"
          >
            <PencilSimple className="h-4 w-4" weight="bold" />
          </button>
        </div>
      </div>

      <ul className="divide-y divide-line">
        <li>
          <div className="flex w-full items-start gap-3 bg-accent-purple/10 px-4 py-3">
            <Avatar name={mentor.name} avatarUrl={mentor.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {mentor.name}
                  </p>
                  <p className="text-[11px] text-muted">Your Mentor</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {lastMessageAt ? (
                    <span className="text-[11px] text-subtle">
                      {formatThreadTime(lastMessageAt)}
                    </span>
                  ) : null}
                  {unreadFromMentor > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-scalex-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadFromMentor > 9 ? "9+" : unreadFromMentor}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                {lastMessagePreview ?? "No messages yet — say hello"}
              </p>
            </div>
          </div>
        </li>

        <li>
          <Link
            href="/support"
            className="flex w-full items-start gap-3 px-4 py-3 transition hover:bg-surface-3/50"
          >
            <Avatar name="Support" tone="muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                ScaleX Support
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                Tickets, billing help, and account questions
              </p>
            </div>
          </Link>
        </li>

        <li>
          <Link
            href="/ai-mentor"
            className="flex w-full items-start gap-3 px-4 py-3 transition hover:bg-surface-3/50"
          >
            <Avatar name="AI Mentor" tone="ai" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                AI Mentor
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                24/7 curriculum-grounded answers
              </p>
            </div>
          </Link>
        </li>
      </ul>

      <div className="border-t border-line px-4 py-3">
        <span
          title="Coming soon"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-accent-purple/35 px-3 py-2 text-xs font-semibold text-accent-purple"
        >
          View All Conversations
        </span>
      </div>
    </>
  );
}

export function ConversationRail({
  mentor,
  unreadFromMentor,
  lastMessagePreview,
  lastMessageAt,
  collapsible = false,
  fillHeight = false,
}: {
  mentor: MentorSummary;
  unreadFromMentor: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  collapsible?: boolean;
  fillHeight?: boolean;
}) {
  const body = (
    <ConversationList
      mentor={mentor}
      unreadFromMentor={unreadFromMentor}
      lastMessagePreview={lastMessagePreview}
      lastMessageAt={lastMessageAt}
    />
  );

  if (collapsible) {
    return (
      <aside>
        <details className="group rounded-2xl border border-accent-purple/20 bg-surface-2/40 open:bg-surface-2/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Conversations
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {mentor.name}
                {unreadFromMentor > 0 ? (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-scalex-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadFromMentor > 9 ? "9+" : unreadFromMentor}
                  </span>
                ) : null}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-accent-purple group-open:hidden">
              Show
            </span>
            <span className="hidden shrink-0 text-xs font-medium text-muted group-open:inline">
              Hide
            </span>
          </summary>
          <div className="border-t border-line">{body}</div>
        </details>
      </aside>
    );
  }

  return (
    <aside className={fillHeight ? "flex h-full min-h-0 flex-col" : "space-y-3"}>
      <Card
        className={`!p-0 overflow-hidden border-accent-purple/20 ${
          fillHeight ? "flex h-full min-h-0 flex-col" : ""
        }`}
      >
        <div
          className={
            fillHeight ? "flex min-h-0 flex-1 flex-col overflow-y-auto" : undefined
          }
        >
          {body}
        </div>
      </Card>
    </aside>
  );
}
