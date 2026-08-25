"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@scalex/db";
import type {
  CourseStatus,
  Json,
  LessonCompletionType,
  LessonContentType,
} from "@scalex/db/types";
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
  if (courseId) {
    revalidatePath(`/content/courses/${courseId}`, "layout");
    revalidatePath(`/content/courses/${courseId}`);
    revalidatePath(`/content/courses/${courseId}/structure`);
  }
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
  redirect(`/content/courses/${data.id}/structure`);
}

export async function updateCourseAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") as CourseStatus;
  const coverInput = (formData.get("coverPath") as string)?.trim() || "";

  if (!courseId || !title || !status) throw new Error("Invalid course");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const patch: {
    title: string;
    description: string | null;
    status: CourseStatus;
    cover_path?: string | null;
    cover_url?: string | null;
  } = { title, description, status };

  if (coverInput) {
    if (coverInput.includes("://") || coverInput.startsWith("/")) {
      patch.cover_url = coverInput;
    } else {
      patch.cover_path = coverInput;
      const { data } = db.storage
        .from(LESSON_MEDIA_BUCKET)
        .getPublicUrl(coverInput);
      patch.cover_url = data.publicUrl;
    }
  }

  const { error } = await db.from("courses").update(patch).eq("id", courseId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "course.updated",
    targetType: "course",
    targetId: courseId,
    metadata: { title, status, coverUpdated: Boolean(coverInput) },
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
  redirect("/content");
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
  const lessonId = formData.get("lessonId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isRequiredRaw = formData.get("isRequired");
  const is_required =
    isRequiredRaw === "on" ||
    isRequiredRaw === "true" ||
    isRequiredRaw === "1";
  const review_method =
    ((formData.get("reviewMethod") as string)?.trim() || "mentor");
  const formatsRaw = formData.getAll("acceptedFormats");
  const accepted_formats = formatsRaw
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => v as "image" | "excel" | "pdf" | "link" | "text");

  if (!lessonId || !title) throw new Error("Invalid task");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();

  // Keep milestone_id for unlock gating (is_milestone_unlocked).
  const { data: lessonRow, error: lessonErr } = await db
    .from("lessons")
    .select("id, module_id")
    .eq("id", lessonId)
    .single();
  if (lessonErr || !lessonRow) throw new Error("Lesson not found");

  const { data: moduleRow, error: moduleErr } = await db
    .from("modules")
    .select("milestone_id")
    .eq("id", lessonRow.module_id)
    .single();
  if (moduleErr || !moduleRow) throw new Error("Module not found");

  const milestone_id = moduleRow.milestone_id;

  const { data, error } = await db
    .from("tasks")
    .insert({
      lesson_id: lessonId,
      milestone_id,
      title,
      description,
      is_required,
      review_method,
      accepted_formats:
        accepted_formats.length > 0
          ? accepted_formats
          : (["image", "pdf", "link", "text"] as const),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "task.created",
    targetType: "task",
    targetId: data.id,
    metadata: { title, lessonId, milestone_id },
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
  const isRequiredRaw = formData.get("isRequired");
  const is_required =
    isRequiredRaw === "on" ||
    isRequiredRaw === "true" ||
    isRequiredRaw === "1";
  const review_method =
    ((formData.get("reviewMethod") as string)?.trim() || "mentor");
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
      is_required,
      review_method,
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
    metadata: { title, is_required, review_method },
  });

  revalidateContent(courseId);
}

async function swapOrder(
  table: "milestones" | "modules" | "lessons" | "quiz_questions",
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

export async function createLessonResourceAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const filePath = (formData.get("filePath") as string)?.trim() || null;
  const fileUrl = (formData.get("fileUrl") as string)?.trim() || null;
  const fileName = (formData.get("fileName") as string)?.trim() || null;
  const sizeRaw = (formData.get("fileSizeBytes") as string)?.trim();
  const fileSizeBytes = sizeRaw ? Number(sizeRaw) : null;

  if (!lessonId || !title) throw new Error("Invalid resource");
  if (!filePath && !fileUrl) throw new Error("Upload a file or provide a URL");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: existing } = await db
    .from("lesson_resources")
    .select("order_index")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: false })
    .limit(1);

  const order_index = (existing?.[0]?.order_index ?? 0) + 1;

  const { data, error } = await db
    .from("lesson_resources")
    .insert({
      lesson_id: lessonId,
      title,
      description,
      file_path: filePath,
      file_url: fileUrl,
      file_name: fileName || (filePath ? filePath.split("/").pop() ?? null : null),
      file_size_bytes:
        fileSizeBytes != null && Number.isFinite(fileSizeBytes)
          ? fileSizeBytes
          : null,
      order_index,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lesson_resource.created",
    targetType: "lesson_resource",
    targetId: data.id,
    metadata: { title, lessonId },
  });

  revalidateContent(courseId);
}

