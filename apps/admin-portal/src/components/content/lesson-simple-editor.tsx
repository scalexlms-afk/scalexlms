import { EditLessonForm } from "@/components/edit-lesson-form";
import {
  LessonAiPromptPanel,
  LessonQuizPanel,
  LessonResourcesPanel,
  LessonRightRailForm,
  LessonTasksPanel,
} from "@/components/content/lesson-structure-panels";
import type { ContentLesson } from "@/lib/data";

export function LessonSimpleEditor({
  lesson,
  moduleId,
  courseId,
  canEdit,
  previewUrl,
}: {
  lesson: ContentLesson;
  moduleId: string;
  courseId: string;
  canEdit: boolean;
  previewUrl?: string | null;
}) {
  const hasTask = (lesson.tasks?.length ?? 0) > 0;
  const hasQuiz = (lesson.quizzes?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h3 className="font-display text-base font-semibold">
            1. What students watch or read
          </h3>
          <p className="text-sm text-muted">
            Drop a video or PDF, or write a short lesson.
          </p>
        </div>
        {canEdit ? (
          <EditLessonForm
            lesson={lesson}
            moduleId={moduleId}
            previewUrl={previewUrl}
            bare
          />
        ) : (
          <p className="text-sm text-muted">{lesson.content_type}</p>
        )}
        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            Extra files
          </summary>
          <div className="mt-3">
            <LessonResourcesPanel
              lesson={lesson}
              courseId={courseId}
              canEdit={canEdit}
            />
          </div>
        </details>
      </section>

      <section className="space-y-3 border-t border-line pt-5">
        <div>
          <h3 className="font-display text-base font-semibold">
            2. What they must do
          </h3>
          <p className="text-sm text-muted">
            Optional. Add a task students submit, or a quiz they must pass.
          </p>
        </div>
        {hasTask || canEdit ? (
          <details open={hasTask} className="rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-medium">
              {hasTask ? "Task" : "Add a task"}
            </summary>
            <div className="mt-3">
              <LessonTasksPanel
                lesson={lesson}
                courseId={courseId}
                canEdit={canEdit}
              />
            </div>
          </details>
        ) : null}
        {hasQuiz || canEdit ? (
          <details open={hasQuiz} className="rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-medium">
              {hasQuiz ? "Quiz" : "Add a quiz"}
            </summary>
            <div className="mt-3">
              <LessonQuizPanel
                lesson={lesson}
                courseId={courseId}
                canEdit={canEdit}
              />
            </div>
          </details>
        ) : null}
      </section>

      <section className="space-y-3 border-t border-line pt-5">
        <div>
          <h3 className="font-display text-base font-semibold">
            3. When it is ready
          </h3>
          <p className="text-sm text-muted">
            Publish when the lesson should appear for students.
          </p>
        </div>
        <LessonRightRailForm
          lesson={lesson}
          courseId={courseId}
          canEdit={canEdit}
          simple
        />
        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            Advanced · AI prompt
          </summary>
          <div className="mt-3">
            <LessonAiPromptPanel
              lesson={lesson}
              courseId={courseId}
              canEdit={canEdit}
            />
          </div>
        </details>
      </section>
    </div>
  );
}
