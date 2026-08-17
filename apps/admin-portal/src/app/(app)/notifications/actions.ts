"use server";

import { createClient } from "@scalex/db/server";
import { requireAdminProfile } from "@/lib/auth";

export async function markNotificationRead(formData: FormData) {
  const id = formData.get("id") as string;
  const { userId } = await requireAdminProfile();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
}