export async function deleteLessonResourceAction(formData: FormData) {
  const resourceId = formData.get("resourceId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  if (!resourceId) throw new Error("Resource required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data } = await db
    .from("lesson_resources")
    .select("file_path")
    .eq("id", resourceId)
    .maybeSingle();

  const { error } = await db
    .from("lesson_resources")
    .delete()
    .eq("id", resourceId);
  if (error) throw new Error(error.message);

  if (data?.file_path) {
    await db.storage.from(LESSON_MEDIA_BUCKET).remove([data.file_path]);
  }

  await writeAuditLog({
    actorId: userId,
    action: "lesson_resource.deleted",
    targetType: "lesson_resource",
    targetId: resourceId,
  });

  revalidateContent(courseId);
}

export async function updateLessonAiPromptAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const aiPrompt = (formData.get("aiPrompt") as string)?.trim() || null;

  if (!lessonId) throw new Error("Lesson required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("lessons")
    .update({ ai_prompt: aiPrompt })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lesson.ai_prompt_updated",
    targetType: "lesson",
    targetId: lessonId,
  });

  revalidateContent(courseId);
}

export async function updateLessonMetaAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const completionType = formData.get(
    "completionType"
  ) as LessonCompletionType;
  const status = (formData.get("status") as string)?.trim() || "draft";
  const xpRaw = (formData.get("xpPoints") as string)?.trim();
  const minutesRaw = (formData.get("estimatedMinutes") as string)?.trim();
  const level = (formData.get("level") as string)?.trim() || null;
  const objectivesRaw = (formData.get("learningObjectives") as string) ?? "";
  const learning_objectives = objectivesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!lessonId || !completionType) throw new Error("Invalid lesson meta");
  if (status !== "draft" && status !== "published") {
    throw new Error("Invalid lesson status");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("lessons")
    .update({
      completion_type: completionType,
      status,
      xp_points: xpRaw ? Number(xpRaw) : 0,
      estimated_minutes: minutesRaw ? Number(minutesRaw) : null,
      level,
      learning_objectives:
        learning_objectives.length > 0 ? learning_objectives : null,
    })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lesson.meta_updated",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { completionType, status },
  });

  revalidateContent(courseId);
}

