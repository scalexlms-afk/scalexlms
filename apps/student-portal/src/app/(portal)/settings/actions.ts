"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";
import { collectAccountExport } from "@/lib/account-export";
import { SETTINGS_COUNTRIES, SETTINGS_LANGUAGES } from "@/lib/settings-shared";

function settingsRedirect(opts: {
  error?: string;
  saved?: boolean;
  tab?: string;
}) {
  const params = new URLSearchParams();
  if (opts.saved) params.set("saved", "1");
  if (opts.error) params.set("error", opts.error);
  if (opts.tab) params.set("tab", opts.tab);
  const q = params.toString();
  redirect(q ? `/settings?${q}` : "/settings");
}

const ALLOWED_COUNTRIES = new Set<string>(SETTINGS_COUNTRIES);
const ALLOWED_LANGUAGES = new Set(SETTINGS_LANGUAGES.map((l) => l.value));

export async function updateStudentProfileAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phoneRaw = (formData.get("phone") as string | null)?.trim() ?? "";
  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const countryRaw = (formData.get("country") as string | null)?.trim() ?? "";
  const country = countryRaw.length > 0 ? countryRaw : null;
  const languageRaw =
    (formData.get("language") as string | null)?.trim() ?? "en";

  if (!name) {
    settingsRedirect({ error: "Full name is required", tab: "profile" });
  }

  if (name.length > 120) {
    settingsRedirect({ error: "Name is too long", tab: "profile" });
  }

  if (phone && phone.length > 40) {
    settingsRedirect({ error: "Phone number is too long", tab: "profile" });
  }

  if (country && !ALLOWED_COUNTRIES.has(country)) {
    settingsRedirect({ error: "Invalid country", tab: "profile" });
  }

  if (!ALLOWED_LANGUAGES.has(languageRaw)) {
    settingsRedirect({ error: "Invalid language", tab: "profile" });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      phone,
      country,
      language: languageRaw,
    } as never)
    .eq("id", userId);

  if (error) {
    settingsRedirect({ error: error.message, tab: "profile" });
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  settingsRedirect({ saved: true, tab: "profile" });
}

export async function uploadAvatarAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const raw = formData.get("avatar");

  if (!(raw instanceof File) || raw.size === 0) {
    settingsRedirect({ error: "Choose an image to upload", tab: "profile" });
  }

  const file = raw as File;

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    settingsRedirect({ error: "Image must be 2MB or smaller", tab: "profile" });
  }

  const allowed = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
  if (!allowed.has(file.type)) {
    settingsRedirect({
      error: "Use JPG, PNG, GIF, or WebP",
      tab: "profile",
    });
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/gif"
        ? "gif"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

  const path = `${userId}/avatar.${ext}`;
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    settingsRedirect({ error: uploadError.message, tab: "profile" });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl } as never)
    .eq("id", userId);

  if (error) {
    settingsRedirect({ error: error.message, tab: "profile" });
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  settingsRedirect({ saved: true, tab: "profile" });
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const inApp = formData.get("in_app") === "on" || formData.get("in_app") === "true";
  const email =
    formData.get("email") === "on" || formData.get("email") === "true";
  const tab = (formData.get("return_tab") as string | null) || "notifications";

  const supabase = await createClient();
  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: userId,
      in_app: inApp,
      email,
      // Keep channel flags false until providers ship
      browser: false,
      push: false,
      whatsapp: false,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id" }
  );

  if (error) {
    settingsRedirect({ error: error.message, tab });
  }

  revalidatePath("/settings");
  revalidatePath("/notifications");
  settingsRedirect({ saved: true, tab });
}

/** Toggle a single channel from the Notifications rail (in_app | email). */
export async function toggleNotificationPreferenceAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const channel = (formData.get("channel") as string | null)?.trim();
  const enabled =
    formData.get("enabled") === "on" || formData.get("enabled") === "true";

  if (channel !== "in_app" && channel !== "email") {
    redirect(
      "/notifications?error=" +
        encodeURIComponent("That channel is not available yet")
    );
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("in_app, email")
    .eq("user_id", userId)
    .maybeSingle();

  const row = (existing as { in_app?: boolean; email?: boolean } | null) ?? {};
  const next = {
    user_id: userId,
    in_app: channel === "in_app" ? enabled : (row.in_app ?? true),
    email: channel === "email" ? enabled : (row.email ?? true),
    browser: false,
    push: false,
    whatsapp: false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(next as never, { onConflict: "user_id" });

  if (error) {
    redirect("/notifications?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/notifications");
  revalidatePath("/settings");
  redirect("/notifications?saved=1");
}

export async function updateLearningSettingsAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const cadenceRaw =
    (formData.get("digestCadence") as string | null)?.trim() ?? "weekly";
  const digestCadence =
    cadenceRaw === "daily" || cadenceRaw === "weekly" || cadenceRaw === "off"
      ? cadenceRaw
      : "weekly";
  const hourRaw = Number(formData.get("reminderHour"));
  const reminderHour =
    Number.isFinite(hourRaw) && hourRaw >= 0 && hourRaw <= 23
      ? Math.floor(hourRaw)
      : 9;

  const learning = { digestCadence, reminderHour };
  const supabase = await createClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      learning,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id" }
  );

  if (error) {
    settingsRedirect({ error: error.message, tab: "learning" });
  }

  revalidatePath("/settings");
  settingsRedirect({ saved: true, tab: "learning" });
}

export async function changePasswordAction(formData: FormData) {
  const { userId: _userId } = await requireStudentProfile();
  void _userId;
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirmPassword") as string | null) ?? "";

  if (password.length < 8) {
    settingsRedirect({
      error: "Password must be at least 8 characters",
      tab: "security",
    });
  }

  if (password !== confirm) {
    settingsRedirect({
      error: "Passwords do not match",
      tab: "security",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    settingsRedirect({ error: error.message, tab: "security" });
  }

  revalidatePath("/settings");
  settingsRedirect({ saved: true, tab: "security" });
}

export async function exportMyDataAction(): Promise<{
  ok: true;
  data: unknown;
} | { ok: false; error: string }> {
  const { userId } = await requireStudentProfile();
  try {
    const data = await collectAccountExport(userId);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Export failed",
    };
  }
}

export async function deactivateAccountAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const confirm = (formData.get("confirm") as string | null)?.trim() ?? "";

  if (confirm !== "DEACTIVATE") {
    settingsRedirect({
      error: 'Type DEACTIVATE to confirm account deactivation',
      tab: "account",
    });
  }

  // status is locked by guard_profile_self_update for JWT self-updates
  const service = createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ status: "inactive" } as never)
    .eq("id", userId);

  if (error) {
    settingsRedirect({ error: error.message, tab: "account" });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?deactivated=1");
}
