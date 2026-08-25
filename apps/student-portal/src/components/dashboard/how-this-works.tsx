import { Card } from "@scalex/ui";
import { ProtectedMediaPlayer } from "@/components/protected-media-player";

export function HowThisWorks({
  introVideoUrl,
}: {
  introVideoUrl?: string | null;
}) {
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">How this works</h2>
      {introVideoUrl ? (
        <div className="mt-4">
          <ProtectedMediaPlayer
            url={introVideoUrl}
            title="How this works"
            type="video"
          />
        </div>
      ) : (
        <ol className="mt-4 space-y-2 text-sm text-muted">
          <li>
            <span className="font-semibold text-foreground">1. Watch or read</span>{" "}
            the next open lesson in your current stage.
          </li>
          <li>
            <span className="font-semibold text-foreground">2. Submit</span> the
            stage task when the lessons are done — or resubmit if revision is
            required.
          </li>
          <li>
            <span className="font-semibold text-foreground">3. Unlock</span> the
            next milestone after mentor approval.
          </li>
        </ol>
      )}
    </Card>
  );
}
