"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";

export async function updateStudentProfileAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phoneRaw = (formData.get("phone") as string | null)?.trim() ?? "";
  const phone = phoneRaw.length > 0 ? phoneRaw : null;

  if (!name) {
    redirect(
      "/settings?error=" + encodeURIComponent("Full name is required")
    );
  }

  if (name.length > 120) {
    redirect(
      "/settings?error=" + encodeURIComponent("Name is too long")
    );
  }

  if (phone && phone.length > 40) {
    redirect(
      "/settings?error=" + encodeURIComponent("Phone number is too long")
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name, phone } as never)
    .eq("id", userId);

  if (error) {
    redirect(
      "/settings?error=" + encodeURIComponent(error.message)
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
