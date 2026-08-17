import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/admin-ui";
import { Field, TextArea, inputClasses } from "@/components/field";
import {
  deleteCourseAction,
  updateCourseAction,
} from "@/app/content/actions";
import { requireAdminProfile } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getCourseById } from "@/lib/data";
import { Button, StatusPill } from "@scalex/ui";

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
    <AdminPanel title="This course · settings">
      {canEdit ? (
        <div className="space-y-6">
          <form action={updateCourseAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="courseId" value={course.id} />
            <Field
              label="Title"
              name="title"
              defaultValue={course.title}
              required
            />
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium text-muted"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={course.status}
                className={inputClasses}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="Description"
                name="description"
                rows={3}
                defaultValue={course.description ?? ""}
              />
            </div>
            <Button type="submit">Save course</Button>
          </form>

          <form action={deleteCourseAction} className="border-t border-line pt-4">
            <input type="hidden" name="courseId" value={course.id} />
            <p className="mb-3 text-sm text-muted">
              Deleting a course removes its milestones, modules, lessons, and
              tasks. This cannot be undone.
            </p>
            <Button type="submit" variant="destructive" size="sm">
              Delete course
            </Button>
          </form>
        </div>
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
