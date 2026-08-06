import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPageHeader } from "@/components/admin-ui";
import { CourseHubTabs } from "@/components/content/course-hub-tabs";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getCourseById } from "@/lib/data";
import { formatStatus } from "@/lib/format";
import { StatusPill } from "@scalex/ui";

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

  return (
    <AdminShell activePath="/content">
      <AdminPageHeader
        eyebrow="Academy"
        title={course.title}
        description="Course hub — overview, curriculum structure, students, and settings."
        secondaryAction={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              label={formatStatus(course.status)}
              variant={course.status === "published" ? "approved" : "pending"}
            />
            <Link href="/content" className="admin-btn-secondary">
              ← All courses
            </Link>
          </div>
        }
      />

      <CourseHubTabs courseId={course.id} />

      {children}
    </AdminShell>
  );
}
