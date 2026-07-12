"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@scalex/db";
import type { CourseStatus, LessonContentType } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  LESSON_MEDIA_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/media";
import { buildPdfLessonContentText } from "@/lib/pdf-extract";

async function removeStorageFileIfOwned(url: string | null) {
  const path = storagePathFromPublicUrl(url);
  if (!path) return;
  const db = getServiceDb();
  await db.storage.from(LESSON_MEDIA_BUCKET).remove([path]);
}

export async function createCourseAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as CourseStatus) || "draft";

  if (!title) throw new Error("Title required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data, error } = await db
    .from("courses")
    .insert({ title, description, status, created_by: userId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "course.created",
    targetType: "course",
    targetId: data.id,
    metadata: { title },
  });

  revalidatePath("/content");
}

export async function updateCourseAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") as CourseStatus;

  if (!courseId || !title || !status) throw new Error("Invalid course");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { error } = await db
    .from("courses")
    .update({ title, description, status })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "course.updated",
    targetType: "course",
    targetId: courseId,
    metadata: { title, status },
  });

  revalidatePath("/content");
}

export async function deleteCourseAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  if (!courseId) throw new Error("Course required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db.from("courses").delete().eq("id", courseId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "course.deleted",
    targetType: "course",
    targetId: courseId,
  });

  revalidatePath("/content");
}

export async function createMilestoneAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const orderIndex = Number(formData.get("orderIndex"));

  if (!courseId || !title || Number.isNaN(orderIndex)) {
    throw new Error("Invalid milestone");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data, error } = await db
    .from("milestones")
    .insert({ course_id: courseId, title, order_index: orderIndex })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "milestone.created",
    targetType: "milestone",
    targetId: data.id,
    metadata: { title, courseId },
  });

  revalidatePath("/content");
}

export async function deleteMilestoneAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  if (!milestoneId) throw new Error("Milestone required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db.from("milestones").delete().eq("id", milestoneId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "milestone.deleted",
    targetType: "milestone",
    targetId: milestoneId,
  });

  revalidatePath("/content");
}

export async function createModuleAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const title = (formData.get("title") as string)?.trim();
  const orderIndex = Number(formData.get("orderIndex"));

  if (!milestoneId || !title || Number.isNaN(orderIndex)) {
    throw new Error("Invalid module");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data, error } = await db
    .from("modules")
    .insert({ milestone_id: milestoneId, title, order_index: orderIndex })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "module.created",
    targetType: "module",
    targetId: data.id,
    metadata: { title, milestoneId },
  });

  revalidatePath("/content");
}

export async function deleteModuleAction(formData: FormData) {
  const moduleId = formData.get("moduleId") as string;
  if (!moduleId) throw new Error("Module required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();

  const { data: lessons } = await db
    .from("lessons")
    .select("content_url")
    .eq("module_id", moduleId);

  for (const lesson of lessons ?? []) {
    await removeStorageFileIfOwned(lesson.content_url);
  }

  const { error } = await db.from("modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "module.deleted",
    targetType: "module",
    targetId: moduleId,
  });

  revalidatePath("/content");
}

export async function createLessonAction(formData: FormData) {
  const moduleId = formData.get("moduleId") as string;
  const title = (formData.get("title") as string)?.trim();
  const contentType = formData.get("contentType") as LessonContentType;
  const contentText = (formData.get("contentText") as string)?.trim() || null;
  const contentUrl = (formData.get("contentUrl") as string)?.trim() || null;
  const orderIndex = Number(formData.get("orderIndex"));

  if (!moduleId || !title || !contentType || Number.isNaN(orderIndex)) {
    throw new Error("Invalid lesson");
  }

  if (contentType === "video" || contentType === "pdf") {
    if (!contentUrl) throw new Error("Upload a file for this lesson type");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  let finalContentText = contentText;
  let pdfExtractMeta: { pageCount?: number; extracted?: boolean } = {};

  if (contentType === "pdf" && contentUrl) {
    const pdfContent = await buildPdfLessonContentText(contentUrl, contentText, {
      reextract: true,
    });
    finalContentText = pdfContent.contentText;
    pdfExtractMeta = {
      extracted: pdfContent.extracted,
      pageCount: pdfContent.pageCount,
    };
  }

  const db = getServiceDb();
  const { data, error } = await db
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      content_type: contentType,
      content_text: finalContentText,
      content_url: contentUrl,
      order_index: orderIndex,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lesson.created",
    targetType: "lesson",
    targetId: data.id,
    metadata: { title, moduleId, contentType, pdfExtract: pdfExtractMeta },
  });

  revalidatePath("/content");
}

