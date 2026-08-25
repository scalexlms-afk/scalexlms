"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@scalex/db";
import { PLATFORM_BACKUPS_BUCKET } from "@scalex/db/media";
import type { Json, UserRole } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  SETTINGS_SENSITIVE_SECTIONS,
  type SettingsSectionId,
} from "./sections";

const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "instructor",
  "mentor",
  "sales",
];

function settingsPath(section: string, saved = false) {
  const q = new URLSearchParams({ section });
  if (saved) q.set("saved", "1");
  return `/settings?${q.toString()}`;
}

export async function updateUserRoleAction(formData: FormData) {
  const targetUserId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;

  if (!targetUserId || !ADMIN_ROLES.includes(role)) {
    throw new Error("Invalid role update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();

  const { data: target } = await db
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  const currentRole = (target as { role: UserRole } | null)?.role;

  if (currentRole === "super_admin" && role !== "super_admin") {
    if (targetUserId === userId) {
      throw new Error(
        "You cannot remove your own Super Admin role. Ask another Super Admin."
      );
    }
    const { count } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if ((count ?? 0) <= 1) {
      throw new Error(
        "At least one Super Admin must remain. Promote another user first."
      );
    }
  }

  const { error } = await db
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "user.role_changed",
    targetType: "profile",
    targetId: targetUserId,
    metadata: { role },
  });

  revalidatePath("/settings");
  revalidatePath("/team");
  revalidatePath("/roles");
}

export async function updatePaymentPlanAction(formData: FormData) {
  const planId = formData.get("planId") as string;
  const dollarsRaw = formData.get("totalDollars");
  const centsRaw = formData.get("totalCents");
  const totalCents =
    dollarsRaw != null && String(dollarsRaw).trim() !== ""
      ? Math.round(Number(dollarsRaw) * 100)
      : Number(centsRaw);
  const firstPercent = Number(formData.get("firstPercent"));
  const remainingPercent = Number(formData.get("remainingPercent"));
  const section = (formData.get("section") as string) || "general";

  if (
    !planId ||
    Number.isNaN(totalCents) ||
    Number.isNaN(firstPercent) ||
    Number.isNaN(remainingPercent)
  ) {
    throw new Error("Invalid payment plan");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("payment_plan_settings")
    .update({
      total_cents: totalCents,
      first_payment_percent: firstPercent,
      remaining_percent: remainingPercent,
    })
    .eq("id", planId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "payment_plan.updated",
    targetType: "payment_plan_settings",
    targetId: planId,
    metadata: { totalCents, firstPercent, remainingPercent },
  });

  revalidatePath("/settings");
  revalidatePath("/finance");
  redirect(settingsPath(section, true));
}

export async function updateStaffProfileAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const country = ((formData.get("country") as string) || "").trim() || null;
  const language = ((formData.get("language") as string) || "").trim() || null;
  const section = ((formData.get("section") as string) ||
    "general") as SettingsSectionId;

  if (!name) throw new Error("Name is required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("profiles")
    .update({ name, phone, country, language })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "profile.updated",
    targetType: "profile",
    targetId: userId,
    metadata: { fields: ["name", "phone", "country", "language"] },
  });

  revalidatePath("/settings");
  redirect(settingsPath(section, true));
}

export async function updateStaffNotificationPrefsAction(formData: FormData) {
  const section = ((formData.get("section") as string) ||
    "notifications") as SettingsSectionId;
  const inApp =
    formData.get("in_app") === "on" || formData.get("in_app") === "true";
  const email =
    formData.get("email") === "on" || formData.get("email") === "true";

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const db = getServiceDb();
  const { error } = await db.from("notification_preferences").upsert(
    {
      user_id: userId,
      in_app: inApp,
      email,
      browser: false,
      push: false,
      whatsapp: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "notification_preferences.updated",
    targetType: "notification_preferences",
    targetId: userId,
    metadata: { in_app: inApp, email },
  });

  revalidatePath("/settings");
  redirect(settingsPath(section, true));
}

const PLATFORM_SETTING_KEYS = [
  "branding",
  "auth",
  "email",
  "ai",
  "storage",
  "backup",
] as const;

type PlatformSettingKey = (typeof PLATFORM_SETTING_KEYS)[number];

function parsePlatformSettingKey(
  value: unknown
): PlatformSettingKey | null {
  if (typeof value !== "string") return null;
  return (PLATFORM_SETTING_KEYS as readonly string[]).includes(value)
    ? (value as PlatformSettingKey)
    : null;
}

