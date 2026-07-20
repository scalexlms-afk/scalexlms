import Link from "next/link";
import { ProtectedMediaPlayer } from "@/components/protected-media-player";
import { requireStudentProfile } from "@/lib/auth";
import { getRecordedSessions, getUpcomingSessions } from "@/lib/data";
import { getSecureMediaUrl } from "@/lib/secure-media";
import {
  isPremiumPlan,
  planLabel,
  planPillVariant,
  PLAN_FEATURES,
} from "@scalex/db";
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
  const premium = isPremiumPlan(profile.plan);

  if (!premium) {
    return (
    <>
      <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Live Sessions
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                Premium live access
              </h1>
              <p className="mt-1 text-muted">
                Your Standard plan includes recorded curriculum and AI Mentor.
                Live classes and mentor calls unlock with Premium.
              </p>
            </div>
            <StatusPill
              label={planLabel(profile.plan)}
              variant={planPillVariant(profile.plan)}
            />
          </div>

          <Card>
            <h2 className="font-display text-lg font-semibold">
              What Premium unlocks
            </h2>
            <ul className="mt-4 space-y-2">
              {PLAN_FEATURES.premium.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-scalex-red" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/payment?mode=upgrade"
              className="mt-6 inline-block rounded-lg bg-scalex-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Upgrade now
            </Link>
            <Link
              href="/dashboard"
              className="mt-4 ml-4 inline-block text-sm font-medium text-scalex-red hover:underline"
            >
              Back to dashboard →
            </Link>
          </Card>
        </div>
    </>
    );
  }

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
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Live Sessions
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Classes & recordings
            </h1>
            <p className="mt-1 text-muted">
              Register for upcoming live sessions and catch up on recordings.
            </p>
          </div>
          <StatusPill
            label={planLabel(profile.plan)}
            variant={planPillVariant(profile.plan)}
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
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
                    <p className="mt-1 text-sm text-muted">
                      {formatSessionTime(session.scheduled_at)}
                    </p>
                    {session.description && (
                      <p className="mt-2 text-sm text-muted">
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
              <p className="text-sm text-muted">No recordings available yet.</p>
            </Card>
          ) : (
            recordingsWithUrls.map((session) => (
              <Card key={session.id}>
                <h3 className="font-medium text-foreground">{session.title}</h3>
                <p className="mt-1 text-xs text-subtle">
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
                  <p className="mt-4 text-sm text-muted">
                    Recording unavailable. Please refresh the page.
                  </p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
