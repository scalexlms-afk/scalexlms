import { createServiceClient } from "./service";
import type { Json } from "./database.types";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  payload?: Json;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("createNotification skipped: missing SUPABASE_SERVICE_ROLE_KEY");
      return null;
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        payload: input.payload ?? {},
      } as never)
      .select()
      .single();

    if (error) {
      console.error("createNotification failed:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(
      "createNotification failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Json;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("audit_log").insert({
    actor_id: input.actorId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    metadata: input.metadata ?? {},
  } as never);

  if (error) throw new Error(error.message);
}
