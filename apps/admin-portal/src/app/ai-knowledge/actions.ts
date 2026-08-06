"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createKnowledgeArticleAction(formData: FormData) {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const title = str(formData, "title");
  const body = str(formData, "body");
  const category = (str(formData, "category") || "guide") as
    | "guide"
    | "policy"
    | "tutorial"
    | "template"
    | "faq"
    | "case_study";
  const status = (str(formData, "status") || "draft") as "draft" | "published";
  const courseId = str(formData, "courseId") || null;

  if (!title || !body) throw new Error("Title and body are required");

  const db = getServiceDb();
  const { error } = await db.from("ai_knowledge_articles").insert({
    title,
    body,
    category,
    status,
    course_id: courseId,
    created_by: userId,
    updated_by: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/ai-knowledge");
}

export async function updateKnowledgeArticleStatusAction(formData: FormData) {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const id = str(formData, "id");
  const status = str(formData, "status") as "draft" | "published";
  if (!id) throw new Error("Missing article id");

  const db = getServiceDb();
  const { error } = await db
    .from("ai_knowledge_articles")
    .update({ status, updated_by: userId })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ai-knowledge");
}

export async function deleteKnowledgeArticleAction(formData: FormData) {
  const { profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const id = str(formData, "id");
  if (!id) throw new Error("Missing article id");

  const db = getServiceDb();
  const { error } = await db.from("ai_knowledge_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ai-knowledge");
}
