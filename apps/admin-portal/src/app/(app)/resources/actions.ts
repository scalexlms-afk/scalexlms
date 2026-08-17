"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createAcademyResourceAction(formData: FormData) {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const title = str(formData, "title");
  const description = str(formData, "description") || null;
  const category = str(formData, "category") || "Templates";
  const fileType = str(formData, "fileType") || "link";
  const visibility = (str(formData, "visibility") ||
    "draft") as "public" | "private" | "draft";
  const courseId = str(formData, "courseId") || null;
  const filePath = str(formData, "filePath") || null;
  const fileUrl = str(formData, "fileUrl") || null;
  const sizeRaw = str(formData, "fileSizeBytes");
  const fileSizeBytes = sizeRaw ? Number(sizeRaw) : null;

  if (!title) throw new Error("Title is required");
  if (!filePath && !fileUrl) throw new Error("Upload a file or provide a link");

  const db = getServiceDb();
  const { error } = await db.from("academy_resources").insert({
    title,
    description,
    category,
    file_type: fileType,
    visibility,
    course_id: courseId,
    file_path: filePath,
    file_url: fileUrl,
    file_size_bytes:
      fileSizeBytes != null && Number.isFinite(fileSizeBytes)
        ? fileSizeBytes
        : null,
    created_by: userId,
    updated_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/resources");
}

export async function updateAcademyResourceVisibilityAction(
  formData: FormData
) {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const id = str(formData, "id");
  const visibility = str(formData, "visibility") as
    | "public"
    | "private"
    | "draft";
  if (!id) throw new Error("Missing resource id");

  const db = getServiceDb();
  const { error } = await db
    .from("academy_resources")
    .update({ visibility, updated_by: userId })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/resources");
}

export async function deleteAcademyResourceAction(formData: FormData) {
  const { profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const id = str(formData, "id");
  if (!id) throw new Error("Missing resource id");

  const db = getServiceDb();
  const { data } = await db
    .from("academy_resources")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  if (data?.file_path) {
    await db.storage.from("academy-resources").remove([data.file_path]);
  }

  const { error } = await db.from("academy_resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/resources");
}
