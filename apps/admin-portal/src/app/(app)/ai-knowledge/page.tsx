import { Field, TextArea, inputClasses } from "@/components/field";
import {
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import {
  getAiUsageThisMonth,
  getCoursesOptions,
  getKnowledgeArticles,
  getKnowledgeArticleStats,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { Button, DataTable, StatusPill } from "@scalex/ui";
import {
  createKnowledgeArticleAction,
  deleteKnowledgeArticleAction,
  updateKnowledgeArticleStatusAction,
} from "./actions";

const CATEGORY_LABEL: Record<string, string> = {
  guide: "Guide",
  policy: "Policy",
  tutorial: "Tutorial",
  template: "Template",
  faq: "FAQ",
  case_study: "Case Study",
};

export default async function AiKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "ai_mentor");
  const canEdit = canAccess(profile.role, "course_content", "full");

  const params = await searchParams;
  const categoryFilter = params.category ?? "all";

  const [rows, stats, courses, aiUsage] = await Promise.all([
    getKnowledgeArticles(),
    getKnowledgeArticleStats(),
    getCoursesOptions(),
    getAiUsageThisMonth(),
  ]);

  const filtered =
    categoryFilter === "all"
      ? rows
      : rows.filter((r) => r.category === categoryFilter);

  const countBy = (cat: string) =>
    rows.filter((r) => r.category === cat).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Academy"
        title="AI Knowledge Base"
        description="Manage the content and sources used by the AI Mentor."
        searchPlaceholder="Search knowledge..."
      />

      <AdminKpiGrid
        items={[
          { label: "Total Articles", value: String(stats.total) },
          {
            label: "Published",
            value: String(stats.published),
            hint:
              stats.total > 0
                ? `${((stats.published / stats.total) * 100).toFixed(1)}% of total`
                : undefined,
            tone: "success",
          },
          {
            label: "Last Updated",
            value: stats.lastUpdated
              ? formatDateTime(stats.lastUpdated)
              : "—",
          },
          {
            label: "Knowledge Size",
            value:
              stats.approxBytes > 1024
                ? `${(stats.approxBytes / 1024).toFixed(1)} KB`
                : `${stats.approxBytes} B`,
            hint: "Published article text",
          },
          {
            label: "AI Usage",
            value: String(aiUsage),
            hint: "Student questions this month",
          },
        ]}
      />

      <AdminFilterTabs
        active={categoryFilter}
        tabs={[
          {
            id: "all",
            label: "All Articles",
            count: stats.total,
            href: "/ai-knowledge",
          },
          {
            id: "guide",
            label: "Guides",
            count: countBy("guide"),
            href: "/ai-knowledge?category=guide",
          },
          {
            id: "policy",
            label: "Policies",
            count: countBy("policy"),
            href: "/ai-knowledge?category=policy",
          },
          {
            id: "faq",
            label: "FAQs",
            count: countBy("faq"),
            href: "/ai-knowledge?category=faq",
          },
          {
            id: "case_study",
            label: "Case Studies",
            count: countBy("case_study"),
            href: "/ai-knowledge?category=case_study",
          },
        ]}
      />

      {canEdit ? (
        <AdminPanel title="Add New Article">
          <form
            action={createKnowledgeArticleAction}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Title" name="title" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Category
              </label>
              <select name="category" className={inputClasses} defaultValue="guide">
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Status
              </label>
              <select name="status" className={inputClasses} defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
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
              <TextArea
                label="Body"
                name="body"
                rows={8}
                required
                placeholder="Write the article the AI Mentor should retrieve..."
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save article</Button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      <AdminPanel>
        <DataTable
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyMessage="No knowledge articles yet. Add guides and FAQs to ground the AI Mentor."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (r) => (
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="line-clamp-1 text-xs text-muted">{r.body}</p>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (r) => CATEGORY_LABEL[r.category] ?? r.category,
            },
            {
              key: "course",
              header: "Course",
              render: (r) => r.course?.title ?? "—",
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <StatusPill
                  label={r.status}
                  variant={
                    r.status === "published" ? "approved" : "not_started"
                  }
                />
              ),
            },
            {
              key: "views",
              header: "Views",
              render: (r) => String(r.view_count),
            },
            {
              key: "updated",
              header: "Updated",
              render: (r) => (
                <span className="text-xs text-muted">
                  {formatDateTime(r.updated_at)}
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
                    <form action={updateKnowledgeArticleStatusAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <select
                        name="status"
                        defaultValue={r.status}
                        className="rounded border border-line bg-surface-3 px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                      <Button type="submit" className="ml-1 !px-2 !py-1 text-xs">
                        Set
                      </Button>
                    </form>
                    <form action={deleteKnowledgeArticleAction}>
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
    </>
  );
}
