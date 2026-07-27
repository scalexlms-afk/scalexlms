"use client";

import { Plus, Robot } from "@phosphor-icons/react";

export function AiMentorHero({
  milestoneTitle,
  onNewChat,
}: {
  milestoneTitle: string;
  onNewChat: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <Robot weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              AI Mentor
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Your 24/7 AI coach for your Amazon business journey
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/10 px-2.5 py-1 text-xs font-semibold text-accent-green">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden />
            Online
          </span>
        </div>
        <p className="mt-3 text-sm text-muted">
          Business stage:{" "}
          <span className="font-medium text-foreground">{milestoneTitle}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
      >
        <Plus weight="bold" className="h-4 w-4" aria-hidden />
        New Chat
      </button>
    </div>
  );
}
