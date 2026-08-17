import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getCourseById } from "@/lib/data";

export default async function CourseHubLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");

  const course = await getCourseById(courseId);
  if (!course) notFound();

  return <AdminShell activePath="/content">{children}</AdminShell>;
}
