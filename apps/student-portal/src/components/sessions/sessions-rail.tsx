"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  FileText,
  FolderOpen,
  Robot,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { localDayKey, type SessionListItem } from "@/lib/sessions-shared";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const RESOURCE_STUBS = [
  { label: "Session workbook PDF", soon: true },
  { label: "Prep checklist", href: "/tasks" },
  { label: "Roadmap context", href: "/roadmap" },
  { label: "Ask AI about this session", href: "/ai-mentor?q=Help%20me%20prepare%20for%20my%20next%20Live%20Session" },
] as const;

function MiniCalendar({
  liveDates,
  registeredDates,
}: {
  liveDates: Set<string>;
  registeredDates: Set<string>;
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
          const isLive = liveDates.has(cell.key);
          const isRegistered = registeredDates.has(cell.key);
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
              {isLive || isRegistered ? (
                <span className="absolute bottom-1 flex items-center gap-0.5">
                  {isLive ? (
                    <span
                      className="h-1 w-1 rounded-full bg-accent-purple"
                      title="Live session"
                      aria-hidden
                    />
                  ) : null}
                  {isRegistered ? (
                    <span
                      className="h-1 w-1 rounded-full bg-accent-green"
                      title="Registered"
                      aria-hidden
                    />
                  ) : null}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-purple" aria-hidden />
          Live
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden />
          Registered
        </span>
      </div>

      <span
        title="Coming soon"
        className="mt-3 block w-full rounded-xl border border-line bg-surface-3/30 px-3 py-2 text-center text-xs font-medium text-subtle/80"
      >
        Full calendar · Soon
      </span>
    </div>
  );
}

export function SessionsRail({
  calendarSessions,
}: {
  calendarSessions: SessionListItem[];
}) {
  const { liveDates, registeredDates } = useMemo(() => {
    const live = new Set<string>();
    const registered = new Set<string>();
    for (const session of calendarSessions) {
      const key = localDayKey(session.scheduled_at);
      live.add(key);
      if (session.registered) registered.add(key);
    }
    return { liveDates: live, registeredDates: registered };
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
          <MiniCalendar
            liveDates={liveDates}
            registeredDates={registeredDates}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
            <FolderOpen weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Session Resources
          </p>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {RESOURCE_STUBS.map((item) => (
            <li key={item.label}>
              {"soon" in item && item.soon ? (
                <span className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-subtle">
                  <span className="inline-flex items-center gap-2">
                    <FileText weight="duotone" className="h-4 w-4" aria-hidden />
                    {item.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Soon
                  </span>
                </span>
              ) : (
                <Link
                  href={"href" in item ? item.href : "/sessions"}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-muted transition hover:bg-surface-3/60 hover:text-foreground"
                >
                  <FileText weight="duotone" className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
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
