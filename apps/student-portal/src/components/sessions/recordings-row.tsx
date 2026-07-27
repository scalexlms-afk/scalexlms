import { Card, StatusPill } from "@scalex/ui";
import { ProtectedMediaPlayer } from "@/components/protected-media-player";
import {
  formatSessionDateTime,
  sessionTypeLabel,
  type RecordingListItem,
} from "@/lib/sessions-shared";

export function RecordingsRow({
  recordings,
  watermark,
}: {
  recordings: RecordingListItem[];
  watermark: string;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Recordings
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Rewatch past live sessions when a recording is available
        </p>
      </div>

      {recordings.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No recordings available yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {recordings.map((session) => (
            <Card key={session.id} className="border-line">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {session.title}
                </h3>
                <StatusPill
                  label={sessionTypeLabel(session.type)}
                  variant="neutral"
                />
              </div>
              <p className="mt-1 text-xs text-subtle">
                {formatSessionDateTime(session.scheduled_at)}
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
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Recording unavailable. Please refresh the page.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
