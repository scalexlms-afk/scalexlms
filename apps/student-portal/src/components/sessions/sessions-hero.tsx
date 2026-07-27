"use client";

import { Bell, BookmarkSimple, VideoCamera } from "@phosphor-icons/react";

export function SessionsHero() {
  function scrollToBookings() {
    document
      .getElementById("my-bookings")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <VideoCamera weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Live Sessions
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Join live classes, Q&amp;As, and catch up on recordings
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          title="Coming soon"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5 text-sm font-medium text-subtle/80"
        >
          <Bell weight="bold" className="h-4 w-4" aria-hidden />
          Reminder
          <span className="text-[10px] uppercase tracking-wider">Soon</span>
        </span>
        <button
          type="button"
          onClick={scrollToBookings}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
        >
          <BookmarkSimple weight="bold" className="h-4 w-4" aria-hidden />
          My Bookings
        </button>
      </div>
    </div>
  );
}
