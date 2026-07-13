"use server";

import { revalidatePath } from "next/cache";
import { createNotification, writeAuditLog } from "@scalex/db";
import { canAccess } from "@scalex/db/rbac";
import { requireAdminProfile } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  LESSON_MEDIA_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/media";
import { createServiceClient } from "@scalex/db/server";

const SESSION_TYPES = ["batch_class", "masterclass", "qa", "case_study"] as const;

export async function createSessionAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as (typeof SESSION_TYPES)[number];
  const scheduledAt = formData.get("scheduled_at") as string;
  const meetingUrl = (formData.get("meeting_url") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const audienceRaw = formData.get("audience") as string;
  const audience =
    audienceRaw === "selected" ? "selected" : "all_premium";
  const selectedIds = formData
    .getAll("studentIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  if (!title || !scheduledAt || !SESSION_TYPES.includes(type)) {
    throw new Error("Title, type, and scheduled time are required");
  }

  if (audience === "selected" && selectedIds.length === 0) {
    throw new Error("Select at least one student for a selective session");
  }

  const { userId, profile } = await requireAdminProfile();

  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const serviceClient = createServiceClient();

  let inviteeIds: string[] = selectedIds;

  if (audience === "all_premium") {
    const { data: premiumStudents } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("role", "student")
      .eq("status", "active")
      .eq("plan", "premium");
    inviteeIds = (premiumStudents ?? []).map((s) => (s as { id: string }).id);
  }

  const { data: session, error: insertError } = await serviceClient
    .from("live_sessions")
    .insert({
      title,
      type,
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
      host_id: userId,
      meeting_url: meetingUrl,
      audience,
    } as never)
    .select("id, title, scheduled_at")
    .single();

  if (insertError || !session) {
    throw new Error(insertError?.message ?? "Failed to create session");
  }

  if (inviteeIds.length > 0) {
    await serviceClient.from("session_registrations").insert(
      inviteeIds.map((studentId) => ({
        session_id: (session as { id: string }).id,
        student_id: studentId,
      })) as never
    );
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.created",
    targetType: "live_session",
    targetId: (session as { id: string }).id,
    metadata: {
      title,
      type,
      scheduledAt,
      audience,
      inviteeCount: inviteeIds.length,
    },
  });

  await Promise.all(
    inviteeIds.map((studentId) =>
      createNotification({
        userId: studentId,
        type: "session_scheduled",
        title: "New live session scheduled",
        body: `${(session as { title: string }).title} — ${new Date((session as { scheduled_at: string }).scheduled_at).toLocaleString()}`,
        payload: { sessionId: (session as { id: string }).id },
      })
    )
  );

  revalidatePath("/sessions");
}

export async function updateSessionAction(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  const title = (formData.get("title") as string)?.trim();
  const meetingUrl = (formData.get("meeting_url") as string)?.trim() || null;
  const recordingUrl = (formData.get("recording_url") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!sessionId || !title) throw new Error("Invalid session update");

  const { userId, profile } = await requireAdminProfile();
  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const db = getServiceDb();
  const { data: existing } = await db
    .from("live_sessions")
    .select("recording_url")
    .eq("id", sessionId)
    .single();

  const previousRecording = (existing as { recording_url: string | null } | null)
    ?.recording_url;

  const { error } = await db
    .from("live_sessions")
    .update({
      title,
      meeting_url: meetingUrl,
      recording_url: recordingUrl,
      description,
    } as never)
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  if (
    previousRecording &&
    previousRecording !== recordingUrl
  ) {
    const path = storagePathFromPublicUrl(previousRecording);
    if (path) {
      await db.storage.from(LESSON_MEDIA_BUCKET).remove([path]);
    }
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.updated",
    targetType: "live_session",
    targetId: sessionId,
    metadata: { title },
  });

  revalidatePath("/sessions");
}

export async function deleteSessionAction(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) throw new Error("Session id required");

  const { userId, profile } = await requireAdminProfile();
  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const db = getServiceDb();
  const { data: existing } = await db
    .from("live_sessions")
    .select("recording_url")
    .eq("id", sessionId)
    .single();

  const recordingUrl = (existing as { recording_url: string | null } | null)
    ?.recording_url;

  const { error } = await db.from("live_sessions").delete().eq("id", sessionId);
  if (error) throw new Error(error.message);

  if (recordingUrl) {
    const path = storagePathFromPublicUrl(recordingUrl);
    if (path) {
      await db.storage.from(LESSON_MEDIA_BUCKET).remove([path]);
    }
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.deleted",
    targetType: "live_session",
    targetId: sessionId,
  });

  revalidatePath("/sessions");
}
