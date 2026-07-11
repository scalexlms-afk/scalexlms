"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@scalex/db/server";
import { createNotification, writeAuditLog } from "@scalex/db";
import { canAccess } from "@scalex/db/rbac";
import { requireAdminProfile } from "@/lib/auth";

const SESSION_TYPES = ["batch_class", "masterclass", "qa", "case_study"] as const;

export async function createSessionAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as (typeof SESSION_TYPES)[number];
  const scheduledAt = formData.get("scheduled_at") as string;
  const meetingUrl = (formData.get("meeting_url") as string)?.trim() || null;

  if (!title || !scheduledAt || !SESSION_TYPES.includes(type)) {
    throw new Error("Title, type, and scheduled time are required");
  }

  const { userId, profile } = await requireAdminProfile();

  if (!canAccess(profile.role, "live_sessions", "full")) {
    throw new Error("Forbidden");
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phase2 = serviceClient as any;

  const { data: session, error: insertError } = await phase2
    .from("live_sessions")
    .insert({
      title,
      type,
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
    targetId: (session as { id: string }).id,
    metadata: { title, type, scheduledAt },
  });

  const { data: students } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("role", "student")
    .eq("status", "active");

  const sessionRow = session as {
    id: string;
    title: string;
    scheduled_at: string;
  };

  await Promise.all(
    (students ?? []).map((student) =>
      createNotification({
        userId: (student as { id: string }).id,
        type: "session_scheduled",
        title: "New live session scheduled",
        body: `${sessionRow.title} — ${new Date(sessionRow.scheduled_at).toLocaleString()}`,
        payload: { sessionId: sessionRow.id },
      })
    )
  );

  revalidatePath("/sessions");
}
