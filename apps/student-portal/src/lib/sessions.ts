import { createClient } from "@scalex/db/server";
import { getSecureMediaUrl } from "@/lib/secure-media";
import type {
  RecordingListItem,
  SessionListItem,
  SessionsPageData,
} from "@/lib/sessions-shared";

export type {
  RecordingListItem,
  SessionListItem,
  SessionsPageData,
} from "@/lib/sessions-shared";
export {
  SESSION_TYPE_LABELS,
  formatSessionDate,
  formatSessionDateTime,
  formatSessionTime,
  getCountdownParts,
  localDayKey,
  sessionTypeLabel,
} from "@/lib/sessions-shared";

type SessionRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  meeting_url: string | null;
  recording_url: string | null;
  audience?: "all_premium" | "selected" | string | null;
  host: {
    name: string;
    avatar_url?: string | null;
  } | null;
  session_registrations?: { count: number }[];
};

function visibleToStudent(
  audience: string | null | undefined,
  registered: boolean
) {
  if (audience === "selected") return registered;
  return true;
}

async function fetchUpcomingSessions(
  studentId: string,
  limit = 20
): Promise<SessionListItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: sessions }, { data: registrations }] = await Promise.all([
    supabase
      .from("live_sessions")
      .select(
        `
        id,
        type,
        title,
        description,
        scheduled_at,
        meeting_url,
        recording_url,
        audience,
        host:profiles!host_id(name, avatar_url),
        session_registrations(count)
      `
      )
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(limit),
    supabase
      .from("session_registrations")
      .select("session_id")
      .eq("student_id", studentId),
  ]);

  const registeredIds = new Set(
    (registrations ?? []).map((r) => (r as { session_id: string }).session_id)
  );

  return ((sessions ?? []) as SessionRow[])
    .map((session) => ({
      id: session.id,
      type: session.type,
      title: session.title,
      description: session.description,
      scheduled_at: session.scheduled_at,
      meeting_url: session.meeting_url,
      registered: registeredIds.has(session.id),
      hostName: session.host?.name ?? null,
      hostAvatarUrl: session.host?.avatar_url ?? null,
      registrationCount: session.session_registrations?.[0]?.count ?? 0,
      audience: session.audience ?? null,
    }))
    .filter((session) => visibleToStudent(session.audience, session.registered));
}

async function fetchRecordings(limit = 12): Promise<RecordingListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_sessions")
    .select("id, type, title, scheduled_at, recording_url")
    .not("recording_url", "is", null)
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as Array<{
    id: string;
    type: string;
    title: string;
    scheduled_at: string;
    recording_url: string | null;
  }>;

  return Promise.all(
    rows.map(async (session) => ({
      id: session.id,
      type: session.type,
      title: session.title,
      scheduled_at: session.scheduled_at,
      secureRecordingUrl: session.recording_url
        ? await getSecureMediaUrl(session.recording_url)
        : null,
    }))
  );
}

export async function getSessionsPageData(
  userId: string,
  watermark: string
): Promise<SessionsPageData> {
  const [upcoming, recordings] = await Promise.all([
    fetchUpcomingSessions(userId),
    fetchRecordings(),
  ]);

  return {
    upcoming,
    recordings,
    registeredUpcoming: upcoming.filter((s) => s.registered),
    watermark,
  };
}
