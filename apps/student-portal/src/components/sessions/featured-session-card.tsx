"use client";

import { useEffect, useState } from "react";
import {
  CalendarBlank,
  Clock,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";
import { Card, Button, StatusPill } from "@scalex/ui";
import { registerForSessionAction } from "@/app/(portal)/sessions/actions";
import {
  formatSessionDateTime,
  getCountdownParts,
  sessionTypeLabel,
  type SessionListItem,
} from "@/lib/sessions-shared";

function Countdown({ scheduledAt }: { scheduledAt: string }) {
  const [parts, setParts] = useState(() => getCountdownParts(scheduledAt));

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(scheduledAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [scheduledAt]);

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Mins", value: parts.minutes },
    { label: "Secs", value: parts.seconds },
  ];

  if (parts.totalMs <= 0) {
    return (
      <p className="text-sm font-semibold text-accent-purple">Starting now</p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-xl border border-accent-purple/20 bg-accent-purple/10 px-2 py-2 text-center"
        >
          <p className="font-display text-lg font-bold tabular-nums text-foreground">
            {String(cell.value).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
            {cell.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function HostAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-1 ring-line"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-purple/20 text-sm font-semibold text-accent-purple ring-1 ring-line">
      {initial}
    </div>
  );
}

export function FeaturedSessionCard({
  session,
}: {
  session: SessionListItem | null;
}) {
  if (!session) {
    return (
      <Card className="border-accent-purple/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Next live session
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold">
          No upcoming sessions
        </h2>
        <p className="mt-2 text-sm text-muted">
          Check back soon — new live classes will appear here.
        </p>
      </Card>
    );
  }

  const host = session.hostName ?? "ScaleX Mentor";

  return (
    <Card className="relative overflow-hidden border-accent-purple/25 bg-gradient-to-br from-accent-purple/12 via-surface-2 to-surface-2">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-purple/20 blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-purple">
              Featured next session
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                {session.title}
              </h2>
              <StatusPill
                label={sessionTypeLabel(session.type)}
                variant="neutral"
              />
            </div>
          </div>
          {session.registered ? (
            <StatusPill label="Registered" variant="approved" />
          ) : null}
        </div>

        {session.description ? (
          <p className="text-sm text-muted line-clamp-3">{session.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock weight="duotone" className="h-4 w-4 text-accent-purple" />
            {formatSessionDateTime(session.scheduled_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock weight="regular" className="h-4 w-4 text-accent-purple" />
            60 min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersThree weight="duotone" className="h-4 w-4 text-accent-purple" />
            {session.registrationCount} registered
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <HostAvatar name={host} avatarUrl={session.hostAvatarUrl} />
          <div>
            <p className="text-sm font-medium text-foreground">{host}</p>
            <p className="text-xs text-subtle">Host</p>
          </div>
        </div>

        <Countdown scheduledAt={session.scheduled_at} />

        <div className="flex flex-wrap items-center gap-2">
          {session.registered ? (
            session.meeting_url ? (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
              >
                <VideoCamera weight="bold" className="h-4 w-4" aria-hidden />
                Join session
              </a>
            ) : (
              <StatusPill label="Registered — link soon" variant="pending" />
            )
          ) : (
            <form action={registerForSessionAction}>
              <input type="hidden" name="sessionId" value={session.id} />
              <Button
                type="submit"
                size="sm"
                className="!bg-accent-purple hover:!bg-accent-purple/90"
              >
                Register
              </Button>
            </form>
          )}
          <span
            title="Coming soon"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-3/30 px-3.5 py-2.5 text-sm font-medium text-subtle/80"
          >
            <CalendarBlank weight="bold" className="h-4 w-4" aria-hidden />
            Calendar
            <span className="text-[10px] uppercase tracking-wider">Soon</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
