import {
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
  AdminDetailRail,
  AdminEmptyState,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data";
import { formatDate, formatStatus } from "@/lib/format";
import { Button, DataTable, StatusPill } from "@scalex/ui";
import { updateUserRoleAction } from "@/app/(app)/settings/actions";
import Link from "next/link";

type TeamTab = "all" | "admins" | "mentors" | "sales";

export default async function TeamMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; member?: string; q?: string }>;
}) {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "system_settings", "full");

  const params = await searchParams;
  const tab: TeamTab =
    params.tab === "admins" ||
    params.tab === "mentors" ||
    params.tab === "sales"
      ? params.tab
      : "all";

  const users = await getAdminUsers();
  const active = users.filter((u) => u.status === "active").length;
  const admins = users.filter(
    (u) => u.role === "super_admin" || u.role === "instructor"
  );
  const mentors = users.filter((u) => u.role === "mentor");
  const sales = users.filter((u) => u.role === "sales");
  const inactive = users.length - active;

  const visible =
    tab === "admins"
      ? admins
      : tab === "mentors"
        ? mentors
        : tab === "sales"
          ? sales
          : users;
  const q = (params.q ?? "").trim().toLowerCase();
  const searched = q
    ? visible.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.role.replace(/_/g, " ").includes(q)
      )
    : visible;

  const selected =
    searched.find((u) => u.id === params.member) ?? searched[0] ?? null;

  return (
    <>
      <AdminPageHeader
        eyebrow="System"
        title="Team Members"
        description="Invite and manage staff across academy operations."
        search={{
          action: "/team",
          placeholder: "Search by name, email or role...",
          defaultValue: params.q ?? "",
          hiddenFields: tab !== "all" ? { tab } : undefined,
        }}
      />

      <AdminKpiGrid
        items={[
          { label: "Total Members", value: String(users.length) },
          {
            label: "Active Members",
            value: String(active),
            tone: "success",
            hint:
              users.length > 0
                ? `${((active / users.length) * 100).toFixed(1)}% of team`
                : undefined,
          },
          { label: "Administrators", value: String(admins.length) },
          { label: "Mentors", value: String(mentors.length) },
          { label: "Sales", value: String(sales.length) },
          {
            label: "Inactive",
            value: String(inactive),
            tone: inactive > 0 ? "danger" : "default",
          },
        ]}
      />

      <AdminSplit
        main={
          <div className="space-y-4">
            <AdminFilterTabs
              active={tab}
              tabs={[
                {
                  id: "all",
                  label: "All",
                  count: users.length,
                  href: "/team?tab=all",
                },
                {
                  id: "admins",
                  label: "Administrators",
                  count: admins.length,
                  href: "/team?tab=admins",
                },
                {
                  id: "mentors",
                  label: "Mentors",
                  count: mentors.length,
                  href: "/team?tab=mentors",
                },
                {
                  id: "sales",
                  label: "Sales",
                  count: sales.length,
                  href: "/team?tab=sales",
                },
              ]}
            />
            <AdminPanel>
              <DataTable
                rows={searched}
                getRowKey={(row) => row.id}
                emptyMessage={
                  q ? "No team members match your search." : "No team members found."
                }
                columns={[
                  {
                    key: "member",
                    header: "Member",
                    render: (row) => (
                      <Link
                        href={`/team?tab=${tab}&member=${row.id}`}
                        className={
                          selected?.id === row.id
                            ? "font-semibold text-scalex-red"
                            : "hover:text-scalex-red"
                        }
                      >
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted">{row.email}</p>
                      </Link>
                    ),
                  },
                  {
                    key: "role",
                    header: "Role",
                    render: (row) => (
                      <form
                        action={updateUserRoleAction}
                        className="flex gap-2"
                      >
                        <input type="hidden" name="userId" value={row.id} />
                        <select
                          name="role"
                          defaultValue={row.role}
                          className="rounded-lg border border-line bg-surface-3 px-2 py-1 text-xs"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="instructor">Instructor</option>
                          <option value="mentor">Mentor</option>
                          <option value="sales">Sales</option>
                        </select>
                        <Button type="submit" className="!px-2 !py-1 text-xs">
                          Save
                        </Button>
                      </form>
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
            </AdminPanel>
          </div>
        }
        rail={
          <div className="space-y-4">
            <AdminDetailRail title="Member detail">
              {selected ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-display text-base font-semibold">
                      {selected.name}
                    </p>
                    <p className="text-xs text-muted">{selected.email}</p>
                  </div>
                  <StatusPill
                    label={formatStatus(selected.status)}
                    variant={
                      selected.status === "active" ? "approved" : "not_started"
                    }
                  />
                  <p className="text-xs text-subtle">
                    Role: {selected.role.replace(/_/g, " ")} · Joined{" "}
                    {formatDate(selected.created_at)}
                  </p>
                  <p className="text-xs text-subtle">
                    Invite flow is stubbed — create staff users in Supabase Auth
                    then assign roles here.
                  </p>
                </div>
              ) : (
                <AdminEmptyState
                  title="Select a member"
                  hint="Choose someone from the list to see role details."
                />
              )}
            </AdminDetailRail>
            <AdminPanel title="Quick Actions">
              <div className="space-y-2">
                <p className="text-sm text-muted">
                  Create staff accounts in Supabase Auth, then assign roles here.
                </p>
                <Link href="/roles" className="admin-btn-secondary w-full">
                  Manage Roles
                </Link>
              </div>
            </AdminPanel>
          </div>
        }
      />
    </>
  );
}
