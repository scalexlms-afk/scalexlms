import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/admin-ui";
import { getCourseById, getCourseStudents } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { DataTable, ProgressBar, StatusPill } from "@scalex/ui";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const students = await getCourseStudents(courseId);

  return (
    <AdminPanel title="Enrolled students">
      <DataTable
        emptyMessage="No students enrolled in this course yet."
        getRowKey={(row) => row.id}
        rows={students}
        columns={[
          {
            key: "name",
            header: "Student",
            render: (row) =>
              row.student ? (
                <Link
                  href={`/students/${row.student.id}`}
                  className="font-medium text-foreground hover:text-scalex-red"
                >
                  <span className="block">{row.student.name}</span>
                  <span className="block text-xs font-normal text-muted">
                    {row.student.email}
                  </span>
                </Link>
              ) : (
                <span className="text-muted">Unknown student</span>
              ),
          },
          {
            key: "email",
            header: "Email",
            render: (row) => (
              <span className="text-sm text-muted">
                {row.student?.email ?? "—"}
              </span>
            ),
          },
          {
            key: "plan",
            header: "Plan",
            render: (row) => (
              <StatusPill
                label={planLabel(row.plan, true)}
                variant={planPillVariant(row.plan)}
              />
            ),
          },
          {
            key: "progress",
            header: "Progress",
            render: (row) => (
              <div className="min-w-[120px]">
                <ProgressBar value={row.completion_percent} showPercent />
              </div>
            ),
          },
          {
            key: "enrolled",
            header: "Enrolled",
            render: (row) => formatDate(row.enrolled_at),
          },
        ]}
      />
    </AdminPanel>
  );
}
