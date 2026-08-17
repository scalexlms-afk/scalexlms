import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getStudents } from "@/lib/data";
import { formatDate, formatStatus } from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { DataTable, ProgressBar, StatusPill } from "@scalex/ui";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type StudentTab =
  | "all"
  | "active"
  | "progress"
  | "completed"
  | "inactive"
  | "suspended";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const sp = await searchParams;
  const tab = (
    [
      "all",
      "active",
      "progress",
      "completed",
      "inactive",
      "suspended",
    ].includes(sp.tab ?? "")
      ? sp.tab
      : "all"
  ) as StudentTab;
  const q = (sp.q ?? "").trim().toLowerCase();

  const students = await getStudents({ userId, role: profile.role });
  const active = students.filter((s) => s.status === "active").length;
  const inactive = students.filter((s) => s.status === "inactive").length;
  const suspended = students.filter((s) => s.status === "suspended").length;
  const premium = students.filter((s) => s.plan === "premium").length;
  const completed = students.filter(
    (s) => (s.enrollment?.completion_percent ?? 0) >= 100
  ).length;
  const inProgress = students.filter((s) => {
    const p = s.enrollment?.completion_percent ?? 0;
    return p > 0 && p < 100;
  }).length;

  let filtered = students;
  if (tab === "active") filtered = filtered.filter((s) => s.status === "active");
  else if (tab === "inactive")
    filtered = filtered.filter((s) => s.status === "inactive");
  else if (tab === "suspended")
    filtered = filtered.filter((s) => s.status === "suspended");
  else if (tab === "completed")
    filtered = filtered.filter(
      (s) => (s.enrollment?.completion_percent ?? 0) >= 100
    );
  else if (tab === "progress")
    filtered = filtered.filter((s) => {
      const p = s.enrollment?.completion_percent ?? 0;
      return p > 0 && p < 100;
    });

  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.current_stage ?? "").toLowerCase().includes(q)
    );
  }

  const tabHref = (id: string) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("tab", id);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/students?${qs}` : "/students";
  };

  return (
    <AdminShell activePath="/students">
      <AdminPageHeader
        eyebrow="All students"
        title="All students"
        description="Manage all students, track their progress and activity."
        primaryAction={{ label: "+ Add Student" }}
        secondaryAction={
          <form method="get" className="flex flex-wrap items-center gap-2">
            {tab !== "all" ? (
              <input type="hidden" name="tab" value={tab} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Search students..."
              className="admin-input max-w-xs"
              aria-label="Search students"
            />
            <button type="submit" className="admin-btn-secondary">
              Search
            </button>
            <button type="button" className="admin-btn-secondary">
              Export
            </button>
          </form>
        }
      />

      <AdminKpiGrid
        items={[
          {
            label: "Total Students",
            value: String(students.length),
          },
          {
            label: "Active Students",
            value: String(active),
            tone: "success",
            hint:
              students.length > 0
                ? `${((active / students.length) * 100).toFixed(1)}% of total`
                : undefined,
          },
          {
            label: "Completed Students",
            value: String(completed),
            hint:
              students.length > 0
                ? `${((completed / students.length) * 100).toFixed(1)}% of total`
                : undefined,
          },
          {
            label: "In Progress",
            value: String(inProgress),
            hint:
              students.length > 0
                ? `${((inProgress / students.length) * 100).toFixed(1)}% of total`
                : undefined,
          },
          {
            label: "Premium",
            value: String(premium),
          },
          {
            label: "Inactive Students",
            value: String(inactive),
            tone: inactive > 0 ? "danger" : "default",
          },
        ]}
      />

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "all",
            label: "All Students",
            count: students.length,
            href: tabHref("all"),
          },
          {
            id: "active",
            label: "Active",
            count: active,
            href: tabHref("active"),
          },
          {
            id: "progress",
            label: "In Progress",
            count: inProgress,
            href: tabHref("progress"),
          },
          {
            id: "completed",
            label: "Completed",
            count: completed,
            href: tabHref("completed"),
          },
          {
            id: "inactive",
            label: "Inactive",
            count: inactive,
            href: tabHref("inactive"),
          },
          {
            id: "suspended",
            label: "Suspended",
            count: suspended,
            href: tabHref("suspended"),
          },
        ]}
      />

      <AdminPanel
        title={
          q || tab !== "all"
            ? `Showing ${filtered.length} of ${students.length}`
            : undefined
        }
      >
        <DataTable
          rows={filtered}
          getRowKey={(row) => row.id}
          emptyMessage="No students match your filters."
          columns={[
            {
              key: "name",
              header: "Student",
              render: (row) => (
                <Link
                  href={`/students/${row.id}`}
                  className="flex items-center gap-3 hover:opacity-90"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-scalex-red/15 text-xs font-bold text-scalex-red">
                    {initials(row.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      {row.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {row.email}
                    </span>
                  </span>
                </Link>
              ),
            },
            {
              key: "stage",
              header: "Stage",
              render: (row) => row.current_stage ?? "—",
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
                    row.status === "active"
                      ? "approved"
                      : row.status === "suspended"
                        ? "pending"
                        : "not_started"
                  }
                />
              ),
            },
            {
              key: "joined",
              header: "Joined On",
              render: (row) => formatDate(row.created_at),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Link
                  href={`/students/${row.id}`}
                  className="text-xs font-semibold text-scalex-red hover:underline"
                >
                  View
                </Link>
              ),
            },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}
