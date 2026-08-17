import { CreateLessonForm } from "@/components/create-lesson-form";
import { EditLessonForm } from "@/components/edit-lesson-form";
import { Field, TextArea, inputClasses } from "@/components/field";
import type { ContentCourse } from "@/lib/data";
import {
  createMilestoneAction,
  createModuleAction,
  deleteCourseAction,
  deleteMilestoneAction,
  deleteModuleAction,
  deleteTaskAction,
  reorderLessonAction,
  reorderMilestoneAction,
  reorderModuleAction,
  updateCourseAction,
  updateMilestoneAction,
  updateModuleAction,
  updateTaskAction,
} from "@/app/content/actions";
import { Button, StatusPill } from "@scalex/ui";
import type { ContentEntityType } from "./content-tree";
import type { ContentTask } from "@/lib/data";

const FORMAT_OPTIONS = ["image", "excel", "pdf", "link", "text"] as const;

function OrderButtons({
  action,
  hidden,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
}) {
  return (
    <div className="flex gap-2">
      <form action={action}>
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="hidden" name="direction" value="up" />
        <Button type="submit" size="sm" variant="secondary">
          Move up
        </Button>
      </form>
      <form action={action}>
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="hidden" name="direction" value="down" />
        <Button type="submit" size="sm" variant="secondary">
          Move down
        </Button>
      </form>
    </div>
  );
}

