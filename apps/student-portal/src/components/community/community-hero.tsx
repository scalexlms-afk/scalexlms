"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  Question,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";

export function CommunityHero({
  searchQuery,
  onSearchChange,
  onCreatePost,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreatePost: () => void;
}) {
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (guidelinesOpen && !dialog.open) dialog.showModal();
    if (!guidelinesOpen && dialog.open) dialog.close();
  }, [guidelinesOpen]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
              <UsersThree weight="duotone" className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Community
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Wins, questions, and guidance from the ScaleX cohort
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGuidelinesOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm font-medium text-muted transition hover:border-accent-purple/40 hover:text-foreground"
          >
            <Question weight="bold" className="h-4 w-4" aria-hidden />
            Guidelines
          </button>
          <button
            type="button"
            onClick={onCreatePost}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
          >
            <Plus weight="bold" className="h-4 w-4" aria-hidden />
            Create Post
          </button>
        </div>
      </div>

      <label className="relative block max-w-xl">
        <span className="sr-only">Search posts</span>
        <MagnifyingGlass
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search discussions…"
          className="w-full rounded-xl border border-line bg-surface-2/60 py-2.5 pr-3.5 pl-10 text-sm text-foreground outline-none placeholder:text-subtle transition focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20"
        />
      </label>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        onClose={() => setGuidelinesOpen(false)}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold">
              Community guidelines
            </h2>
            <p className="mt-1 text-sm text-muted">
              Keep the cohort helpful, respectful, and on-mission.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuidelinesOpen(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground"
            aria-label="Close guidelines"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <ul className="space-y-2.5 px-5 py-4 text-sm text-muted">
          <li>Share wins, questions, and actionable Amazon FBA insights.</li>
          <li>No spam, self-promo dumps, or off-topic noise.</li>
          <li>Be respectful — critique ideas, not people.</li>
          <li>Student posts are reviewed before going live.</li>
          <li>Never share private credentials or payment details.</li>
        </ul>
        <div className="border-t border-line px-5 py-4">
          <Link
            href="/support"
            className="text-sm font-semibold text-accent-purple hover:underline"
            onClick={() => setGuidelinesOpen(false)}
          >
            Need help? Contact support →
          </Link>
        </div>
      </dialog>
    </div>
  );
}
