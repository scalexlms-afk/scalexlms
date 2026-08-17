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
import { courseCoverSrc } from "@scalex/db";
import { getCoursesSummary } from "@/lib/data";
import { formatStatus } from "@/lib/format";
import { CourseCover, StatusPill } from "@scalex/ui";

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
        {filtered.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted">
            {q || statusFilter !== "all"
              ? "No courses match your filters."
              : "No courses yet. Use New course to start."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((row) => (
              <Link
                key={row.id}
                href={`/content/courses/${row.id}`}
                className="group overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-sm transition hover:border-scalex-red/40"
              >
                <div className="relative aspect-video overflow-hidden bg-surface-3">
                  <CourseCover
                    src={courseCoverSrc(row)}
                    title={row.title}
                  />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-scalex-red">
                      {row.title}
                    </h3>
                    <StatusPill
                      label={formatStatus(row.status)}
                      variant={
                        row.status === "published" ? "approved" : "pending"
                      }
                    />
                  </div>
                  {row.description ? (
                    <p className="line-clamp-2 text-xs text-subtle">
                      {row.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted">
                    {row.lessonCount} lesson{row.lessonCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AdminPanel>
    </>
  );
}
