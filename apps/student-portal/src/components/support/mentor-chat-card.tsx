"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChatCircle,
  LockSimple,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  mentorInitials,
  type SupportMentorSummary,
} from "@/lib/support-shared";

const MENTOR_FEATURES = [
  "Personal guidance",
  "Assignment feedback",
  "Business support",
  "Implementation help",
] as const;

function MentorAvatar({ mentor }: { mentor: SupportMentorSummary }) {
  if (mentor.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mentor.avatarUrl}
        alt=""
        className="h-11 w-11 rounded-full object-cover ring-1 ring-line"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-purple/20 text-sm font-semibold text-accent-purple ring-1 ring-line">
      {mentorInitials(mentor.name)}
    </span>
  );
}

export function MentorChatCard({
  premium,
  mentor,
}: {
  premium: boolean;
  mentor: SupportMentorSummary | null;
}) {
  const href = premium ? "/messages" : "/payment?mode=upgrade";
  const cta = premium ? "Open Mentor Chat" : "Upgrade for Mentor Chat";

  return (
    <Card className="flex h-full flex-col border-accent-purple/25 bg-gradient-to-br from-accent-purple/10 via-surface-2 to-surface-2">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
          <ChatCircle weight="duotone" className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Chat with Your Mentor
            </h2>
            <span className="inline-flex rounded-full bg-accent-purple/15 px-2 py-0.5 text-[11px] font-semibold text-accent-purple">
              Premium
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Chat privately with your assigned mentor for personalized guidance
            and feedback.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {MENTOR_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-muted">
            <CheckCircle
              weight="fill"
              className="h-4 w-4 shrink-0 text-accent-purple"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      {premium && mentor ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-surface-3/40 px-3 py-2.5">
          <MentorAvatar mentor={mentor} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {mentor.name}
            </p>
            <p className="text-xs text-muted">Amazon FBA Expert</p>
          </div>
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
        >
          {cta}
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
        </Link>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-subtle">
          <LockSimple className="h-3.5 w-3.5" weight="fill" aria-hidden />
          Available for Premium members only
        </p>
      </div>
    </Card>
  );
}
