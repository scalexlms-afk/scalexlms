"use client";

import Link from "next/link";
import { ChatCircle, LockSimple } from "@phosphor-icons/react";
import {
  formatSupportThreadTime,
  mentorInitials,
  type ConversationPreviewData,
  type SupportMentorSummary,
} from "@/lib/support-shared";

export function ConversationPreview({
  premium,
  mentor,
  conversation,
}: {
  premium: boolean;
  mentor: SupportMentorSummary | null;
  conversation: ConversationPreviewData | null;
}) {
  if (!premium) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface-3/30 px-4 py-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
          <LockSimple weight="fill" className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          Mentor conversations are a Premium benefit
        </p>
        <p className="mt-1 text-sm text-muted">
          Upgrade to message your assigned mentor privately.
        </p>
        <Link
          href="/payment?mode=upgrade"
          className="mt-4 inline-flex text-sm font-semibold text-accent-purple hover:underline"
        >
          Upgrade now →
        </Link>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface-3/30 px-4 py-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
          <ChatCircle weight="duotone" className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          Mentor assignment pending
        </p>
        <p className="mt-1 text-sm text-muted">
          Once a mentor is assigned, your conversation preview will show here.
        </p>
        <Link
          href="/messages"
          className="mt-4 inline-flex text-sm font-semibold text-accent-purple hover:underline"
        >
          Open Mentor Chat →
        </Link>
      </div>
    );
  }

  const unread = conversation?.unreadFromMentor ?? 0;
  const preview =
    conversation?.lastMessagePreview ?? "No messages yet — say hello";
  const time = conversation?.lastMessageAt
    ? formatSupportThreadTime(conversation.lastMessageAt)
    : null;

  return (
    <ul className="divide-y divide-line rounded-xl border border-line overflow-hidden">
      <li>
        <Link
          href="/messages"
          className="flex items-start gap-3 bg-accent-purple/5 px-4 py-3.5 transition hover:bg-accent-purple/10"
        >
          {mentor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-1 ring-line"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-semibold text-accent-purple ring-1 ring-line">
              {mentorInitials(mentor.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {mentor.name}
                  <span className="ml-1.5 font-normal text-muted">
                    (Mentor)
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {time ? (
                  <span className="text-[11px] text-subtle">{time}</span>
                ) : null}
                {unread > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent-purple px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted">{preview}</p>
          </div>
        </Link>
      </li>
    </ul>
  );
}
