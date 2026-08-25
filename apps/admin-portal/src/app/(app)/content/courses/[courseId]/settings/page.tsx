import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/admin-ui";
import { CourseSettingsForm } from "@/components/content/course-settings-form";
import { requireAdminProfile } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getCourseById } from "@/lib/data";
import { StatusPill } from "@scalex/ui";

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { profile } = await requireAdminProfile();
  const canEdit = canAccess(profile.role, "course_content", "full");

  const course = await getCourseById(courseId);
  if (!course) notFound();

  return (
    <AdminPanel title="Settings">
      {canEdit ? (
        <CourseSettingsForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description,
            status: course.status,
            cover_path: course.cover_path,
            cover_url: course.cover_url,
          }}
        />
      ) : (
        <div className="space-y-2 text-sm text-muted">
          <StatusPill
            label={course.status}
            variant={course.status === "published" ? "approved" : "pending"}
          />
          <p>{course.description || "No description."}</p>
        </div>
      )}
    </AdminPanel>
  );
}
