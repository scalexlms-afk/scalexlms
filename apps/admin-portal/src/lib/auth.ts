import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import {
  isAdminRole,
  requireRole as assertRole,
  type Feature,
  canAccess,
} from "@scalex/db/rbac";
import type { Profile, UserRole } from "@scalex/db/types";

export async function getSessionProfile(): Promise<{
  userId: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { userId: user.id, profile: profile as Profile };
}

export async function requireAdminProfile() {
  const session = await getSessionProfile();
  if (!session || !isAdminRole(session.profile.role)) {
    redirect("/login");
  }
  return session;
}

/**
 * Page-level feature guard. Redirects to a clean /forbidden screen instead of
 * throwing a 500 when the caller lacks permission. Use in page components.
 */
export function requireFeaturePage(
  role: UserRole | null | undefined,
  feature: Feature,
  minLevel: "partial" | "full" | "own" = "partial"
) {
  if (!role || !canAccess(role, feature, minLevel)) {
    redirect("/forbidden");
  }
}

export function requireRole(
  role: UserRole | null | undefined,
  allowed: UserRole[]
): asserts role is UserRole {
  assertRole(role, allowed);
}

export function requireFeature(
  role: UserRole | null | undefined,
  feature: Feature,
  minLevel: "partial" | "full" | "own" = "partial"
) {
  if (!role || !canAccess(role, feature, minLevel)) {
    throw new Error("Forbidden");
  }
}
