import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getCourseExists } from "@/lib/data";

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

  const exists = await getCourseExists(courseId);
  if (!exists) notFound();

  return children;
}
