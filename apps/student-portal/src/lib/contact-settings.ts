import { createServiceClient } from "@scalex/db/server";
import {
  EMPTY_CONTACT,
  type PublicContactInfo,
} from "@/lib/contact-settings-shared";

export type { PublicContactInfo } from "@/lib/contact-settings-shared";
export { hasAnyContact, EMPTY_CONTACT } from "@/lib/contact-settings-shared";

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Read public support contact fields from platform_settings.branding
 * (and optional phone/whatsapp keys if they were stored). Students cannot
 * SELECT platform_settings via RLS, so this uses the service role when present.
 */
export async function getPublicContactInfo(): Promise<PublicContactInfo> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return EMPTY_CONTACT;

  try {
    const service = createServiceClient();
    const { data } = await service
      .from("platform_settings")
      .select("key, value")
      .in("key", ["branding", "email", "contact"]);

    const rows = (data ?? []) as Array<{ key: string; value: unknown }>;
    const merged: Record<string, unknown> = {};
    for (const row of rows) {
      if (row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
        Object.assign(merged, row.value as Record<string, unknown>);
      }
    }

    return {
      email: pickString(merged, ["supportEmail", "email", "replyTo", "fromEmail"]),
      phone: pickString(merged, ["supportPhone", "phone", "mobile", "supportMobile"]),
      whatsapp: pickString(merged, ["supportWhatsapp", "whatsapp", "whatsApp"]),
    };
  } catch {
    return EMPTY_CONTACT;
  }
}
