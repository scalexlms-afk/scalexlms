"use client";

import Link from "next/link";
import {
  CalendarBlank,
  Lifebuoy,
  Paperclip,
  Robot,
} from "@phosphor-icons/react";

export function MessageActionBar() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled
        title="Coming soon"
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-line bg-surface-3/40 px-3 py-2 text-xs font-medium text-subtle opacity-60"
      >
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        Attach File
      </button>
      <button
        type="button"
        disabled
        title="Coming soon"
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-line bg-surface-3/40 px-3 py-2 text-xs font-medium text-subtle opacity-60"
      >
        <CalendarBlank className="h-3.5 w-3.5" aria-hidden />
        Book Call
      </button>
      <Link
        href="/ai-mentor"
        className="inline-flex items-center gap-1.5 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3 py-2 text-xs font-semibold text-accent-purple transition hover:bg-accent-purple/15"
      >
        <Robot weight="duotone" className="h-3.5 w-3.5" aria-hidden />
        Ask AI Instead
      </Link>
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-3/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent-purple/40 hover:text-foreground"
      >
        <Lifebuoy weight="duotone" className="h-3.5 w-3.5" aria-hidden />
        Create Ticket
      </Link>
    </div>
  );
}
