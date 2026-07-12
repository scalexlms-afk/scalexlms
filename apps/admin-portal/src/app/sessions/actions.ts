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

  if (!title || !scheduledAt || !SESSION_TYPES.includes(type)) {
    throw new Error("Title, type, and scheduled time are required");
  }

  const { userId, profile } = await requireAdminProfile();

  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const serviceClient = createServiceClient();

  const { data: session, error: insertError } = await serviceClient
    .from("live_sessions")
    .insert({
      title,
      type,
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
      host_id: userId,
      meeting_url: meetingUrl,
    })
    .select("id, title, scheduled_at")
    .single();

  if (insertError || !session) {
    throw new Error(insertError?.message ?? "Failed to create session");
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.created",
    targetType: "live_session",
    targetId: session.id,
    metadata: { title, type, scheduledAt },
  });

  const { data: students } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("role", "student")
    .eq("status", "active");

  await Promise.all(
    (students ?? []).map((student) =>
      createNotification({
        userId: student.id,
        type: "session_scheduled",
        title: "New live session scheduled",
        body: `${session.title} — ${new Date(session.scheduled_at).toLocaleString()}`,
        payload: { sessionId: session.id },
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

  const { error } = await db
    .from("live_sessions")
    .update({
      title,
      meeting_url: meetingUrl,
      recording_url: recordingUrl,
      description,
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  if (
    existing?.recording_url &&
    recordingUrl &&
    existing.recording_url !== recordingUrl
  ) {
    const path = storagePathFromPublicUrl(existing.recording_url);
    if (path) {
      await db.storage.from(LESSON_MEDIA_BUCKET).remove([path]);
    }
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.updated",
    targetType: "live_session",
    targetId: sessionId,
    metadata: { title, hasRecording: Boolean(recordingUrl) },
  });

  revalidatePath("/sessions");
}

export async function deleteSessionAction(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) throw new Error("Session required");

  const { userId, profile } = await requireAdminProfile();
  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const db = getServiceDb();
  const { data: session } = await db
    .from("live_sessions")
    .select("recording_url")
    .eq("id", sessionId)
    .single();

  const { error } = await db.from("live_sessions").delete().eq("id", sessionId);
  if (error) throw new Error(error.message);

  const path = storagePathFromPublicUrl(session?.recording_url ?? null);
  if (path) {
    await db.storage.from(LESSON_MEDIA_BUCKET).remove([path]);
  }

  await writeAuditLog({
    actorId: userId,
    action: "live_session.deleted",
    targetType: "live_session",
    targetId: sessionId,
  });

  revalidatePath("/sessions");
}
