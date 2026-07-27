"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Robot,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { localDayKey, type SessionListItem } from "@/lib/sessions-shared";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MiniCalendar({
  markedDates,
}: {
  markedDates: Set<string>;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: Array<{ day: number | null; key: string | null }> = [];
    for (let i = 0; i < firstDow; i++) {
      out.push({ day: null, key: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = localDayKey(new Date(year, month, d));
      out.push({ day: d, key });
    }
    return out;
  }, [year, month]);

  const label = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const todayKey = localDayKey(new Date());

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface-3 hover:text-foreground"
          aria-label="Previous month"
        >
          <CaretLeft className="h-4 w-4" weight="bold" />
        </button>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface-3 hover:text-foreground"
          aria-label="Next month"
        >
          <CaretRight className="h-4 w-4" weight="bold" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-[10px] font-semibold uppercase tracking-wider text-subtle"
          >
            {d}
          </span>
        ))}
        {cells.map((cell, index) => {
          if (cell.day == null || cell.key == null) {
            return <span key={`e-${index}`} />;
          }
          const marked = markedDates.has(cell.key);
          const isToday = cell.key === todayKey;
          return (
            <span
              key={cell.key}
              className={`relative flex h-8 items-center justify-center rounded-lg text-xs ${
                isToday
                  ? "bg-accent-purple/20 font-semibold text-accent-purple"
                  : "text-muted"
              }`}
            >
              {cell.day}
              {marked ? (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-purple"
                  aria-hidden
                />
              ) : null}
            </span>
          );
        })}
      </div>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="mt-3 w-full cursor-not-allowed rounded-xl border border-line bg-surface-3/40 px-3 py-2 text-xs font-semibold text-subtle opacity-60"
      >
        View full calendar
      </button>
    </div>
  );
}

export function SessionsRail({
  calendarSessions,
}: {
  calendarSessions: SessionListItem[];
}) {
  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const session of calendarSessions) {
      set.add(localDayKey(session.scheduled_at));
    }
    return set;
  }, [calendarSessions]);

  const askHref = `/ai-mentor?q=${encodeURIComponent(
    "Help me prepare for my next Live Session"
  )}`;

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card className="border-accent-purple/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Session calendar
        </p>
        <div className="mt-3">
          <MiniCalendar markedDates={markedDates} />
        </div>
      </Card>

      <Link
        href={askHref}
        className="flex items-center gap-3 rounded-2xl border border-accent-purple/30 bg-gradient-to-r from-accent-purple/15 via-accent-purple/8 to-transparent px-4 py-4 transition hover:border-accent-purple/50 hover:from-accent-purple/20"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge">
          <Robot weight="duotone" className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-foreground">
            Ask AI about Live Sessions
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Prep questions, recap topics, next steps
          </p>
        </div>
        <ArrowRight
          weight="bold"
          className="h-4 w-4 shrink-0 text-accent-purple"
          aria-hidden
        />
      </Link>
    </aside>
  );
}
