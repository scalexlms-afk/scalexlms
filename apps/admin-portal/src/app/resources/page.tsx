import { AdminShell } from "@/components/admin-shell";
import { Field, TextArea, inputClasses } from "@/components/field";
import { ResourceUploadField } from "@/components/resource-upload-field";
import {
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import {
  getAcademyResources,
  getAcademyResourceStats,
  getCoursesOptions,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { Button, DataTable, StatusPill } from "@scalex/ui";
import {
  createAcademyResourceAction,
  deleteAcademyResourceAction,
  updateAcademyResourceVisibilityAction,
} from "./actions";

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ visibility?: string }>;
}) {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");
  const canEdit = canAccess(profile.role, "course_content", "full");

  const params = await searchParams;
  const visibilityFilter = params.visibility ?? "all";

  const [rows, stats, courses] = await Promise.all([
    getAcademyResources(),
    getAcademyResourceStats(),
    getCoursesOptions(),
  ]);

  const filtered =
    visibilityFilter === "all"
      ? rows
      : rows.filter((r) => r.visibility === visibilityFilter);

  return (
    <AdminShell activePath="/resources">
      <AdminPageHeader
        eyebrow="Academy"
        title="Resources"
        description="Manage and organize learning resources for students."
        searchPlaceholder="Search resources..."
      />

      <AdminKpiGrid
        items={[
          { label: "Total Resources", value: String(stats.total) },
          {
            label: "Storage Used",
            value: formatBytes(stats.storageBytes),
            hint: "Uploaded files",
          },
          {
            label: "Downloads",
            value: String(stats.downloads),
            hint: "All time",
          },
          { label: "Categories", value: String(stats.categories) },
          {
            label: "Public Resources",
            value: String(stats.publicCount),
            tone: "success",
          },
        ]}
      />

      <AdminFilterTabs
        active={visibilityFilter}
        tabs={[
          { id: "all", label: "All Resources", count: stats.total, href: "/resources" },
          {
            id: "public",
            label: "Public",
            count: stats.publicCount,
            href: "/resources?visibility=public",
          },
          {
            id: "private",
            label: "Private",
            count: stats.privateCount,
            href: "/resources?visibility=private",
          },
          {
            id: "draft",
            label: "Draft",
            count: stats.draftCount,
            href: "/resources?visibility=draft",
          },
        ]}
      />

      {canEdit ? (
        <AdminPanel title="Upload Resource">
          <form
            action={createAcademyResourceAction}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Title" name="title" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Category
              </label>
              <select name="category" className={inputClasses} defaultValue="Templates">
                {[
                  "Templates",
                  "Tools",
                  "Guides",
                  "Worksheets",
                  "Videos",
                  "Checklists",
                  "Links",
                  "SOPs",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Visibility
              </label>
              <select name="visibility" className={inputClasses} defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Course (optional)
              </label>
              <select name="courseId" className={inputClasses} defaultValue="">
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <TextArea label="Description" name="description" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-muted">File</p>
              <ResourceUploadField />
            </div>
            <Field
              label="External link (optional)"
              name="fileUrl"
              placeholder="https://..."
            />
            <div className="sm:col-span-2">
              <Button type="submit">Save resource</Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel>
        <DataTable
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyMessage="No resources yet. Upload a file or add a link."
          columns={[
            {
              key: "title",
              header: "Resource",
              render: (r) => (
                <div>
                  <p className="font-medium">{r.title}</p>
                  {r.description ? (
                    <p className="line-clamp-1 text-xs text-muted">
                      {r.description}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (r) => r.category,
            },
            {
              key: "course",
              header: "Course",
              render: (r) => r.course?.title ?? "—",
            },
            {
              key: "type",
              header: "Type",
              render: (r) => r.file_type.toUpperCase(),
            },
            {
              key: "size",
              header: "Size",
              render: (r) =>
                r.file_size_bytes != null
                  ? formatBytes(r.file_size_bytes)
                  : "—",
            },
            {
              key: "downloads",
              header: "Downloads",
              render: (r) => String(r.download_count),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <StatusPill
                  label={r.visibility}
                  variant={
                    r.visibility === "public"
                      ? "approved"
                      : r.visibility === "draft"
                        ? "not_started"
                        : "neutral"
                  }
                />
              ),
            },
            {
              key: "updated",
              header: "Updated",
              render: (r) => (
                <span className="text-xs text-muted">
                  {formatDate(r.updated_at)}
                  {r.updater?.name ? ` · ${r.updater.name}` : ""}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (r) =>
                canEdit ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={updateAcademyResourceVisibilityAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <select
                        name="visibility"
                        defaultValue={r.visibility}
                        className="rounded border border-line bg-surface-3 px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                      <Button type="submit" className="ml-1 !px-2 !py-1 text-xs">
                        Set
                      </Button>
                    </form>
                    <form action={deleteAcademyResourceAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        className="!px-2 !py-1 text-xs"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                ) : (
                  "—"
                ),
            },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}
