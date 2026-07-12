import { AdminShell } from "@/components/admin-shell";
import { SessionEditor } from "@/components/session-editor";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getLiveSessions } from "@/lib/data";
import { signMediaUrls } from "@/lib/secure-media";
import { createSessionAction } from "./actions";
import { canAccess } from "@scalex/db/rbac";
import { Button, Card, StatusPill } from "@scalex/ui";

const SESSION_TYPES = [
  { value: "batch_class", label: "Batch Class" },
  { value: "masterclass", label: "Masterclass" },
  { value: "qa", label: "Q&A" },
  { value: "case_study", label: "Case Study" },
] as const;

function typeLabel(type: string): string {
  return (
    SESSION_TYPES.find((t) => t.value === type)?.label ??
    type.replace(/_/g, " ")
  );
}

function sessionVariant(scheduledAt: string): "active" | "pending" | "inactive" {
  const when = new Date(scheduledAt).getTime();
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  if (when > now) return "pending";
  if (when > now - hour) return "active";
  return "inactive";
}

export default async function SessionsPage() {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "live_sessions");

  const sessions = await getLiveSessions();
  const canCreate = canAccess(profile.role, "live_sessions", "full");
  const recordingPreviews = canCreate
    ? await signMediaUrls(
        sessions
          .filter((s) => s.recording_url)
          .map((s) => ({ id: s.id, url: s.recording_url }))
      )
    : {};
  const upcoming = sessions.filter(
    (s) => new Date(s.scheduled_at).getTime() > Date.now()
  );

  return (
    <AdminShell activePath="/sessions">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Live Sessions
          </h1>
          <p className="mt-1 text-muted">
            Schedule classes, upload recordings, and manage session details.
          </p>
        </div>

        {canCreate && (
          <Card>
            <h2 className="font-display text-lg font-semibold">
              Schedule a session
            </h2>
            <form action={createSessionAction} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title" name="title" required placeholder="Session title" />
              <div>
                <label
                  htmlFor="type"
                  className="mb-1.5 block text-sm font-medium text-muted"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-scalex-red focus:ring-2 focus:ring-scalex-red/20"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Scheduled at"
                name="scheduled_at"
                type="datetime-local"
                required
              />
              <Field
                label="Meeting URL"
                name="meeting_url"
                type="url"
                placeholder="https://zoom.us/..."
              />
              <div className="sm:col-span-2">
                <TextArea label="Description" name="description" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Create session</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-subtle">Total sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {sessions.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-subtle">Upcoming</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {upcoming.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-subtle">Past</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {sessions.length - upcoming.length}
            </p>
          </Card>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              No live sessions scheduled yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const variant = sessionVariant(session.scheduled_at);
              const statusLabel =
                variant === "pending"
                  ? "Upcoming"
                  : variant === "active"
                    ? "Live now"
                    : "Past";

              return (
                <Card key={session.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {session.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted">
                        Host: {session.host?.name ?? "—"} ·{" "}
                        {typeLabel(session.type)}
                      </p>
                    </div>
                    <StatusPill label={statusLabel} variant={variant} />
                  </div>

                  <p className="mt-3 text-sm text-muted">
                    {new Date(session.scheduled_at).toLocaleString()}
                  </p>

                  {session.description && (
                    <p className="mt-2 text-sm text-subtle">
                      {session.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {session.meeting_url && (
                      <a
                        href={session.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-scalex-red hover:underline"
                      >
                        Join meeting
                      </a>
                    )}
                    {session.recording_url && (
                      <span className="text-accent-green">Recording attached</span>
                    )}
                  </div>

                  {canCreate && (
                    <SessionEditor
                      session={session}
                      recordingPreviewUrl={recordingPreviews[session.id] ?? null}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
