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

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