function formValueToJson(
  key: PlatformSettingKey,
  formData: FormData
): Record<string, unknown> {
  switch (key) {
    case "branding":
      return {
        academyName: String(formData.get("academyName") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim(),
        accent: String(formData.get("accent") ?? "").trim(),
        supportEmail: String(formData.get("supportEmail") ?? "").trim(),
        logoUrl: String(formData.get("logoUrl") ?? "").trim(),
      };
    case "auth":
      return {
        sessionDays: Number(formData.get("sessionDays") || 7),
        requireEmailVerification:
          formData.get("requireEmailVerification") === "on" ||
          formData.get("requireEmailVerification") === "true",
        allowPasswordReset:
          formData.get("allowPasswordReset") === "on" ||
          formData.get("allowPasswordReset") === "true",
      };
    case "email":
      return {
        fromName: String(formData.get("fromName") ?? "").trim(),
        replyTo: String(formData.get("replyTo") ?? "").trim(),
        welcomeEnabled:
          formData.get("welcomeEnabled") === "on" ||
          formData.get("welcomeEnabled") === "true",
        reviewEnabled:
          formData.get("reviewEnabled") === "on" ||
          formData.get("reviewEnabled") === "true",
        sessionReminderEnabled:
          formData.get("sessionReminderEnabled") === "on" ||
          formData.get("sessionReminderEnabled") === "true",
        paymentReceiptEnabled:
          formData.get("paymentReceiptEnabled") === "on" ||
          formData.get("paymentReceiptEnabled") === "true",
      };
    case "ai":
      return {
        academyGroundingPercent: Number(
          formData.get("academyGroundingPercent") || 80
        ),
        evaluationEnabled:
          formData.get("evaluationEnabled") === "on" ||
          formData.get("evaluationEnabled") === "true",
        // Product rule: AI never auto-approves gating tasks.
        autoApproveGating: false,
      };
    case "storage":
      return {
        maxUploadMb: Number(formData.get("maxUploadMb") || 25),
        signedUrlMinutes: Number(formData.get("signedUrlMinutes") || 60),
      };
    case "backup":
      return {
        retentionDays: Number(formData.get("retentionDays") || 30),
        preferredWindowUtc: String(
          formData.get("preferredWindowUtc") ?? ""
        ).trim(),
        notifyOnComplete:
          formData.get("notifyOnComplete") === "on" ||
          formData.get("notifyOnComplete") === "true",
      };
  }
}

/** Upsert non-secret platform_settings JSON by key. Integrations stay env-only. */
export async function updatePlatformSettingAction(formData: FormData) {
  const key = parsePlatformSettingKey(formData.get("key"));
  const section = ((formData.get("section") as string) ||
    key ||
    "general") as SettingsSectionId;

  if (!key) throw new Error("Invalid settings key");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  if (
    SETTINGS_SENSITIVE_SECTIONS.includes(section) &&
    profile.role !== "super_admin"
  ) {
    throw new Error("Only Super Admin can update this section");
  }

  const value = formValueToJson(key, formData) as Json;
  const db = getServiceDb();

  let nextValue = value;
  if (key === "backup") {
    const { data: existing } = await db
      .from("platform_settings")
      .select("value")
      .eq("key", "backup")
      .maybeSingle();
    const prev =
      existing?.value &&
      typeof existing.value === "object" &&
      !Array.isArray(existing.value)
        ? (existing.value as Record<string, unknown>)
        : {};
    nextValue = {
      ...prev,
      ...(value as Record<string, unknown>),
    } as Json;
  }

  const { error } = await db.from("platform_settings").upsert(
    {
      key,
      value: nextValue,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "platform_settings.updated",
    targetType: "platform_settings",
    targetId: key,
    metadata: {
      key,
      fields: Object.keys(nextValue as Record<string, unknown>),
    },
  });

  revalidatePath("/settings");
  redirect(settingsPath(section, true));
}

/** Super-admin JSON snapshot upload to platform-backups bucket. */
export async function runPlatformBackupAction(formData: FormData) {
  const section = ((formData.get("section") as string) ||
    "backup") as SettingsSectionId;

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");
  if (profile.role !== "super_admin") {
    throw new Error("Only Super Admin can run platform backups");
  }

  const db = getServiceDb();
  const ranAt = new Date().toISOString();
  const objectPath = `${ranAt.replace(/[:.]/g, "-")}.json`;

  const { data: existingBackup } = await db
    .from("platform_settings")
    .select("value")
    .eq("key", "backup")
    .maybeSingle();

  const prevPrefs =
    existingBackup?.value &&
    typeof existingBackup.value === "object" &&
    !Array.isArray(existingBackup.value)
      ? (existingBackup.value as Record<string, unknown>)
      : {};

  const retentionDays =
    typeof prevPrefs.retentionDays === "number" &&
    Number.isFinite(prevPrefs.retentionDays)
      ? Math.max(1, Math.floor(prevPrefs.retentionDays))
      : 30;

  try {
    const [
      profiles,
      courses,
      milestones,
      modules,
      lessons,
      enrollments,
      payments,
      platformSettings,
      unlockRules,
      quizzesCount,
      quizQuestionsCount,
    ] = await Promise.all([
      db
        .from("profiles")
        .select("id, role, email, name, status")
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("courses")
        .select(
          "id, title, status, description, created_at, updated_at, created_by"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("milestones")
        .select(
          "id, course_id, title, order_index, icon, color, created_at, updated_at"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("modules")
        .select("id, milestone_id, title, order_index, created_at, updated_at")
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("lessons")
        .select(
          "id, module_id, title, content_type, content_url, order_index, duration_seconds, completion_type, xp_points, level, estimated_minutes, status, created_at, updated_at"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("enrollments")
        .select(
          "id, student_id, course_id, plan, completion_percent, enrolled_at, created_at, updated_at"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("payments")
        .select(
          "id, student_id, amount, type, status, method, paid_at, created_at, updated_at"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("platform_settings")
        .select("key, value, updated_at, updated_by")
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("unlock_rules")
        .select(
          "id, milestone_id, rule_type, config, enabled, created_at, updated_at"
        )
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.data ?? [];
        }),
      db
        .from("quizzes")
        .select("id", { count: "exact", head: true })
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }),
      db
        .from("quiz_questions")
        .select("id", { count: "exact", head: true })
        .then((r) => {
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }),
    ]);

    const snapshot = {
      version: 1,
      generatedAt: ranAt,
      tables: {
        profiles,
        courses,
        milestones,
        modules,
        lessons,
        enrollments,
        payments,
        platform_settings: platformSettings,
        unlock_rules: unlockRules,
      },
      counts: {
        quizzes: quizzesCount,
        quiz_questions: quizQuestionsCount,
      },
    };

    const body = JSON.stringify(snapshot, null, 2);
    const { error: uploadError } = await db.storage
      .from(PLATFORM_BACKUPS_BUCKET)
      .upload(objectPath, body, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    try {
      const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      const { data: listed } = await db.storage
        .from(PLATFORM_BACKUPS_BUCKET)
        .list("", { limit: 1000 });
      const stale = (listed ?? [])
        .filter((obj) => {
          if (!obj.name?.endsWith(".json")) return false;
          if (!obj.created_at) return false;
          return new Date(obj.created_at).getTime() < cutoff;
        })
        .map((obj) => obj.name);
      if (stale.length > 0) {
        await db.storage.from(PLATFORM_BACKUPS_BUCKET).remove(stale);
      }
    } catch {
      // retention is best-effort
    }

    const nextValue = {
      ...prevPrefs,
      retentionDays,
      lastRunAt: ranAt,
      lastPath: objectPath,
      lastStatus: "ok",
    } as Json;

    const { error: settingsError } = await db.from("platform_settings").upsert(
      {
        key: "backup",
        value: nextValue,
        updated_by: userId,
        updated_at: ranAt,
      },
      { onConflict: "key" }
    );
    if (settingsError) throw new Error(settingsError.message);

    await writeAuditLog({
      actorId: userId,
      action: "backup.ran",
      targetType: "platform_settings",
      targetId: "backup",
      metadata: { path: objectPath, retentionDays },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backup failed";
    const failValue = {
      ...prevPrefs,
      retentionDays,
      lastRunAt: ranAt,
      lastPath: objectPath,
      lastStatus: "error",
      lastError: message,
    } as Json;
    await db.from("platform_settings").upsert(
      {
        key: "backup",
        value: failValue,
        updated_by: userId,
        updated_at: ranAt,
      },
      { onConflict: "key" }
    );
    throw new Error(message);
  }

  revalidatePath("/settings");
  redirect(settingsPath(section, true));
}