export async function updateLessonAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const title = (formData.get("title") as string)?.trim();
  const contentType = formData.get("contentType") as LessonContentType;
  const contentText = (formData.get("contentText") as string)?.trim() || null;
  const contentUrl = (formData.get("contentUrl") as string)?.trim() || null;
  const orderIndex = Number(formData.get("orderIndex"));

  if (!lessonId || !title || !contentType || Number.isNaN(orderIndex)) {
    throw new Error("Invalid lesson update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data: existing } = await db
    .from("lessons")
    .select("content_url, content_text")
    .eq("id", lessonId)
    .single();

  let finalContentText = contentText;
  let pdfExtractMeta: { pageCount?: number; extracted?: boolean } = {};

  if (contentType === "pdf" && contentUrl) {
    const urlChanged = existing?.content_url !== contentUrl;
    const pdfContent = await buildPdfLessonContentText(contentUrl, contentText, {
      reextract: urlChanged || !contentText,
      previousUrl: existing?.content_url,
    });
    finalContentText = pdfContent.contentText;
    pdfExtractMeta = {
      extracted: pdfContent.extracted,
      pageCount: pdfContent.pageCount,
    };
  } else if (contentType === "text") {
    finalContentText = contentText;
  }

  const { error } = await db
    .from("lessons")
    .update({
      title,
      content_type: contentType,
      content_text: finalContentText,
      content_url: contentUrl,
      order_index: orderIndex,
    })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);

  if (
    existing?.content_url &&
    contentUrl &&
    existing.content_url !== contentUrl
  ) {
    await removeStorageFileIfOwned(existing.content_url);
  }

  await writeAuditLog({
    actorId: userId,
    action: "lesson.updated",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { title, contentType, pdfExtract: pdfExtractMeta },
  });

  revalidatePath("/content");
}

export async function reextractLessonPdfAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  if (!lessonId) throw new Error("Lesson required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data: lesson, error: fetchError } = await db
    .from("lessons")
    .select("id, title, content_type, content_url, content_text")
    .eq("id", lessonId)
    .single();

  if (fetchError || !lesson) throw new Error("Lesson not found");
  if (lesson.content_type !== "pdf" || !lesson.content_url) {
    throw new Error("Lesson has no PDF to extract");
  }

  const notes = lesson.content_text?.split("\n\n---\n\n")[0]?.trim() || null;
  const pdfContent = await buildPdfLessonContentText(lesson.content_url, notes, {
    reextract: true,
  });

  if (!pdfContent.extracted || !pdfContent.contentText) {
    throw new Error("Could not extract text from this PDF");
  }

  const { error } = await db
    .from("lessons")
    .update({ content_text: pdfContent.contentText })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lesson.pdf_reextracted",
    targetType: "lesson",
    targetId: lessonId,
    metadata: {
      title: lesson.title,
      pageCount: pdfContent.pageCount,
      charCount: pdfContent.contentText.length,
    },
  });

  revalidatePath("/content");
}

export async function deleteLessonAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  if (!lessonId) throw new Error("Lesson required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: lesson } = await db
    .from("lessons")
    .select("content_url")
    .eq("id", lessonId)
    .single();

  const { error } = await db.from("lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);

  await removeStorageFileIfOwned(lesson?.content_url ?? null);

  await writeAuditLog({
    actorId: userId,
    action: "lesson.deleted",
    targetType: "lesson",
    targetId: lessonId,
  });

  revalidatePath("/content");
}

export async function createTaskAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!milestoneId || !title) throw new Error("Invalid task");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { data, error } = await db
    .from("tasks")
    .insert({ milestone_id: milestoneId, title, description })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "task.created",
    targetType: "task",
    targetId: data.id,
    metadata: { title, milestoneId },
  });

  revalidatePath("/content");
}

export async function deleteTaskAction(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  if (!taskId) throw new Error("Task required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "task.deleted",
    targetType: "task",
    targetId: taskId,
  });

  revalidatePath("/content");
}

export async function updateCourseStatusAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const status = formData.get("status") as CourseStatus;

  if (!courseId || !status) throw new Error("Invalid course update");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content");

  const db = getServiceDb();
  const { error } = await db
    .from("courses")
    .update({ status })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "course.status_changed",
    targetType: "course",
    targetId: courseId,
    metadata: { status },
  });

  revalidatePath("/content");
}
