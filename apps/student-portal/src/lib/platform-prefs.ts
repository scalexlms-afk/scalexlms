import { cache } from "react";
import { createServiceClient } from "@scalex/db/server";

export type StudentPlatformPrefs = {
  introVideoUrl: string | null;
  detectScreenRecording: boolean;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export const getStudentPlatformPrefs = cache(
  async (): Promise<StudentPlatformPrefs> => {
    const empty: StudentPlatformPrefs = {
      introVideoUrl: null,
      detectScreenRecording: false,
    };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return empty;

    try {
      const db = createServiceClient();
      const { data, error } = await db
        .from("platform_settings")
        .select("key, value")
        .in("key", ["branding", "security"]);
      if (error) {
        console.error("getStudentPlatformPrefs:", error.message);
        return empty;
      }

      const map = new Map(
        (data ?? []).map((row) => [
          (row as { key: string }).key,
          asRecord((row as { value: unknown }).value),
        ])
      );
      const branding = map.get("branding") ?? {};
      const security = map.get("security") ?? {};
      const intro =
        typeof branding.introVideoUrl === "string"
          ? branding.introVideoUrl.trim()
          : "";

      return {
        introVideoUrl: intro || null,
        detectScreenRecording: security.detectScreenRecording === true,
      };
    } catch (err) {
      console.error(
        "getStudentPlatformPrefs:",
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }
);
