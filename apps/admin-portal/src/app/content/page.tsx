import { AdminShell } from "@/components/admin-shell";
import { CreateLessonForm } from "@/components/create-lesson-form";
import { EditLessonForm } from "@/components/edit-lesson-form";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { canAccess } from "@scalex/db/rbac";
import { getContentTree } from "@/lib/data";
import { signMediaUrls } from "@/lib/secure-media";
import { formatStatus } from "@/lib/format";
import {
  createCourseAction,
  createMilestoneAction,
  createModuleAction,
  createTaskAction,
  deleteCourseAction,
  deleteMilestoneAction,
  deleteModuleAction,
  deleteTaskAction,
  updateCourseAction,
} from "./actions";
import { Button, Card, StatusPill } from "@scalex/ui";

export default async function ContentPage() {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "course_content");
  const canEdit = canAccess(profile.role, "course_content", "full");
  const canDelete = canEdit;

  const courses = await getContentTree();

  // Mentors (and any partial-access role) get a read-only view of the curriculum.
  if (!canEdit) {
    return (
      <AdminShell activePath="/content">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Content Management
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Course Content
            </h1>
            <p className="mt-1 text-muted">
              You have read-only access to the curriculum. Editing is limited to
              Instructors and Super Admins.
            </p>
          </div>

          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">
                  {course.title}
                </h2>
                <StatusPill
                  label={formatStatus(course.status)}
                  variant={course.status === "published" ? "approved" : "pending"}
                />
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {(course.milestones ?? [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((milestone) => (
                    <li key={milestone.id}>
                      <span className="font-medium text-foreground">
                        M{milestone.order_index}: {milestone.title}
                      </span>
                      <ul className="mt-1 space-y-1 pl-4">
                        {(milestone.modules ?? [])
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((mod) => (
                            <li key={mod.id}>
                              {mod.title}
                              <span className="text-subtle">
                                {" "}
                                · {mod.lessons?.length ?? 0} lessons
                              </span>
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            </Card>
          ))}
        </div>
      </AdminShell>
    );
  }

  const mediaLessons = courses.flatMap((course) =>
    (course.milestones ?? []).flatMap((milestone) =>
      (milestone.modules ?? []).flatMap((mod) =>
        (mod.lessons ?? [])
          .filter(
            (lesson) =>
              (lesson.content_type === "video" ||
                lesson.content_type === "pdf") &&
              lesson.content_url
          )
          .map((lesson) => ({ id: lesson.id, url: lesson.content_url }))
      )
    )
  );
  const mediaPreviews = await signMediaUrls(mediaLessons);

  return (
    <AdminShell activePath="/content">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Content Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Course Content
          </h1>
          <p className="mt-1 text-muted">
            Upload videos and PDFs, edit lessons, and manage your full curriculum.
            PDF lessons auto-index their text for the AI Mentor.
          </p>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">New Course</h2>
          <form
            action={createCourseAction}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Title" name="title" required />
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium text-muted"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <TextArea label="Description" name="description" rows={2} />
            </div>
            <Button type="submit">Create course</Button>
          </form>
        </Card>

        {courses.map((course) => (
          <Card key={course.id}>
            <form action={updateCourseAction} className="space-y-3">
              <input type="hidden" name="courseId" value={course.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Course title"
                    name="title"
                    defaultValue={course.title}
                    required
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={course.status}
                      className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm"
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
                      rows={2}
                      defaultValue={course.description ?? ""}
                    />
                  </div>
                </div>
                <StatusPill
                  label={formatStatus(course.status)}
                  variant={
                    course.status === "published" ? "approved" : "pending"
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="!px-3 !py-2 text-xs">
                  Save course
                </Button>
                {canDelete && (
                  <Button
                    formAction={deleteCourseAction}
                    type="submit"
                    variant="secondary"
                    className="!bg-accent-danger/20 !text-accent-danger !px-3 !py-2 text-xs"
                  >
                    Delete course
                  </Button>
                )}
              </div>
            </form>

            <form
              action={createMilestoneAction}
              className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4"
            >
              <input type="hidden" name="courseId" value={course.id} />
              <Field
                label="New Milestone"
                name="title"
                placeholder="Milestone title"
                className="min-w-[180px]"
              />
              <Field
                label="Order"
                name="orderIndex"
                type="number"
                min="1"
                defaultValue={String((course.milestones?.length ?? 0) + 1)}
                className="w-20"
              />
              <Button type="submit" className="!py-2.5">
                Add milestone
              </Button>
            </form>

            {(course.milestones ?? [])
              .sort((a, b) => a.order_index - b.order_index)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className="mt-4 rounded-xl border border-line bg-surface-3 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">
                      M{milestone.order_index}: {milestone.title}
                    </h3>
                    {canDelete && (
                      <form action={deleteMilestoneAction}>
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <Button
                          type="submit"
                          variant="secondary"
                          className="!bg-accent-danger/20 !text-accent-danger !px-2 !py-1 text-xs"
                        >
                          Delete milestone
                        </Button>
                      </form>
                    )}
                  </div>

                  <form
                    action={createModuleAction}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="milestoneId" value={milestone.id} />
                    <Field
                      label="New Module"
                      name="title"
                      placeholder="Module title"
                      className="min-w-[160px]"
                    />
                    <Field
                      label="Order"
                      name="orderIndex"
                      type="number"
                      min="1"
                      defaultValue={String((milestone.modules?.length ?? 0) + 1)}
                      className="w-20"
                    />
                    <Button type="submit" className="!px-2 !py-1.5 text-xs">
                      Add module
                    </Button>
                  </form>

                  <form
                    action={createTaskAction}
                    className="mt-2 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="milestoneId" value={milestone.id} />
                    <Field
                      label="Gating Task"
                      name="title"
                      placeholder="Task title"
                      className="min-w-[160px]"
                    />
                    <Field
                      label="Description"
                      name="description"
                      placeholder="Optional"
                      className="min-w-[160px]"
                    />
                    <Button type="submit" className="!px-2 !py-1.5 text-xs">
                      Add task
                    </Button>
                  </form>

                  {(Array.isArray(milestone.tasks)
                    ? milestone.tasks
                    : milestone.tasks
                      ? [milestone.tasks]
                      : []
                  ).map((task) => (
                    <div
                      key={task.id}
                      className="mt-2 flex items-center justify-between rounded border border-line px-2 py-1 text-xs"
                    >
                      <span>Task: {task.title}</span>
                      {canDelete && (
                        <form action={deleteTaskAction}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <button
                            type="submit"
                            className="text-accent-danger hover:underline"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  ))}

                  {(milestone.modules ?? [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((mod) => (
                      <div key={mod.id} className="mt-3 border-t border-line pt-3 pl-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted">
                            Module: {mod.title}
                          </p>
                          {canDelete && (
                            <form action={deleteModuleAction}>
                              <input type="hidden" name="moduleId" value={mod.id} />
                              <button
                                type="submit"
                                className="text-xs text-accent-danger hover:underline"
                              >
                                Delete module
                              </button>
                            </form>
                          )}
                        </div>

                        {(mod.lessons ?? [])
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((lesson) => (
                            <EditLessonForm
                              key={lesson.id}
                              lesson={lesson}
                              moduleId={mod.id}
                              previewUrl={mediaPreviews[lesson.id] ?? null}
                            />
                          ))}

                        <CreateLessonForm
                          moduleId={mod.id}
                          defaultOrder={(mod.lessons?.length ?? 0) + 1}
                        />
                      </div>
                    ))}
                </div>
              ))}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
