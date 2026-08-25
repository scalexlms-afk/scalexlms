"use server";

import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import { isAdminRole } from "@scalex/db/rbac";
import type { UserRole } from "@scalex/db/types";
import { clearScalexNavCookies, setScalexRoleCookie } from "@/lib/nav-cookies";

export type LoginState = { error: string | null };

/**
 * Failed sign-in returns inline state (never throws / never redirects).
 * Any previous staff session is cleared first so a bad password cannot keep
 * the prior user signed in.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rawRedirect = String(formData.get("redirect") ?? "").trim();
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
    await clearScalexNavCookies();
  } catch {
    /* still attempt the new sign-in */
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    try {
      await supabase.auth.signOut();
      await clearScalexNavCookies();
    } catch {
      /* ignore */
    }
    return {
      error: error?.message || "Invalid login credentials",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = (profile as { role: UserRole } | null)?.role;

  if (!role || !isAdminRole(role)) {
    await supabase.auth.signOut();
    await clearScalexNavCookies();
    return {
      error:
        "This portal is for admin staff only. Students should use the Student Portal.",
    };
  }

  await setScalexRoleCookie(role);
  redirect(redirectTo);
}

export async function resetPasswordAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim();

  if (!email) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Enter the email associated with your account.")}`
    );
  }

  const { requestPasswordOtp } = await import("@scalex/db/server");
  await requestPasswordOtp({
    email,
    portal: "admin",
    portalLabel: "Management OS",
  });

  redirect(`/reset-password/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyPasswordOtpAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const code = (formData.get("code") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (password !== confirm) {
    redirect(
      `/reset-password/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent("Passwords do not match.")}`
    );
  }

  const { verifyPasswordOtpAndSetPassword } = await import("@scalex/db/server");
  const result = await verifyPasswordOtpAndSetPassword({
    email,
    code,
    newPassword: password,
    portal: "admin",
  });

  if (!result.ok) {
    redirect(
      `/reset-password/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent(result.error)}`
    );
  }

  redirect(
    `/login?error=${encodeURIComponent("Password updated. Sign in with your new password.")}`
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearScalexNavCookies();
  redirect("/login");
}
