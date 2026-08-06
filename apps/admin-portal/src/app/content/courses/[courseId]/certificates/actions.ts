"use server";

import { revalidatePath } from "next/cache";
import {
  CERTIFICATES_BUCKET,
  MEDIA_SIGNED_URL_TTL,
  writeAuditLog,
} from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  certificateStoragePath,
  generateCertificatePdf,
} from "@/lib/certificate-pdf";

function revalidateCertificates(courseId: string) {
  revalidatePath(`/content/courses/${courseId}/certificates`);
  revalidatePath(`/content/courses/${courseId}`, "layout");
}

async function uploadCertificatePdf(input: {
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}): Promise<string> {
  const db = getServiceDb();
  const pdfBytes = await generateCertificatePdf({
    studentName: input.studentName,
    courseTitle: input.courseTitle,
    issuedAt: input.issuedAt,
  });
  const path = certificateStoragePath(input.studentId, input.courseId);
  const { error } = await db.storage
    .from(CERTIFICATES_BUCKET)
    .upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw new Error(error.message);
  return path;
}

async function resolveCourseTitle(
  courseId: string
): Promise<string> {
  const db = getServiceDb();
  const { data } = await db
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();
  return data?.title ?? "Course";
}

async function resolveStudentName(studentId: string): Promise<string> {
  const db = getServiceDb();
  const { data } = await db
    .from("profiles")
    .select("name")
    .eq("id", studentId)
    .maybeSingle();
  return data?.name ?? "Student";
}

export async function issueCertificateAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const studentId = formData.get("studentId") as string;
  if (!courseId || !studentId) throw new Error("Course and student required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: enrollment, error: enrollErr } = await db
    .from("enrollments")
    .select("id, completion_percent")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (enrollErr) throw new Error(enrollErr.message);
  if (!enrollment) throw new Error("Student is not enrolled in this course");
  if (Number(enrollment.completion_percent ?? 0) < 100) {
    throw new Error("Student must be at 100% completion to issue a certificate");
  }

  const issuedAt = new Date().toISOString();
  const [courseTitle, studentName] = await Promise.all([
    resolveCourseTitle(courseId),
    resolveStudentName(studentId),
  ]);

  const pdfPath = await uploadCertificatePdf({
    studentId,
    courseId,
    studentName,
    courseTitle,
    issuedAt,
  });

  const { data, error } = await db
    .from("certificates")
    .upsert(
      {
        course_id: courseId,
        student_id: studentId,
        pdf_url: pdfPath,
        issued_at: issuedAt,
      },
      { onConflict: "student_id,course_id" }
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "certificate.issued",
    targetType: "certificate",
    targetId: data.id,
    metadata: { courseId, studentId, pdfPath },
  });

  revalidateCertificates(courseId);
}

export async function issueEligibleCertificatesAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  if (!courseId) throw new Error("Course required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: enrollments, error: enrollErr } = await db
    .from("enrollments")
    .select("student_id, completion_percent")
    .eq("course_id", courseId)
    .gte("completion_percent", 100);

  if (enrollErr) throw new Error(enrollErr.message);

  const eligibleIds = (enrollments ?? [])
    .map((e) => e.student_id as string)
    .filter(Boolean);

  if (eligibleIds.length === 0) {
    revalidateCertificates(courseId);
    return;
  }

  const courseTitle = await resolveCourseTitle(courseId);
  const { data: profiles } = await db
    .from("profiles")
    .select("id, name")
    .in("id", eligibleIds);
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id as string, (p.name as string) ?? "Student"])
  );

  const issuedAt = new Date().toISOString();
  const rows: {
    course_id: string;
    student_id: string;
    pdf_url: string;
    issued_at: string;
  }[] = [];

  for (const studentId of eligibleIds) {
    const pdfPath = await uploadCertificatePdf({
      studentId,
      courseId,
      studentName: nameById.get(studentId) ?? "Student",
      courseTitle,
      issuedAt,
    });
    rows.push({
      course_id: courseId,
      student_id: studentId,
      pdf_url: pdfPath,
      issued_at: issuedAt,
    });
  }

  const { error } = await db
    .from("certificates")
    .upsert(rows, { onConflict: "student_id,course_id" });

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "certificate.bulk_issued",
    targetType: "course",
    targetId: courseId,
    metadata: { count: eligibleIds.length },
  });

  revalidateCertificates(courseId);
}

export async function regenerateCertificatePdfAction(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const studentId = formData.get("studentId") as string;
  if (!courseId || !studentId) throw new Error("Course and student required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "course_content", "full");

  const db = getServiceDb();
  const { data: cert, error: certErr } = await db
    .from("certificates")
    .select("id, issued_at")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (certErr) throw new Error(certErr.message);
  if (!cert) throw new Error("Certificate not found");

  const [courseTitle, studentName] = await Promise.all([
    resolveCourseTitle(courseId),
    resolveStudentName(studentId),
  ]);

  const pdfPath = await uploadCertificatePdf({
    studentId,
    courseId,
    studentName,
    courseTitle,
    issuedAt: cert.issued_at,
  });

  const { error } = await db
    .from("certificates")
    .update({ pdf_url: pdfPath })
    .eq("id", cert.id);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "certificate.pdf_regenerated",
    targetType: "certificate",
    targetId: cert.id,
    metadata: { courseId, studentId, pdfPath },
  });

  revalidateCertificates(courseId);
}

/** Sign a certificate storage path for download (admin). */
export async function getCertificateDownloadUrlAction(
  pdfUrlOrPath: string
): Promise<string | null> {
  await requireAdminProfile();
  if (!pdfUrlOrPath) return null;

  if (pdfUrlOrPath.includes("://")) {
    return pdfUrlOrPath;
  }

  const db = getServiceDb();
  const { data, error } = await db.storage
    .from(CERTIFICATES_BUCKET)
    .createSignedUrl(pdfUrlOrPath, MEDIA_SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
