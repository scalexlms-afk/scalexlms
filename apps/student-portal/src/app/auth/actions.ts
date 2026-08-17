"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@scalex/db/server";
import { safeRelativePath } from "@/lib/site";
import { clearScalexNavCookies, setScalexNavCookies } from "@/lib/nav-cookies";

async function redirectAfterAuth(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, fallback = "/dashboard") {
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", userId)
    .single();

  const row = profile as { status: string; role?: string } | null;
  const status = row?.status;
  await setScalexNavCookies(row?.role ?? "student", status ?? "pending");

  if (status === "active") {
    redirect(fallback === "/payment" ? "/dashboard" : fallback);
  }

  redirect("/payment");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = safeRelativePath(
    formData.get("redirect") as string | null,
    "/dashboard"
  );

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  await redirectAfterAuth(supabase, data.user.id, redirectTo);
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const plan =
    formData.get("plan") === "premium" ? "premium" : "standard";

  const supabase = await createClient();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, plan },
    });

    if (createError) {
      redirect(
        `/register?plan=${plan}&error=${encodeURIComponent(createError.message)}`
      );
    }
  } else {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, plan } },
    });

    if (signUpError) {
      redirect(
        `/register?plan=${plan}&error=${encodeURIComponent(signUpError.message)}`
      );
    }
  }

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(
      `/register?plan=${plan}&error=${encodeURIComponent(
        `${signInError.message} — If you just registered, turn off "Confirm email" in Supabase → Authentication → Providers → Email.`
      )}`
    );
  }

  // Service role can set plan (self-update trigger locks plan for students).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceClient();
    await admin
      .from("profiles")
      .update({ plan } as never)
      .eq("id", data.user.id);
  }

  await redirectAfterAuth(supabase, data.user.id, "/payment");
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
    portal: "student",
    portalLabel: "LaunchPad",
  });

  // Always report success (avoid leaking which emails exist).
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
    portal: "student",
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

export async function updatePasswordAction(formData: FormData) {
  // Legacy magic-link route — redirect users to OTP flow.
  void formData;
  redirect("/reset-password");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearScalexNavCookies();
  redirect("/");
}
