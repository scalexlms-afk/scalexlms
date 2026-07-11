"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@scalex/db/server";

async function redirectAfterAuth(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, fallback = "/dashboard") {
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  const status = (profile as { status: string } | null)?.status;

  if (status === "active") {
    redirect(fallback === "/payment" ? "/dashboard" : fallback);
  }

  redirect("/payment");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

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

  const supabase = await createClient();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) {
      redirect(`/register?error=${encodeURIComponent(createError.message)}`);
    }
  } else {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      redirect(`/register?error=${encodeURIComponent(signUpError.message)}`);
    }
  }

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(
      `/register?error=${encodeURIComponent(
        `${signInError.message} — If you just registered, turn off "Confirm email" in Supabase → Authentication → Providers → Email.`
      )}`
    );
  }

  await redirectAfterAuth(supabase, data.user.id, "/payment");
}

export async function resetPasswordAction() {
  redirect(
    `/reset-password?error=${encodeURIComponent("Password reset emails are disabled in dev. Sign in with your existing password or register a new account.")}`
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
