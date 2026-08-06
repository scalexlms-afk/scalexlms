import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminDetailRail,
  AdminFilterTabs,
  AdminPanel,
} from "@/components/admin-ui";
import { ContentTree } from "@/components/content/content-tree";
import type { ContentEntityType } from "@/components/content/content-tree";
import { ContentEntityEditor } from "@/components/content/entity-editor";
import {
  LessonAiPromptPanel,
  LessonQuizPanel,
  LessonResourcesPanel,
  LessonRightRailForm,
  LessonTasksPanel,
  UnlockRulesPanel,
} from "@/components/content/lesson-structure-panels";
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

const LESSON_TABS = [
  { id: "details", label: "Details" },
  { id: "resources", label: "Resources" },
  { id: "tasks", label: "Tasks" },
  { id: "quiz", label: "Quiz" },
  { id: "ai", label: "AI Prompt" },
  { id: "unlock", label: "Unlock Rules" },
] as const;

type LessonTabId = (typeof LESSON_TABS)[number]["id"];

function isLessonTab(value: string | undefined): value is LessonTabId {
  return LESSON_TABS.some((tab) => tab.id === value);
}

function findLessonContext(
  course: Awaited<ReturnType<typeof getCourseById>>,
  lessonId: string
): {
  lesson: ContentLesson;
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

  const lessonTab: LessonTabId = isLessonTab(sp.tab) ? sp.tab : "details";

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
      title="Hierarchy"
      className="h-fit max-h-[min(80vh,900px)] overflow-y-auto lg:sticky lg:top-6"
    >
      <ContentTree
        course={course}
        selected={{ entity: selectedEntity, id: selectedId }}
      />
    </AdminPanel>
  );

  if (selectedEntity === "lesson") {
    const ctx = findLessonContext(course, selectedId);
    if (!ctx) {
      return (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          {treePanel}
          <AdminPanel>
            <p className="text-sm text-muted">Lesson not found.</p>
          </AdminPanel>
        </div>
      );
    }

    const lessonBase = `/content/courses/${course.id}/structure?entity=lesson&id=${selectedId}`;
    return (
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        {treePanel}

        <div className="min-w-0 space-y-4">
          <AdminFilterTabs
            active={lessonTab}
            tabs={LESSON_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              href:
                tab.id === "details"
                  ? lessonBase
                  : `${lessonBase}&tab=${tab.id}`,
            }))}
          />

          {lessonTab === "details" ? (
            <AdminPanel>
              <ContentEntityEditor
                course={course}
                entity="lesson"
                entityId={selectedId}
                canEdit={canEdit}
                mediaPreviews={mediaPreviews}
              />
            </AdminPanel>
          ) : null}
          {lessonTab === "resources" ? (
            <AdminPanel title="Resources">
              <LessonResourcesPanel
                lesson={ctx.lesson}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
          {lessonTab === "tasks" ? (
            <AdminPanel title="Tasks">
              <LessonTasksPanel
                lesson={ctx.lesson}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
          {lessonTab === "quiz" ? (
            <AdminPanel title="Quiz">
              <LessonQuizPanel
                lesson={ctx.lesson}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
          {lessonTab === "ai" ? (
            <AdminPanel title="AI Prompt">
              <LessonAiPromptPanel
                lesson={ctx.lesson}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
          {lessonTab === "unlock" ? (
            <AdminPanel title="Unlock Rules">
              <UnlockRulesPanel
                unlockRule={ctx.unlockRule}
                milestoneId={ctx.milestoneId}
                milestoneTitle={ctx.milestoneTitle}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
        </div>

        <AdminDetailRail title="Lesson controls">
          <LessonRightRailForm
            lesson={ctx.lesson}
            courseId={course.id}
            canEdit={canEdit}
          />
        </AdminDetailRail>
      </div>
    );
  }

  if (selectedEntity === "milestone") {
    const ms = course.milestones?.find((m) => m.id === selectedId);
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {treePanel}
        <div className="min-w-0 space-y-4">
          <AdminPanel>
            <ContentEntityEditor
              course={course}
              entity={selectedEntity}
              entityId={selectedId}
              canEdit={canEdit}
              mediaPreviews={mediaPreviews}
              hideCourseSettings
            />
          </AdminPanel>
          {ms ? (
            <AdminPanel title="Unlock rule">
              <UnlockRulesPanel
                unlockRule={ms.unlock_rule}
                milestoneId={ms.id}
                milestoneTitle={ms.title}
                courseId={course.id}
                canEdit={canEdit}
              />
            </AdminPanel>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      {treePanel}

      <AdminPanel>
        {selectedEntity === "course" ? (
          <div className="mb-4 rounded-lg border border-line bg-surface-3/40 px-3 py-2 text-sm text-muted">
            Edit course metadata in{" "}
            <Link
              href={`/content/courses/${course.id}/settings`}
              className="font-medium text-scalex-red hover:underline"
            >
              Settings
            </Link>
            . Use the form below to add milestones.
          </div>
        ) : null}
        <ContentEntityEditor
          course={course}
          entity={selectedEntity}
          entityId={selectedId}
          canEdit={canEdit}
          mediaPreviews={mediaPreviews}
          hideCourseSettings
        />
      </AdminPanel>
    </div>
  );
}
