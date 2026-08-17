import Link from "next/link";
import { NewCourseDialog } from "@/components/content/new-course-dialog";
import {
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getCoursesSummary } from "@/lib/data";
import { formatStatus } from "@/lib/format";
import { DataTable, StatusPill } from "@scalex/ui";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");
  const canEdit = canAccess(profile.role, "course_content", "full");
  const courses = await getCoursesSummary();
  const published = courses.filter((c) => c.status === "published").length;
  const draft = courses.filter((c) => c.status !== "published").length;
  const lessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const tasks = courses.reduce((sum, c) => sum + c.taskCount, 0);

  const statusFilter =
    sp.status === "published" || sp.status === "draft" ? sp.status : "all";
  const q = (sp.q ?? "").trim().toLowerCase();

  let filtered = courses;
  if (statusFilter === "published") {
    filtered = filtered.filter((c) => c.status === "published");
  } else if (statusFilter === "draft") {
    filtered = filtered.filter((c) => c.status !== "published");
  }
  if (q) {
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(q));
  }

  const statusQuery =
    statusFilter === "all" ? "" : `status=${statusFilter}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Academy"
        title="Courses"
        description="Create a course, then add milestones and lessons."
        search={{
          action: "/content",
          placeholder: "Search courses...",
          defaultValue: sp.q ?? "",
          hiddenFields:
            statusFilter !== "all" ? { status: statusFilter } : undefined,
        }}
        secondaryAction={canEdit ? <NewCourseDialog /> : null}
      />

      <AdminKpiGrid
        items={[
          { label: "Total Courses", value: String(courses.length) },
          { label: "Published", value: String(published), tone: "success" },
          { label: "Draft / Other", value: String(draft) },
          { label: "Total Lessons", value: String(lessons) },
          { label: "Total Tasks", value: String(tasks) },
        ]}
      />

      <AdminFilterTabs
        active={statusFilter}
        tabs={[
          {
            id: "all",
            label: "All",
            count: courses.length,
            href: q ? `/content?q=${encodeURIComponent(q)}` : "/content",
          },
          {
            id: "published",
            label: "Published",
            count: published,
            href: q
              ? `/content?status=published&q=${encodeURIComponent(q)}`
              : "/content?status=published",
          },
          {
            id: "draft",
            label: "Draft",
            count: draft,
            href: q
              ? `/content?status=draft&q=${encodeURIComponent(q)}`
              : "/content?status=draft",
          },
        ]}
      />

      <AdminPanel
        title={
          statusQuery || q
            ? `Courses (${filtered.length})`
            : undefined
        }
      >
        <DataTable
          emptyMessage={
            q || statusFilter !== "all"
              ? "No courses match your filters."
              : "No courses yet. Use New course to start."
          }
          getRowKey={(row) => row.id}
          rows={filtered}
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
              key: "lessons",
              header: "Lessons",
              render: (row) => String(row.lessonCount),
            },
            {
              key: "open",
              header: "",
              render: (row) => (
                <Link
                  href={`/content/courses/${row.id}/structure`}
                  className="text-sm font-medium text-scalex-red hover:underline"
                >
                  Open
                </Link>
              ),
            },
          ]}
        />
      </AdminPanel>
    </>
  );
}
