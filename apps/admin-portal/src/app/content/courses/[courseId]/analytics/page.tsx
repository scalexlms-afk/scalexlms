import { notFound } from "next/navigation";
import { AdminKpiGrid, AdminPanel } from "@/components/admin-ui";
import { getCourseAnalytics, getCourseById } from "@/lib/data";
import { formatPercent } from "@/lib/format";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const analytics = await getCourseAnalytics(courseId);

  return (
    <div className="space-y-4">
      <AdminKpiGrid
        items={[
          {
            label: "Enrolled students",
            value: String(analytics.enrolledCount),
            tone: "success",
          },
          {
            label: "Avg completion",
            value: formatPercent(analytics.avgCompletion),
          },
          {
            label: "Task submissions",
            value: String(analytics.submissionCount),
          },
        ]}
      />

      <AdminPanel title="About these metrics">
        <p className="text-sm text-muted">
          Enrollment and completion come from course enrollments. Submission
          counts include all task submissions for milestones in this course.
          Deeper funnels and lesson-level analytics arrive in later phases.
        </p>
      </AdminPanel>
    </div>
  );
}
