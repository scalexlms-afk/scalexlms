"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";

export async function markNotificationRead(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Notification id is required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() } as never)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
