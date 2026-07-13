"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@scalex/db";
import type { CourseStatus, LessonContentType } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  LESSON_MEDIA_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/media";
import { buildPdfLessonContentText } from "@/lib/pdf-extract";

function revalidateContent(courseId?: string | null) {
  revalidatePath("/content");
  revalidatePath("/content", "layout");
  if (courseId) revalidatePath(`/content/courses/${courseId}`);
}

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
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent(data.id);
  redirect(`/content/courses/${data.id}`);
}

export async function updateCourseAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") as CourseStatus;

  if (!courseId || !title || !status) throw new Error("Invalid course");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent(courseId);
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

  revalidateContent();
}

export async function createMilestoneAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const orderIndex = Number(formData.get("orderIndex"));

  if (!courseId || !title || Number.isNaN(orderIndex)) {
    throw new Error("Invalid milestone");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
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

  revalidateContent();
}

export async function createModuleAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const title = (formData.get("title") as string)?.trim();
  const orderIndex = Number(formData.get("orderIndex"));

  if (!milestoneId || !title || Number.isNaN(orderIndex)) {
    throw new Error("Invalid module");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
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

  revalidateContent();
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
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
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
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
}

export async function reextractLessonPdfAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  if (!lessonId) throw new Error("Lesson required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
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

  revalidateContent();
}

export async function createTaskAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!milestoneId || !title) throw new Error("Invalid task");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent();
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

  revalidateContent();
}

export async function updateCourseStatusAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const status = formData.get("status") as CourseStatus;

  if (!courseId || !status) throw new Error("Invalid course update");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

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

  revalidateContent(courseId);
}

export async function updateMilestoneAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();

  if (!milestoneId || !title) throw new Error("Invalid milestone");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("milestones")
    .update({ title })
    .eq("id", milestoneId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "milestone.updated",
    targetType: "milestone",
    targetId: milestoneId,
    metadata: { title },
  });

  revalidateContent(courseId);
}

export async function updateModuleAction(formData: FormData) {
  const moduleId = formData.get("moduleId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();

  if (!moduleId || !title) throw new Error("Invalid module");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db.from("modules").update({ title }).eq("id", moduleId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "module.updated",
    targetType: "module",
    targetId: moduleId,
    metadata: { title },
  });

  revalidateContent(courseId);
}

export async function updateTaskAction(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const formatsRaw = formData.getAll("acceptedFormats");
  const accepted_formats = formatsRaw
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => v as "image" | "excel" | "pdf" | "link" | "text");

  if (!taskId || !title) throw new Error("Invalid task");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("tasks")
    .update({
      title,
      description,
      accepted_formats:
        accepted_formats.length > 0
          ? accepted_formats
          : (["image", "pdf", "link", "text"] as const),
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "task.updated",
    targetType: "task",
    targetId: taskId,
    metadata: { title },
  });

  revalidateContent(courseId);
}

async function swapOrder(
  table: "milestones" | "modules" | "lessons",
  id: string,
  direction: "up" | "down",
  parentColumn: string,
  parentId: string
) {
  const db = getServiceDb();
  const { data: rows, error } = await db
    .from(table)
    .select("id, order_index")
    .eq(parentColumn, parentId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  const list = rows ?? [];
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Item not found");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return;

  const a = list[idx];
  const b = list[swapIdx];
  const { error: e1 } = await db
    .from(table)
    .update({ order_index: b.order_index })
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await db
    .from(table)
    .update({ order_index: a.order_index })
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
}

export async function reorderMilestoneAction(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const courseId = formData.get("courseId") as string;
  const direction = formData.get("direction") as "up" | "down";
  if (!milestoneId || !courseId || !["up", "down"].includes(direction)) {
    throw new Error("Invalid reorder");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  await swapOrder("milestones", milestoneId, direction, "course_id", courseId);
  await writeAuditLog({
    actorId: userId,
    action: "milestone.reordered",
    targetType: "milestone",
    targetId: milestoneId,
    metadata: { direction },
  });
  revalidateContent(courseId);
}

export async function reorderModuleAction(formData: FormData) {
  const moduleId = formData.get("moduleId") as string;
  const milestoneId = formData.get("milestoneId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const direction = formData.get("direction") as "up" | "down";
  if (!moduleId || !milestoneId || !["up", "down"].includes(direction)) {
    throw new Error("Invalid reorder");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  await swapOrder("modules", moduleId, direction, "milestone_id", milestoneId);
  await writeAuditLog({
    actorId: userId,
    action: "module.reordered",
    targetType: "module",
    targetId: moduleId,
    metadata: { direction },
  });
  revalidateContent(courseId);
}

export async function reorderLessonAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const moduleId = formData.get("moduleId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const direction = formData.get("direction") as "up" | "down";
  if (!lessonId || !moduleId || !["up", "down"].includes(direction)) {
    throw new Error("Invalid reorder");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  await swapOrder("lessons", lessonId, direction, "module_id", moduleId);
  await writeAuditLog({
    actorId: userId,
    action: "lesson.reordered",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { direction },
  });
  revalidateContent(courseId);
}
