import {
  AdminDetailRail,
  AdminEmptyState,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { SessionEditor } from "@/components/session-editor";
import { SessionAudiencePicker } from "@/components/session-audience-picker";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getActiveStudentsForSessions, getLiveSessions } from "@/lib/data";
import { signMediaUrls } from "@/lib/secure-media";
import { createSessionAction } from "./actions";
import { canAccess } from "@scalex/db/rbac";
import { Button, StatusPill } from "@scalex/ui";

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

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "live_sessions");

  const params = await searchParams;
  const tab =
    params.tab === "upcoming" || params.tab === "past" ? params.tab : "all";

  const canCreate = canAccess(profile.role, "live_sessions", "full");
  const [sessions, students] = await Promise.all([
    getLiveSessions(),
    canCreate ? getActiveStudentsForSessions() : Promise.resolve([]),
  ]);
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
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduled_at).getTime() <= Date.now()
  );
  const visible =
    tab === "upcoming"
      ? upcoming
      : tab === "past"
        ? pastSessions
        : sessions;
  const q = (params.q ?? "").trim().toLowerCase();
  const searched = q
    ? visible.filter(
        (session) =>
          session.title.toLowerCase().includes(q) ||
          typeLabel(session.type).toLowerCase().includes(q) ||
          (session.host?.name ?? "").toLowerCase().includes(q)
      )
    : visible;
  const withRecording = sessions.filter((s) => s.recording_url).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Live Sessions"
        description="Schedule Premium classes, Q&As, and masterclasses for your cohort."
        search={{
          action: "/sessions",
          placeholder: "Search sessions...",
          defaultValue: params.q ?? "",
          hiddenFields: tab !== "all" ? { tab } : undefined,
        }}
        primaryAction={
          canCreate
            ? { label: "+ Schedule Session", href: "/sessions#schedule-session" }
            : undefined
        }
      />

      <AdminKpiGrid
        items={[
          { label: "Total Sessions", value: String(sessions.length) },
          {
            label: "Upcoming",
            value: String(upcoming.length),
            tone: "success",
            hint: "On the calendar",
          },
          {
            label: "Past",
            value: String(pastSessions.length),
            hint: "Completed or expired",
          },
          {
            label: "With Recording",
            value: String(withRecording),
          },
        ]}
      />

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "all",
            label: "All Sessions",
            count: sessions.length,
            href: "/sessions?tab=all",
          },
          {
            id: "upcoming",
            label: "Upcoming",
            count: upcoming.length,
            href: "/sessions?tab=upcoming",
          },
          {
            id: "past",
            label: "Past",
            count: pastSessions.length,
            href: "/sessions?tab=past",
          },
        ]}
      />

      <AdminSplit
        main={
          <div className="space-y-4">
            {canCreate && (
              <AdminPanel title="Schedule a session">
                <form
                  id="schedule-session"
                  action={createSessionAction}
                  className="grid scroll-mt-24 gap-4 sm:grid-cols-2"
                >
                  <Field
                    label="Title"
                    name="title"
                    required
                    placeholder="Session title"
                  />
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
                  <SessionAudiencePicker
                    students={students.map((s) => ({
                      id: s.id as string,
                      name: s.name as string,
                      email: s.email as string,
                      plan: (s.plan as string | null) ?? null,
                    }))}
                  />
                  <div className="sm:col-span-2">
                    <Button type="submit">Create session</Button>
                  </div>
                </form>
              </AdminPanel>
            )}

            {searched.length === 0 ? (
              <AdminPanel>
                <AdminEmptyState
                  title={q ? "No matching sessions" : "No live sessions in this view"}
                  hint="Schedule a Premium class, Q&A, or masterclass for the cohort."
                />
              </AdminPanel>
            ) : (
              <div className="space-y-3">
                {searched.map((session) => {
                  const variant = sessionVariant(session.scheduled_at);
                  const statusLabel =
                    variant === "pending"
                      ? "Upcoming"
                      : variant === "active"
                        ? "Live now"
                        : "Past";

                  return (
                    <AdminPanel key={session.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-lg font-semibold">
                            {session.title}
                          </h2>
                          <p className="mt-0.5 text-sm text-muted">
                            Host: {session.host?.name ?? "—"} ·{" "}
                            {typeLabel(session.type)}
                          </p>
                          <p className="mt-1 text-xs text-subtle">
                            Audience:{" "}
                            {session.audience === "selected"
                              ? "Selected students"
                              : "All Premium"}
                            {typeof session.invite_count === "number"
                              ? ` · ${session.invite_count} invited`
                              : ""}
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
                          <span className="text-accent-green">
                            Recording attached
                          </span>
                        )}
                      </div>

                      {canCreate && (
                        <SessionEditor
                          session={session}
                          recordingPreviewUrl={
                            recordingPreviews[session.id] ?? null
                          }
                        />
                      )}
                    </AdminPanel>
                  );
                })}
              </div>
            )}
          </div>
        }
        rail={
          <AdminDetailRail title="Next up">
            {upcoming.length === 0 ? (
              <AdminEmptyState
                title="Nothing upcoming"
                hint="New sessions will show here once scheduled."
              />
            ) : (
              <ul className="space-y-3 text-sm">
                {upcoming.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-muted">
                      {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-subtle">{typeLabel(s.type)}</p>
                  </li>
                ))}
              </ul>
            )}
          </AdminDetailRail>
        }
      />
    </>
  );
}
