"use client";

import { ChatCircle } from "@phosphor-icons/react";
import { BookCallButton } from "@/components/messages/book-call-button";

export function MessagesHero() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <ChatCircle weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Mentor Chat
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Private messaging with your assigned ScaleX mentor
            </p>
          </div>
        </div>
      </div>

      <BookCallButton variant="hero" />
    </div>
  );
}
