import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminPanel } from "@/components/admin-ui";
import { AddMilestoneForm } from "@/components/content/add-milestone-form";
import { ContentTree } from "@/components/content/content-tree";
import type { ContentEntityType } from "@/components/content/content-tree";
import { ContentEntityEditor } from "@/components/content/entity-editor";
import { LessonSimpleEditor } from "@/components/content/lesson-simple-editor";
import { UnlockRulesPanel } from "@/components/content/lesson-structure-panels";
import { requireAdminProfile } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import type { ContentLesson, ContentUnlockRule } from "@/lib/data";
import { getCourseById } from "@/lib/data";
import { signMediaUrls } from "@/lib/secure-media";

const ENTITIES = new Set([
  "course",
  "milestone",
  "module",
  "lesson",
  "task",
]);

function findLessonContext(
  course: Awaited<ReturnType<typeof getCourseById>>,
  lessonId: string
): {
  lesson: ContentLesson;
  moduleId: string;
  milestoneId: string;
  milestoneTitle: string;
  unlockRule: ContentUnlockRule | null;
} | null {
  if (!course) return null;
  for (const ms of course.milestones ?? []) {
    for (const mod of ms.modules ?? []) {
      const lesson = mod.lessons?.find((l) => l.id === lessonId);
      if (lesson) {
        return {
          lesson,
          moduleId: mod.id,
          milestoneId: ms.id,
          milestoneTitle: ms.title,
          unlockRule: ms.unlock_rule,
        };
      }
    }
  }
  return null;
}

export default async function CourseStructurePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ entity?: string; id?: string; tab?: string }>;
}) {
  const { courseId } = await params;
  const sp = await searchParams;
  const { profile } = await requireAdminProfile();
  const canEdit = canAccess(profile.role, "course_content", "full");

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const entity = (
    ENTITIES.has(sp.entity ?? "") ? sp.entity : "course"
  ) as ContentEntityType;
  const entityId =
    entity === "course"
      ? course.id
      : sp.id && sp.id.length > 0
        ? sp.id
        : course.id;
  const selectedEntity: ContentEntityType =
    entity !== "course" && entityId === course.id ? "course" : entity;
  const selectedId = selectedEntity === "course" ? course.id : entityId;
  const milestoneCount = course.milestones?.length ?? 0;

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

  const treePanel = (
    <AdminPanel
      title="Course outline"
      description="Click a step to edit it on the right."
      padded={false}
      className="flex h-fit max-h-[min(80vh,900px)] flex-col overflow-hidden lg:sticky lg:top-6"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ContentTree
          course={course}
          selected={{ entity: selectedEntity, id: selectedId }}
        />
      </div>
      {canEdit && milestoneCount > 0 ? (
        <div className="shrink-0 border-t border-line bg-surface-2 p-3">
          <AddMilestoneForm
            courseId={course.id}
            orderIndex={milestoneCount + 1}
          />
        </div>
      ) : null}
    </AdminPanel>
  );

  const layout = (editor: ReactNode) => (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      {treePanel}
      <AdminPanel>{editor}</AdminPanel>
    </div>
  );

  if (selectedEntity === "lesson") {
    const ctx = findLessonContext(course, selectedId);
    if (!ctx) {
      return layout(<p className="text-sm text-muted">Lesson not found.</p>);
    }
    return layout(
      <LessonSimpleEditor
        lesson={ctx.lesson}
        moduleId={ctx.moduleId}
        courseId={course.id}
        canEdit={canEdit}
        previewUrl={mediaPreviews[ctx.lesson.id]}
      />
    );
  }

  if (selectedEntity === "milestone") {
    const ms = course.milestones?.find((m) => m.id === selectedId);
    return layout(
      <div className="space-y-6">
        <ContentEntityEditor
          course={course}
          entity={selectedEntity}
          entityId={selectedId}
          canEdit={canEdit}
          mediaPreviews={mediaPreviews}
          hideCourseSettings
        />
        {ms ? (
          <div className="border-t border-line pt-5">
            <UnlockRulesPanel
              unlockRule={ms.unlock_rule}
              milestoneId={ms.id}
              milestoneTitle={ms.title}
              courseId={course.id}
              canEdit={canEdit}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (selectedEntity === "course" && milestoneCount === 0) {
    return layout(
      canEdit ? (
        <AddMilestoneForm
          courseId={course.id}
          orderIndex={1}
          prominent
        />
      ) : (
        <p className="text-sm text-muted">This course has no milestones yet.</p>
      )
    );
  }

  return layout(
    selectedEntity === "course" ? (
      <p className="text-sm text-muted">
        Select a milestone in the outline to edit it. Course name and publish
        live in{" "}
        <Link
          href={`/content/courses/${course.id}/settings`}
          className="font-medium text-scalex-red hover:underline"
        >
          Settings
        </Link>
        .
      </p>
    ) : (
      <ContentEntityEditor
        course={course}
        entity={selectedEntity}
        entityId={selectedId}
        canEdit={canEdit}
        mediaPreviews={mediaPreviews}
        hideCourseSettings
      />
    )
  );
}
