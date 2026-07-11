import { createClient } from "@scalex/db/server";
import type { Profile } from "@scalex/db/types";

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

export async function requireStudentProfile() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    throw new Error("Unauthorized");
  }
  return session;
}
