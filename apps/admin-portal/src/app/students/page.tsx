import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getStudents } from "@/lib/data";
import { formatDate, formatPercent, formatStatus } from "@/lib/format";
import { DataTable, ProgressBar, StatusPill } from "@scalex/ui";

export default async function StudentsPage() {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const students = await getStudents({ userId, role: profile.role });

  return (
    <AdminShell activePath="/students">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Student Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Students
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            {profile.role === "mentor"
              ? "Your assigned students and their progress."
              : "Academy roster with plan, stage, and completion."}
          </p>
        </div>

        <DataTable
          rows={students}
          getRowKey={(row) => row.id}
          emptyMessage="No students match your access scope."
          columns={[
            {
              key: "name",
              header: "Student",
              render: (row) => (
                <Link
                  href={`/students/${row.id}`}
                  className="font-medium text-scalex-red hover:underline"
                >
                  {row.name}
                </Link>
              ),
            },
            {
              key: "email",
              header: "Email",
              render: (row) => (
                <span className="text-text-secondary-dark">{row.email}</span>
              ),
            },
            {
              key: "plan",
              header: "Plan",
              render: (row) => formatStatus(row.plan ?? "—"),
            },
            {
              key: "stage",
              header: "Stage",
              render: (row) => row.current_stage ?? "—",
            },
            {
              key: "mentor",
              header: "Mentor",
              render: (row) => row.mentor?.name ?? "Unassigned",
            },
            {
              key: "progress",
              header: "Progress",
              render: (row) => (
                <div className="min-w-[120px]">
                  <ProgressBar
                    value={row.enrollment?.completion_percent ?? 0}
                    showPercent
                  />
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
                    row.status === "active" ? "approved" : "not_started"
                  }
                />
              ),
            },
            {
              key: "joined",
              header: "Joined",
              render: (row) => formatDate(row.created_at),
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
