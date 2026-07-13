import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ContentTree } from "@/components/content/content-tree";
import {
  ContentEntityEditor,
} from "@/components/content/entity-editor";
import type { ContentEntityType } from "@/components/content/content-tree";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getCourseById } from "@/lib/data";
import { signMediaUrls } from "@/lib/secure-media";
import { Card } from "@scalex/ui";

const ENTITIES = new Set([
  "course",
  "milestone",
  "module",
  "lesson",
  "task",
]);

export default async function CourseContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ entity?: string; id?: string }>;
}) {
  const { courseId } = await params;
  const sp = await searchParams;
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");
  const canEdit = canAccess(profile.role, "course_content", "full");

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const entity = (
    ENTITIES.has(sp.entity ?? "") ? sp.entity : "course"
  ) as ContentEntityType;
  const entityId =
    entity === "course" ? course.id : sp.id && sp.id.length > 0 ? sp.id : course.id;
  const selectedEntity: ContentEntityType =
    entity !== "course" && entityId === course.id ? "course" : entity;
  const selectedId =
    selectedEntity === "course" ? course.id : entityId;

  const mediaLessons = (course.milestones ?? []).flatMap((milestone) =>
    (milestone.modules ?? []).flatMap((mod) =>
      (mod.lessons ?? [])
        .filter(
          (lesson) =>
            (lesson.content_type === "video" || lesson.content_type === "pdf") &&
            lesson.content_url
        )
        .map((lesson) => ({ id: lesson.id, url: lesson.content_url }))
    )
  );
  const mediaPreviews = await signMediaUrls(mediaLessons);

  return (
    <AdminShell activePath="/content">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/content"
              className="text-xs text-muted hover:text-scalex-red"
            >
              ← All courses
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
              {course.title}
            </h1>
            <p className="mt-1 text-muted">
              {canEdit
                ? "Select an item in the tree to edit."
                : "Read-only curriculum tree."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit max-h-[min(80vh,900px)] overflow-y-auto lg:sticky lg:top-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Hierarchy
            </p>
            <ContentTree
              course={course}
              selected={{ entity: selectedEntity, id: selectedId }}
            />
          </Card>

          <Card>
            <ContentEntityEditor
              course={course}
              entity={selectedEntity}
              entityId={selectedId}
              canEdit={canEdit}
              mediaPreviews={mediaPreviews}
            />
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
