import { createServiceClient } from "./service";
import type { Json } from "./database.types";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  payload?: Json;
}

/** Payment and security alerts always deliver regardless of prefs. */
export function isCriticalNotificationType(type: string): boolean {
  if (type.startsWith("payment_")) return true;
  if (type.startsWith("security_")) return true;
  if (type === "security" || type === "enrollment") return true;
  return false;
}

export type NotificationPreferenceFlags = {
  in_app: boolean;
  email: boolean;
};

const DEFAULT_PREFS: NotificationPreferenceFlags = {
  in_app: true,
  email: true,
};

export async function getNotificationPreferenceFlags(
  userId: string
): Promise<NotificationPreferenceFlags> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return DEFAULT_PREFS;
    }
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("notification_preferences")
      .select("in_app, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return DEFAULT_PREFS;
    const row = data as { in_app?: boolean; email?: boolean };
    return {
      in_app: row.in_app ?? true,
      email: row.email ?? true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function userAllowsInAppNotification(
  userId: string,
  type: string
): Promise<boolean> {
  if (isCriticalNotificationType(type)) return true;
  const prefs = await getNotificationPreferenceFlags(userId);
  return prefs.in_app;
}

export async function userAllowsEmailNotification(
  userId: string,
  type: string
): Promise<boolean> {
  if (isCriticalNotificationType(type)) return true;
  const prefs = await getNotificationPreferenceFlags(userId);
  return prefs.email;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("createNotification skipped: missing SUPABASE_SERVICE_ROLE_KEY");
      return null;
    }

    const allowed = await userAllowsInAppNotification(input.userId, input.type);
    if (!allowed) {
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
