"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";

export async function registerForSessionAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("Session id is required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("session_registrations").insert({
    session_id: sessionId,
    student_id: userId,
  } as never);

  if (error && !error.message.includes("duplicate")) {
    throw new Error(error.message);
  }

  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}
