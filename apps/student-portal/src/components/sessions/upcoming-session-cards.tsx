import { Card, Button, StatusPill } from "@scalex/ui";
import { registerForSessionAction } from "@/app/(portal)/sessions/actions";
import {
  formatSessionDate,
  formatSessionTime,
  sessionTypeLabel,
  type SessionListItem,
} from "@/lib/sessions-shared";

function SessionMiniCard({ session }: { session: SessionListItem }) {
  return (
    <Card className="min-w-[260px] max-w-[300px] shrink-0 border-line bg-surface-2/60 sm:min-w-[280px]">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label={sessionTypeLabel(session.type)} variant="neutral" />
        {session.registered ? (
          <StatusPill label="Registered" variant="approved" />
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground line-clamp-2">
        {session.title}
      </h3>
      <p className="mt-2 text-sm text-muted">
        {formatSessionDate(session.scheduled_at)} ·{" "}
        {formatSessionTime(session.scheduled_at)}
      </p>
      {session.hostName ? (
        <p className="mt-1 text-xs text-subtle">Hosted by {session.hostName}</p>
      ) : null}
      <p className="mt-1 text-xs text-subtle">
        {session.registrationCount} registered
      </p>

      <div className="mt-4">
        {session.registered ? (
          session.meeting_url ? (
            <a
              href={session.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-accent-purple hover:underline"
            >
              Join →
            </a>
          ) : (
            <span className="text-sm font-medium text-muted">Registered</span>
          )
        ) : (
          <form action={registerForSessionAction}>
            <input type="hidden" name="sessionId" value={session.id} />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="!border-accent-purple/40 !text-accent-purple hover:!bg-accent-purple/10"
            >
              Register
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

export function UpcomingSessionCards({
  sessions,
}: {
  sessions: SessionListItem[];
}) {
  return (
    <section id="upcoming-sessions" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Upcoming sessions
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Register ahead — join when the meeting link is live
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            No upcoming sessions scheduled. Check back soon!
          </p>
        </Card>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {sessions.map((session) => (
            <SessionMiniCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}

export function MyBookingsSection({
  sessions,
}: {
  sessions: SessionListItem[];
}) {
  return (
    <section id="my-bookings" className="scroll-mt-24 space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          My Bookings
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Sessions you&apos;ve registered for
        </p>
      </div>
      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            You haven&apos;t registered for any upcoming sessions yet.
          </p>
        </Card>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {sessions.map((session) => (
            <SessionMiniCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