export async function updateUnlockRuleAction(formData: FormData) {
  const ruleId = formData.get("ruleId") as string;
  const milestoneId = formData.get("milestoneId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const enabled =
    formData.get("enabled") === "on" ||
    formData.get("enabled") === "true" ||
    formData.get("enabled") === "1";
  const ruleType =
    (formData.get("ruleType") as string)?.trim() ||
    "previous_milestone_required_tasks";

  if (!milestoneId) throw new Error("Milestone required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();

  if (ruleId) {
    const { error } = await db
      .from("unlock_rules")
      .update({ enabled, rule_type: ruleType })
      .eq("id", ruleId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("unlock_rules").upsert(
      {
        milestone_id: milestoneId,
        enabled,
        rule_type: ruleType,
        config: {},
      },
      { onConflict: "milestone_id" }
    );
    if (error) throw new Error(error.message);
  }

  await writeAuditLog({
    actorId: userId,
    action: "unlock_rule.updated",
    targetType: "unlock_rule",
    targetId: ruleId || milestoneId,
    metadata: { enabled, ruleType, milestoneId },
  });

  revalidateContent(courseId);
}

function parseQuizOptions(formData: FormData): string[] {
  const indexed: string[] = [];
  for (let i = 0; i < 8; i++) {
    const value = String(formData.get(`option${i}`) ?? "").trim();
    if (value) indexed.push(value);
  }
  if (indexed.length > 0) return indexed;

  const optionsRaw = String(
    formData.get("optionsText") ?? formData.get("options") ?? ""
  );
  return optionsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function safeAudit(input: Parameters<typeof writeAuditLog>[0]) {
  try {
    await writeAuditLog(input);
  } catch (err) {
    console.error("audit log failed:", err instanceof Error ? err.message : err);
  }
}

export async function createQuizAction(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const passRaw = (formData.get("passPercent") as string)?.trim();
  const pass_percent = passRaw ? Number(passRaw) : 70;

  if (!lessonId || !title) throw new Error("Invalid quiz");
  if (!Number.isFinite(pass_percent) || pass_percent < 0 || pass_percent > 100) {
    throw new Error("Pass percent must be 0–100");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { count, error: countErr } = await db
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("lesson_id", lessonId);
  if (countErr) throw new Error(countErr.message);
  if ((count ?? 0) > 0) {
    throw new Error("This lesson already has a quiz (one quiz per lesson)");
  }

  const { data, error } = await db
    .from("quizzes")
    .insert({
      lesson_id: lessonId,
      title,
      pass_percent: Math.round(pass_percent),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "quiz.created",
    targetType: "quiz",
    targetId: data.id,
    metadata: { title, lessonId, pass_percent },
  });

  revalidateContent(courseId);
}

export async function updateQuizAction(formData: FormData) {
  const quizId = formData.get("quizId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const passRaw = (formData.get("passPercent") as string)?.trim();
  const pass_percent = passRaw ? Number(passRaw) : 70;

  if (!quizId || !title) throw new Error("Invalid quiz");
  if (!Number.isFinite(pass_percent) || pass_percent < 0 || pass_percent > 100) {
    throw new Error("Pass percent must be 0–100");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("quizzes")
    .update({
      title,
      pass_percent: Math.round(pass_percent),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quizId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "quiz.updated",
    targetType: "quiz",
    targetId: quizId,
    metadata: { title, pass_percent },
  });

  revalidateContent(courseId);
}

export async function deleteQuizAction(formData: FormData) {
  const quizId = formData.get("quizId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  if (!quizId) throw new Error("Quiz required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db.from("quizzes").delete().eq("id", quizId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "quiz.deleted",
    targetType: "quiz",
    targetId: quizId,
  });

  revalidateContent(courseId);
}

export async function createQuizQuestionAction(formData: FormData) {
  const quizId = formData.get("quizId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const prompt = (formData.get("prompt") as string)?.trim();
  const options = parseQuizOptions(formData);
  const correctRaw = (formData.get("correctIndex") as string)?.trim();
  const correct_index = correctRaw ? Number(correctRaw) : 0;

  if (!quizId || !prompt) throw new Error("Invalid question");
  if (options.length < 2) throw new Error("At least two options required");
  if (
    !Number.isInteger(correct_index) ||
    correct_index < 0 ||
    correct_index >= options.length
  ) {
    throw new Error("Correct answer index out of range");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: existing } = await db
    .from("quiz_questions")
    .select("order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: false })
    .limit(1);
  const order_index = (existing?.[0]?.order_index ?? -1) + 1;

  const { data, error } = await db
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      prompt,
      options: JSON.parse(JSON.stringify(options)) as Json,
      correct_index,
      order_index,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await safeAudit({
    actorId: userId,
    action: "quiz_question.created",
    targetType: "quiz_question",
    targetId: data.id,
    metadata: { quizId, prompt },
  });

  revalidateContent(courseId);
}

export async function updateQuizQuestionAction(formData: FormData) {
  const questionId = formData.get("questionId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const prompt = (formData.get("prompt") as string)?.trim();
  const options = parseQuizOptions(formData);
  const correctRaw = (formData.get("correctIndex") as string)?.trim();
  const correct_index = correctRaw ? Number(correctRaw) : 0;

  if (!questionId || !prompt) throw new Error("Invalid question");
  if (options.length < 2) throw new Error("At least two options required");
  if (
    !Number.isInteger(correct_index) ||
    correct_index < 0 ||
    correct_index >= options.length
  ) {
    throw new Error("Correct answer index out of range");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("quiz_questions")
    .update({
      prompt,
      options: JSON.parse(JSON.stringify(options)) as Json,
      correct_index,
    })
    .eq("id", questionId);
  if (error) throw new Error(error.message);

  await safeAudit({
    actorId: userId,
    action: "quiz_question.updated",
    targetType: "quiz_question",
    targetId: questionId,
    metadata: { prompt },
  });

  revalidateContent(courseId);
}

export async function deleteQuizQuestionAction(formData: FormData) {
  const questionId = formData.get("questionId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  if (!questionId) throw new Error("Question required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { error } = await db
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "quiz_question.deleted",
    targetType: "quiz_question",
    targetId: questionId,
  });

  revalidateContent(courseId);
}

export async function reorderQuizQuestionAction(formData: FormData) {
  const questionId = formData.get("questionId") as string;
  const quizId = formData.get("quizId") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const direction = formData.get("direction") as "up" | "down";
  if (!questionId || !quizId || !["up", "down"].includes(direction)) {
    throw new Error("Invalid reorder");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  await swapOrder(
    "quiz_questions",
    questionId,
    direction,
    "quiz_id",
    quizId
  );
  await writeAuditLog({
    actorId: userId,
    action: "quiz_question.reordered",
    targetType: "quiz_question",
    targetId: questionId,
    metadata: { direction },
  });
  revalidateContent(courseId);
}