export function ContentEntityEditor({
  course,
  entity,
  entityId,
  canEdit,
  mediaPreviews,
  hideCourseSettings = false,
}: {
  course: ContentCourse;
  entity: ContentEntityType;
  entityId: string;
  canEdit: boolean;
  mediaPreviews: Record<string, string>;
  /** When true, skip title/status/delete forms (moved to Settings tab). */
  hideCourseSettings?: boolean;
}) {
  if (entity === "course") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold">{course.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {hideCourseSettings ? "Content" : "Course settings"}
          </p>
        </div>
        {canEdit ? (
          <>
            {!hideCourseSettings ? (
              <form action={updateCourseAction} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="courseId" value={course.id} />
                <Field label="Title" name="title" defaultValue={course.title} required />
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-muted">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={course.status}
                    className={inputClasses}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <TextArea
                    label="Description"
                    name="description"
                    rows={3}
                    defaultValue={course.description ?? ""}
                  />
                </div>
                <Button type="submit">Save course</Button>
              </form>
            ) : (
              <p className="text-sm text-muted">
                Pick a milestone on the left to edit it, or add one from the
                outline.
              </p>
            )}
            {!hideCourseSettings ? (
              <form action={createMilestoneAction} className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-2">
                <input type="hidden" name="courseId" value={course.id} />
                <input
                  type="hidden"
                  name="orderIndex"
                  value={String((course.milestones?.length ?? 0) + 1)}
                />
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium">Add milestone</p>
                </div>
                <Field label="Title" name="title" required />
                <div className="flex items-end">
                  <Button type="submit" size="sm">
                    Add milestone
                  </Button>
                </div>
              </form>
            ) : null}
            {!hideCourseSettings ? (
              <form action={deleteCourseAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Delete course
                </Button>
              </form>
            ) : null}
          </>
        ) : (
          <div className="space-y-2 text-sm text-muted">
            <StatusPill
              label={course.status}
              variant={course.status === "published" ? "approved" : "pending"}
            />
            <p>{course.description || "No description."}</p>
          </div>
        )}
      </div>
    );
  }

  if (entity === "milestone") {
    const ms = course.milestones?.find((m) => m.id === entityId);
    if (!ms) return <p className="text-sm text-muted">Milestone not found.</p>;
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold">{ms.title}</h2>
          <p className="mt-1 text-sm text-muted">
            Milestone · order {ms.order_index}
          </p>
        </div>
        {canEdit ? (
          <>
            <form action={updateMilestoneAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="milestoneId" value={ms.id} />
              <input type="hidden" name="courseId" value={course.id} />
              <Field label="Title" name="title" defaultValue={ms.title} required />
              <div className="flex items-end">
                <Button type="submit">Save</Button>
              </div>
            </form>
            <OrderButtons
              action={reorderMilestoneAction}
              hidden={{ milestoneId: ms.id, courseId: course.id }}
            />
            <form
              action={createModuleAction}
              className="grid gap-3 rounded-xl border border-dashed border-line p-4"
            >
              <input type="hidden" name="milestoneId" value={ms.id} />
              <input
                type="hidden"
                name="orderIndex"
                value={String((ms.modules?.length ?? 0) + 1)}
              />
              <p className="text-sm font-medium">
                {(ms.modules?.length ?? 0) === 0
                  ? "Add a module, then add lessons inside it."
                  : "Add module"}
              </p>
              <Field label="Name" name="title" required placeholder="Legal" />
              <Button type="submit">+ Add module</Button>
            </form>
            <p className="text-sm text-muted">
              Tasks attach to lessons.{" "}
              {(ms.tasks?.length ?? 0) > 0
                ? `${ms.tasks.length} task(s) still linked for unlock gating.`
                : "Add a task on a lesson when students need to submit work."}
            </p>
            <form action={deleteMilestoneAction}>
              <input type="hidden" name="milestoneId" value={ms.id} />
              <Button type="submit" variant="destructive" size="sm">
                Delete milestone
              </Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted">
            {ms.modules?.length ?? 0} modules · {ms.tasks?.length ?? 0}{" "}
            milestone-linked tasks
            {ms.unlock_rule
              ? ` · unlock ${ms.unlock_rule.enabled ? "on" : "off"}`
              : ""}
          </p>
        )}
      </div>
    );
  }

  if (entity === "module") {
    let milestoneId = "";
    let mod: ContentCourse["milestones"][0]["modules"][0] | null = null;
    for (const ms of course.milestones ?? []) {
      const found = ms.modules?.find((m) => m.id === entityId);
      if (found) {
        mod = found;
        milestoneId = ms.id;
        break;
      }
    }
    if (!mod) return <p className="text-sm text-muted">Module not found.</p>;
    const lessons = [...(mod.lessons ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    );
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold">{mod.title}</h2>
          <p className="mt-1 text-sm text-muted">
            Module · {lessons.length} lessons
          </p>
        </div>
        {canEdit ? (
          <>
            <form action={updateModuleAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="moduleId" value={mod.id} />
              <input type="hidden" name="courseId" value={course.id} />
              <Field label="Title" name="title" defaultValue={mod.title} required />
              <div className="flex items-end">
                <Button type="submit">Save</Button>
              </div>
            </form>
            <OrderButtons
              action={reorderModuleAction}
              hidden={{
                moduleId: mod.id,
                milestoneId,
                courseId: course.id,
              }}
            />
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {lessons.length === 0
                  ? "Add lessons inside this module."
                  : "Lessons"}
              </p>
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">{lesson.title}</span>
                  <StatusPill label={lesson.content_type} variant="neutral" />
                  <OrderButtons
                    action={reorderLessonAction}
                    hidden={{
                      lessonId: lesson.id,
                      moduleId: mod!.id,
                      courseId: course.id,
                    }}
                  />
                </div>
              ))}
              <CreateLessonForm
                moduleId={mod.id}
                defaultOrder={(lessons.at(-1)?.order_index ?? 0) + 1}
              />
            </div>
            <form action={deleteModuleAction}>
              <input type="hidden" name="moduleId" value={mod.id} />
              <Button type="submit" variant="destructive" size="sm">
                Delete module
              </Button>
            </form>
          </>
        ) : (
          <ul className="space-y-1 text-sm text-muted">
            {lessons.map((l) => (
              <li key={l.id}>
                {l.title} · {l.content_type}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (entity === "lesson") {
    let moduleId = "";
    let lesson: ContentCourse["milestones"][0]["modules"][0]["lessons"][0] | null =
      null;
    for (const ms of course.milestones ?? []) {
      for (const mod of ms.modules ?? []) {
        const found = mod.lessons?.find((l) => l.id === entityId);
        if (found) {
          lesson = found;
          moduleId = mod.id;
          break;
        }
      }
      if (lesson) break;
    }
    if (!lesson) return <p className="text-sm text-muted">Lesson not found.</p>;
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">{lesson.title}</h2>
          <p className="mt-1 text-sm text-muted">Lesson editor</p>
        </div>
        {canEdit ? (
          <>
            <OrderButtons
              action={reorderLessonAction}
              hidden={{
                lessonId: lesson.id,
                moduleId,
                courseId: course.id,
              }}
            />
            <EditLessonForm
              lesson={lesson}
              moduleId={moduleId}
              previewUrl={mediaPreviews[lesson.id]}
            />
          </>
        ) : (
          <p className="text-sm text-muted">
            {lesson.content_type}
            {lesson.content_text
              ? ` · ${lesson.content_text.slice(0, 120)}…`
              : ""}
          </p>
        )}
      </div>
    );
  }

  // task — search lesson-scoped tasks first, then milestone-linked
  let task: ContentTask | null = null;
  for (const ms of course.milestones ?? []) {
    for (const mod of ms.modules ?? []) {
      const found = mod.lessons
        ?.flatMap((l) => l.tasks ?? [])
        .find((t) => t.id === entityId);
      if (found) {
        task = found;
        break;
      }
    }
    if (task) break;
    const msTask = ms.tasks?.find((t) => t.id === entityId);
    if (msTask) {
      task = msTask;
      break;
    }
  }
  if (!task) return <p className="text-sm text-muted">Task not found.</p>;
  const formats = task.accepted_formats ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">{task.title}</h2>
        <p className="mt-1 text-sm text-muted">
          Lesson task
          {task.is_required ? " · required for unlock" : " · optional"}
        </p>
      </div>
      {canEdit ? (
        <>
          <form action={updateTaskAction} className="space-y-4">
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="courseId" value={course.id} />
            <Field label="Title" name="title" defaultValue={task.title} required />
            <TextArea
              label="Description"
              name="description"
              rows={3}
              defaultValue={task.description ?? ""}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isRequired"
                defaultChecked={task.is_required}
              />
              Required for milestone unlock
            </label>
            <div>
              <label
                htmlFor="reviewMethod"
                className="mb-1.5 block text-sm font-medium text-muted"
              >
                Review method
              </label>
              <select
                id="reviewMethod"
                name="reviewMethod"
                defaultValue={task.review_method || "mentor"}
                className={inputClasses}
              >
                <option value="mentor">Mentor review</option>
                <option value="ai_assist">AI assist + mentor</option>
                <option value="auto">Auto (non-gating)</option>
              </select>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-muted">
                Accepted formats
              </legend>
              <div className="flex flex-wrap gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="acceptedFormats"
                      value={fmt}
                      defaultChecked={formats.includes(fmt)}
                    />
                    {fmt}
                  </label>
                ))}
              </div>
            </fieldset>
            <Button type="submit">Save task</Button>
          </form>
          <form action={deleteTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <Button type="submit" variant="destructive" size="sm">
              Delete task
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-2 text-sm text-muted">
          <p>{task.description || "No description."}</p>
          <p>Formats: {formats.join(", ") || "default"}</p>
          <p>Review: {task.review_method}</p>
        </div>
      )}
    </div>
  );
}
