import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Field, TextArea, inputClasses } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getCoursesSummary } from "@/lib/data";
import { formatStatus } from "@/lib/format";
import { createCourseAction } from "./actions";
import { Button, Card, DataTable, StatusPill } from "@scalex/ui";

export default async function ContentPage() {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");
  const canEdit = canAccess(profile.role, "course_content", "full");
  const courses = await getCoursesSummary();

  return (
    <AdminShell activePath="/content">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Content Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Courses
          </h1>
          <p className="mt-1 text-muted">
            {canEdit
              ? "Open a course to edit the curriculum tree, lessons, and gating tasks."
              : "Read-only view of the academy curriculum."}
          </p>
        </div>

        {canEdit && (
          <Card>
            <h2 className="font-display text-lg font-semibold">New course</h2>
            <form
              action={createCourseAction}
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <Field label="Title" name="title" required />
              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-muted"
                >
                  Status
                </label>
                <select id="status" name="status" className={inputClasses}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <TextArea label="Description" name="description" rows={2} />
              </div>
              <Button type="submit">Create course</Button>
            </form>
          </Card>
        )}

        <Card>
          <DataTable
            emptyMessage="No courses yet."
            getRowKey={(row) => row.id}
            rows={courses}
            columns={[
              {
                key: "title",
                header: "Course",
                render: (row) => (
                  <div>
                    <Link
                      href={`/content/courses/${row.id}`}
                      className="font-medium text-foreground hover:text-scalex-red"
                    >
                      {row.title}
                    </Link>
                    {row.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-subtle">
                        {row.description}
                      </p>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusPill
                    label={formatStatus(row.status)}
                    variant={
                      row.status === "published" ? "approved" : "pending"
                    }
                  />
                ),
              },
              {
                key: "milestones",
                header: "Milestones",
                render: (row) => String(row.milestoneCount),
              },
              {
                key: "modules",
                header: "Modules",
                render: (row) => String(row.moduleCount),
              },
              {
                key: "lessons",
                header: "Lessons",
                render: (row) => String(row.lessonCount),
              },
              {
                key: "open",
                header: "",
                render: (row) => (
                  <Link
                    href={`/content/courses/${row.id}`}
                    className="text-sm font-medium text-scalex-red hover:underline"
                  >
                    Open
                  </Link>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AdminShell>
  );
}
