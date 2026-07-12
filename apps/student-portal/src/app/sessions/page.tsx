import { PortalShell } from "@/components/portal-shell";
import { ProtectedMediaPlayer } from "@/components/protected-media-player";
import { requireStudentProfile } from "@/lib/auth";
import { getRecordedSessions, getUpcomingSessions } from "@/lib/data";
import { getSecureMediaUrl } from "@/lib/secure-media";
import { Card, Button, StatusPill } from "@scalex/ui";
import { registerForSessionAction } from "./actions";

function formatSessionTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const sessionTypeLabels: Record<string, string> = {
  batch_class: "Batch Class",
  masterclass: "Masterclass",
  qa: "Q&A",
  case_study: "Case Study",
};

export default async function SessionsPage() {
  const { userId, profile } = await requireStudentProfile();
  const [upcoming, recordings] = await Promise.all([
    getUpcomingSessions(userId),
    getRecordedSessions(),
  ]);

  const watermark = `${profile.email} · ${profile.name}`;

  const recordingsWithUrls = await Promise.all(
    recordings.map(async (session) => ({
      ...session,
      secureRecordingUrl: session.recording_url
        ? await getSecureMediaUrl(session.recording_url)
        : null,
    }))
  );

  return (
    <PortalShell activePath="/sessions">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Live Sessions
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Classes & recordings
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Register for upcoming live sessions and catch up on recordings.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <Card>
              <p className="text-sm text-text-secondary-dark">
                No upcoming sessions scheduled. Check back soon!
              </p>
            </Card>
          ) : (
            upcoming.map((session) => (
              <Card key={session.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">
                        {session.title}
                      </h3>
                      <StatusPill
                        label={sessionTypeLabels[session.type] ?? session.type}
                        variant="neutral"
                      />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary-dark">
                      {formatSessionTime(session.scheduled_at)}
                    </p>
                    {session.description && (
                      <p className="mt-2 text-sm text-text-secondary-dark">
                        {session.description}
                      </p>
                    )}
                  </div>
                  {session.registered ? (
                    <StatusPill label="Registered" variant="approved" />
                  ) : (
                    <form action={registerForSessionAction}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <Button type="submit" size="sm">
                        Register
                      </Button>
                    </form>
                  )}
                </div>

                {session.registered && session.meeting_url && (
                  <div className="mt-4">
                    <a
                      href={session.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-scalex-red hover:underline"
                    >
                      Join session →
                    </a>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Recordings</h2>
          {recordingsWithUrls.length === 0 ? (
            <Card>
              <p className="text-sm text-text-secondary-dark">
                No recordings available yet.
              </p>
            </Card>
          ) : (
            recordingsWithUrls.map((session) => (
              <Card key={session.id}>
                <h3 className="font-medium text-text-primary-dark">
                  {session.title}
                </h3>
                <p className="mt-1 text-xs text-text-tertiary-dark">
                  {formatSessionTime(session.scheduled_at)}
                </p>
                {session.secureRecordingUrl ? (
                  <div className="mt-4">
                    <ProtectedMediaPlayer
                      url={session.secureRecordingUrl}
                      title={session.title}
                      type="auto"
                      watermark={watermark}
                    />
                  </div>
                ) : session.recording_url ? (
                  <p className="mt-4 text-sm text-text-secondary-dark">
                    Recording unavailable. Please refresh the page.
                  </p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalShell>
  );
}
