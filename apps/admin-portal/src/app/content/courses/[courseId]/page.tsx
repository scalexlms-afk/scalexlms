import Link from "next/link";
import {
  AdminKpiGrid,
  AdminPanel,
} from "@/components/admin-ui";
import { updateCourseAction } from "@/app/content/actions";
import { canAccess } from "@scalex/db/rbac";
import { requireAdminProfile } from "@/lib/auth";
import { getCourseAnalytics, getCourseById } from "@/lib/data";
import { formatPercent } from "@/lib/format";
import { notFound } from "next/navigation";

function countTree(course: NonNullable<Awaited<ReturnType<typeof getCourseById>>>) {
  let moduleCount = 0;
  let lessonCount = 0;
  let taskCount = 0;
  for (const ms of course.milestones ?? []) {
    taskCount += ms.tasks?.length ?? 0;
    for (const mod of ms.modules ?? []) {
      moduleCount += 1;
      lessonCount += mod.lessons?.length ?? 0;
    }
  }
  return {
    milestoneCount: course.milestones?.length ?? 0,
    moduleCount,
    lessonCount,
    taskCount,
  };
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { profile } = await requireAdminProfile();
  const canEdit = canAccess(profile.role, "course_content", "full");

  const [course, analytics] = await Promise.all([
    getCourseById(courseId),
    getCourseAnalytics(courseId),
  ]);
  if (!course) notFound();

  const counts = countTree(course);

  return (
    <div className="space-y-4">
      <AdminKpiGrid
        items={[
          { label: "Milestones", value: String(counts.milestoneCount) },
          { label: "Modules", value: String(counts.moduleCount) },
          { label: "Lessons", value: String(counts.lessonCount) },
          { label: "Tasks", value: String(counts.taskCount) },
          {
            label: "Enrolled",
            value: String(analytics.enrolledCount),
            tone: "success",
          },
          {
            label: "Avg completion",
            value: formatPercent(analytics.avgCompletion),
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Curriculum">
          <p className="text-sm text-muted">
            {course.description || "No description yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/content/courses/${course.id}/structure`}
              className="admin-btn-primary"
            >
              Edit content
            </Link>
            {canEdit && course.status !== "published" ? (
              <form action={updateCourseAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="title" value={course.title} />
                <input
                  type="hidden"
                  name="description"
                  value={course.description ?? ""}
                />
                <input type="hidden" name="status" value="published" />
                <button type="submit" className="admin-btn-secondary">
                  Publish
                </button>
              </form>
            ) : canEdit ? (
              <Link
                href={`/content/courses/${course.id}/settings`}
                className="admin-btn-secondary"
              >
                Settings
              </Link>
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel title="Enrollment snapshot">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Students enrolled</dt>
              <dd className="font-medium text-foreground">
                {analytics.enrolledCount}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Average completion</dt>
              <dd className="font-medium text-foreground">
                {formatPercent(analytics.avgCompletion)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Task submissions</dt>
              <dd className="font-medium text-foreground">
                {analytics.submissionCount}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <Link
              href={`/content/courses/${course.id}/students`}
              className="text-sm font-medium text-scalex-red hover:underline"
            >
              View students →
            </Link>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
