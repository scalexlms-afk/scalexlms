"use server";

import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import { isAdminRole } from "@scalex/db/rbac";
import type { UserRole } from "@scalex/db/types";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = (profile as { role: UserRole } | null)?.role;

  if (!role || !isAdminRole(role)) {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent("This portal is for admin staff only. Students should use the Student Portal.")}`
    );
  }

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
  redirect("/login");
}
