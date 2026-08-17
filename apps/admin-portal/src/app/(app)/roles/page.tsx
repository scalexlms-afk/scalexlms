import {
  AdminDetailRail,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data";
import Link from "next/link";
import { StatusPill } from "@scalex/ui";

const MATRIX: {
  module: string;
  superAdmin: string;
  instructor: string;
  mentor: string;
  sales: string;
}[] = [
  {
    module: "Dashboard & Analytics",
    superAdmin: "Full",
    instructor: "Full",
    mentor: "Assigned",
    sales: "Own pipeline",
  },
  {
    module: "Student Management",
    superAdmin: "Full",
    instructor: "Partial",
    mentor: "Assigned",
    sales: "Leads only",
  },
  {
    module: "Course & Content",
    superAdmin: "Full",
    instructor: "Full",
    mentor: "View",
    sales: "None",
  },
  {
    module: "Task Reviews",
    superAdmin: "Full",
    instructor: "Partial",
    mentor: "Full (assigned)",
    sales: "None",
  },
  {
    module: "Community / Sessions",
    superAdmin: "Full",
    instructor: "Partial",
    mentor: "Partial",
    sales: "None",
  },
  {
    module: "CRM",
    superAdmin: "Full",
    instructor: "None",
    mentor: "None",
    sales: "Full",
  },
  {
    module: "Finance",
    superAdmin: "Full",
    instructor: "None",
    mentor: "None",
    sales: "Partial",
  },
  {
    module: "System Settings & Roles",
    superAdmin: "Full",
    instructor: "None",
    mentor: "None",
    sales: "None",
  },
];

function cellTone(value: string) {
  if (value === "Full" || value.startsWith("Full")) return "text-accent-green";
  if (value === "None") return "text-subtle";
  return "text-foreground";
}

export default async function RolesPage() {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "system_settings", "full");

  const users = await getAdminUsers();
  const byRole = {
    super_admin: users.filter((u) => u.role === "super_admin").length,
    instructor: users.filter((u) => u.role === "instructor").length,
    mentor: users.filter((u) => u.role === "mentor").length,
    sales: users.filter((u) => u.role === "sales").length,
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="System"
        title="Roles & Permissions"
        description="Staff access matrix for ScaleX Management OS. Students never see this portal."
        primaryAction={{ label: "Manage Team", href: "/team" }}
      />

      <AdminKpiGrid
        items={[
          {
            label: "Super Admins",
            value: String(byRole.super_admin),
          },
          { label: "Instructors", value: String(byRole.instructor) },
          { label: "Mentors", value: String(byRole.mentor) },
          { label: "Sales", value: String(byRole.sales) },
        ]}
      />

      <AdminSplit
        main={
          <AdminPanel title="Permission matrix">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                    <th className="px-3 py-3 font-semibold">Module</th>
                    <th className="px-3 py-3 font-semibold">Super Admin</th>
                    <th className="px-3 py-3 font-semibold">Instructor</th>
                    <th className="px-3 py-3 font-semibold">Mentor</th>
                    <th className="px-3 py-3 font-semibold">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row) => (
                    <tr key={row.module} className="border-b border-line/70">
                      <td className="px-3 py-3 font-medium">{row.module}</td>
                      <td className={`px-3 py-3 ${cellTone(row.superAdmin)}`}>
                        {row.superAdmin}
                      </td>
                      <td className={`px-3 py-3 ${cellTone(row.instructor)}`}>
                        {row.instructor}
                      </td>
                      <td className={`px-3 py-3 ${cellTone(row.mentor)}`}>
                        {row.mentor}
                      </td>
                      <td className={`px-3 py-3 ${cellTone(row.sales)}`}>
                        {row.sales}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted">
              Photo mockups show additional staff labels (Support Agent, Finance
              Manager, Content). Enforcement still uses the live five-role matrix
              until a dedicated RBAC migration.{" "}
              <Link
                href="/team"
                className="font-semibold text-scalex-red hover:underline"
              >
                Assign roles on Team Members
              </Link>
              .
            </p>
          </AdminPanel>
        }
        rail={
          <AdminDetailRail title="Your access">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Current role</span>
                <StatusPill
                  label={profile.role.replace(/_/g, " ")}
                  variant="neutral"
                />
              </div>
              <p className="text-xs text-subtle">
                System Settings, Team, and Roles require Super Admin. Other
                modules follow `canAccess` in `@scalex/db/rbac`.
              </p>
              <Link
                href="/settings?section=audit"
                className="inline-flex text-sm font-semibold text-scalex-red hover:underline"
              >
                View audit logs →
              </Link>
            </div>
          </AdminDetailRail>
        }
      />
    </>
  );
}
