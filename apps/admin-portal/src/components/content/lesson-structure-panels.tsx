import { Field, TextArea, inputClasses } from "@/components/field";
import { MediaUploadField } from "@/components/media-upload-field";
import type {
  ContentLesson,
  ContentQuiz,
  ContentQuizQuestion,
  ContentTask,
  ContentUnlockRule,
} from "@/lib/data";
import {
  createLessonResourceAction,
  createQuizAction,
  createQuizQuestionAction,
  createTaskAction,
  deleteLessonResourceAction,
  deleteQuizAction,
  deleteQuizQuestionAction,
  deleteTaskAction,
  reorderQuizQuestionAction,
  updateLessonAiPromptAction,
  updateLessonMetaAction,
  updateQuizAction,
  updateQuizQuestionAction,
  updateTaskAction,
  updateUnlockRuleAction,
} from "@/app/content/actions";
import { Button, StatusPill } from "@scalex/ui";

const FORMAT_OPTIONS = ["image", "excel", "pdf", "link", "text"] as const;

const COMPLETION_TYPES = [
  { value: "view_only", label: "View content" },
  { value: "upload_file", label: "Upload file" },
  { value: "quiz_pass", label: "Pass quiz" },
  { value: "mentor_task", label: "Complete mentor task" },
] as const;

export function LessonResourcesPanel({
  lesson,
  courseId,
  canEdit,
}: {
  lesson: ContentLesson;
  courseId: string;
  canEdit: boolean;
}) {
  const resources = [...(lesson.lesson_resources ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <div className="space-y-4">
      {resources.length === 0 ? (
        <p className="text-sm text-muted">No resources yet.</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{resource.title}</p>
                <p className="truncate text-xs text-subtle">
                  {resource.file_name ||
                    resource.file_url ||
                    resource.file_path ||
                    "No file"}
                </p>
              </div>
              {canEdit ? (
                <form action={deleteLessonResourceAction}>
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <input type="hidden" name="courseId" value={courseId} />
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canEdit ? (
        <form
          action={createLessonResourceAction}
          className="grid gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <p className="text-sm font-medium">Add resource</p>
          <Field label="Title" name="title" required />
          <TextArea label="Description" name="description" rows={2} />
          <MediaUploadField
            folder={`lesson-resources/${lesson.id}`}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.mp4"
            label="File upload"
            name="filePath"
            helperText="Stored in lesson-media bucket"
          />
          <Field label="Or external URL" name="fileUrl" />
          <Button type="submit" size="sm">
            Add resource
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function LessonTasksPanel({
  lesson,
  courseId,
  canEdit,
}: {
  lesson: ContentLesson;
  courseId: string;
  canEdit: boolean;
}) {
  const tasks = lesson.tasks ?? [];

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-sm text-muted">No tasks on this lesson yet.</p>
      ) : (
        tasks.map((task) => (
          <TaskEditCard
            key={task.id}
            task={task}
            courseId={courseId}
            canEdit={canEdit}
          />
        ))
      )}

      {canEdit ? (
        <form
          action={createTaskAction}
          className="grid gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="lessonId" value={lesson.id} />
          <p className="text-sm font-medium">Add task</p>
          <Field label="Title" name="title" required />
          <TextArea label="Description" name="description" rows={2} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isRequired" defaultChecked />
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
              defaultValue="mentor"
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
                    defaultChecked={["image", "pdf", "link", "text"].includes(
                      fmt
                    )}
                  />
                  {fmt}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" size="sm">
            Add task
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function LessonQuizPanel({
  lesson,
  courseId,
  canEdit,
}: {
  lesson: ContentLesson;
  courseId: string;
  canEdit: boolean;
}) {
  const quiz = lesson.quizzes?.[0] ?? null;
  const needsQuiz = lesson.completion_type === "quiz_pass";

  return (
    <div className="space-y-4">
      {needsQuiz && !quiz ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Completion is set to &ldquo;Pass quiz&rdquo; but this lesson has no
          quiz yet. Add one below.
        </p>
      ) : null}

      {quiz ? (
        <QuizEditor
          quiz={quiz}
          courseId={courseId}
          canEdit={canEdit}
        />
      ) : (
        <p className="text-sm text-muted">
          No quiz on this lesson yet. One quiz per lesson.
        </p>
      )}

      {canEdit && !quiz ? (
        <form
          action={createQuizAction}
          className="grid gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <p className="text-sm font-medium">Create quiz</p>
          <Field label="Title" name="title" required defaultValue="Lesson quiz" />
          <Field
            label="Pass percent"
            name="passPercent"
            type="number"
            min="0"
            max="100"
            defaultValue="70"
            required
          />
          <Button type="submit" size="sm">
            Create quiz
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function QuizEditor({
  quiz,
  courseId,
  canEdit,
}: {
  quiz: ContentQuiz;
  courseId: string;
  canEdit: boolean;
}) {
  const questions = [...(quiz.questions ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <div className="space-y-4">
      {canEdit ? (
        <form
          action={updateQuizAction}
          className="grid gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <Field
            label="Title"
            name="title"
            required
            defaultValue={quiz.title}
          />
          <Field
            label="Pass percent"
            name="passPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={String(quiz.pass_percent)}
            required
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              Save quiz
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-line px-3 py-2 text-sm">
          <p className="font-medium">{quiz.title}</p>
          <p className="text-muted">Pass at {quiz.pass_percent}%</p>
        </div>
      )}

      {canEdit ? (
        <form action={deleteQuizAction}>
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <Button type="submit" size="sm" variant="destructive">
            Delete quiz
          </Button>
        </form>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Questions</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-muted">No questions yet.</p>
        ) : (
          questions.map((question, index) => (
            <QuizQuestionCard
              key={question.id}
              question={question}
              quizId={quiz.id}
              courseId={courseId}
              canEdit={canEdit}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
            />
          ))
        )}
      </div>

      {canEdit ? (
        <form
          action={createQuizQuestionAction}
          className="grid gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <p className="text-sm font-medium">Add question</p>
          <TextArea label="Prompt" name="prompt" rows={2} required />
          <TextArea
            label="Options (one per line)"
            name="options"
            rows={4}
            required
          />
          <Field
            label="Correct option index (0-based)"
            name="correctIndex"
            type="number"
            min="0"
            defaultValue="0"
            required
          />
          <Button type="submit" size="sm">
            Add question
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function QuizQuestionCard({
  question,
  quizId,
  courseId,
  canEdit,
  canMoveUp,
  canMoveDown,
}: {
  question: ContentQuizQuestion;
  quizId: string;
  courseId: string;
  canEdit: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  if (!canEdit) {
    return (
      <div className="rounded-lg border border-line px-3 py-2 text-sm">
        <p className="font-medium">{question.prompt}</p>
        <ol className="mt-1 list-decimal pl-5 text-muted">
          {question.options.map((opt, i) => (
            <li key={i}>
              {opt}
              {i === question.correct_index ? " ✓" : ""}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-line p-4">
      <form action={updateQuizQuestionAction} className="space-y-3">
        <input type="hidden" name="questionId" value={question.id} />
        <input type="hidden" name="courseId" value={courseId} />
        <TextArea
          label="Prompt"
          name="prompt"
          rows={2}
          required
          defaultValue={question.prompt}
        />
        <TextArea
          label="Options (one per line)"
          name="options"
          rows={4}
          required
          defaultValue={question.options.join("\n")}
        />
        <Field
          label="Correct option index (0-based)"
          name="correctIndex"
          type="number"
          min="0"
          required
          defaultValue={String(question.correct_index)}
        />
        <Button type="submit" size="sm">
          Save question
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {canMoveUp ? (
          <form action={reorderQuizQuestionAction}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="quizId" value={quizId} />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="direction" value="up" />
            <Button type="submit" size="sm" variant="secondary">
              Move up
            </Button>
          </form>
        ) : null}
        {canMoveDown ? (
          <form action={reorderQuizQuestionAction}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="quizId" value={quizId} />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="direction" value="down" />
            <Button type="submit" size="sm" variant="secondary">
              Move down
            </Button>
          </form>
        ) : null}
        <form action={deleteQuizQuestionAction}>
          <input type="hidden" name="questionId" value={question.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <Button type="submit" size="sm" variant="destructive">
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}

function TaskEditCard({
  task,
  courseId,
  canEdit,
}: {
  task: ContentTask;
  courseId: string;
  canEdit: boolean;
}) {
  const formats = task.accepted_formats ?? [];
  if (!canEdit) {
    return (
      <div className="rounded-lg border border-line px-3 py-2 text-sm">
        <p className="font-medium">{task.title}</p>
        <p className="text-muted">{task.description || "No description."}</p>
        <p className="mt-1 text-xs text-subtle">
          {task.is_required ? "Required" : "Optional"} · {task.review_method} ·{" "}
          {formats.join(", ") || "default formats"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-line p-4">
      <form action={updateTaskAction} className="space-y-3">
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="courseId" value={courseId} />
        <Field label="Title" name="title" defaultValue={task.title} required />
        <TextArea
          label="Description"
          name="description"
          rows={2}
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
            htmlFor={`review-${task.id}`}
            className="mb-1.5 block text-sm font-medium text-muted"
          >
            Review method
          </label>
          <select
            id={`review-${task.id}`}
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
        <Button type="submit" size="sm">
          Save task
        </Button>
      </form>
      <form action={deleteTaskAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <Button type="submit" size="sm" variant="destructive">
          Delete task
        </Button>
      </form>
    </div>
  );
}

export function LessonAiPromptPanel({
  lesson,
  courseId,
  canEdit,
}: {
  lesson: ContentLesson;
  courseId: string;
  canEdit: boolean;
}) {
  if (!canEdit) {
    return (
      <p className="whitespace-pre-wrap text-sm text-muted">
        {lesson.ai_prompt || "No AI prompt set."}
      </p>
    );
  }

  return (
    <form action={updateLessonAiPromptAction} className="space-y-3">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <input type="hidden" name="courseId" value={courseId} />
      <TextArea
        label="AI prompt"
        name="aiPrompt"
        rows={8}
        defaultValue={lesson.ai_prompt ?? ""}
      />
      <p className="text-xs text-subtle">
        Grounds the AI Mentor for questions about this lesson.
      </p>
      <Button type="submit">Save AI prompt</Button>
    </form>
  );
}

export function UnlockRulesPanel({
  unlockRule,
  milestoneId,
  milestoneTitle,
  courseId,
  canEdit,
}: {
  unlockRule: ContentUnlockRule | null;
  milestoneId: string;
  milestoneTitle: string;
  courseId: string;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{milestoneTitle}</h3>
        <p className="mt-1 text-sm text-muted">
          Milestone unlock: previous milestone&apos;s required tasks must be
          approved before this milestone opens.
        </p>
      </div>
      {canEdit ? (
        <form action={updateUnlockRuleAction} className="space-y-3">
          <input type="hidden" name="ruleId" value={unlockRule?.id ?? ""} />
          <input type="hidden" name="milestoneId" value={milestoneId} />
          <input type="hidden" name="courseId" value={courseId} />
          <input
            type="hidden"
            name="ruleType"
            value={
              unlockRule?.rule_type || "previous_milestone_required_tasks"
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={unlockRule?.enabled ?? true}
            />
            Unlock rule enabled
          </label>
          <p className="text-xs text-subtle">
            Rule type:{" "}
            <code className="text-foreground">
              {unlockRule?.rule_type || "previous_milestone_required_tasks"}
            </code>
            . Disable to open this milestone without waiting on prior required
            approvals.
          </p>
          <Button type="submit" size="sm">
            Save unlock rule
          </Button>
        </form>
      ) : (
        <div className="space-y-2 text-sm text-muted">
          <StatusPill
            label={unlockRule?.enabled === false ? "Disabled" : "Enabled"}
            variant={unlockRule?.enabled === false ? "pending" : "approved"}
          />
          <p>
            {unlockRule?.rule_type || "previous_milestone_required_tasks"}
          </p>
        </div>
      )}
    </div>
  );
}

export function LessonRightRailForm({
  lesson,
  courseId,
  canEdit,
}: {
  lesson: ContentLesson;
  courseId: string;
  canEdit: boolean;
}) {
  const primaryTask = lesson.tasks?.[0];
  const hasQuiz = (lesson.quizzes?.length ?? 0) > 0;
  const quizPassMissingQuiz =
    lesson.completion_type === "quiz_pass" && !hasQuiz;

  if (!canEdit) {
    return (
      <div className="space-y-4 text-sm">
        <p>
          Completion:{" "}
          <span className="text-foreground">{lesson.completion_type}</span>
        </p>
        {quizPassMissingQuiz ? (
          <p className="text-xs text-amber-200">
            Warning: quiz_pass requires a quiz on this lesson.
          </p>
        ) : null}
        <p>
          Status:{" "}
          <StatusPill
            label={lesson.status}
            variant={lesson.status === "published" ? "approved" : "pending"}
          />
        </p>
        <p>XP: {lesson.xp_points}</p>
        <p>Est. minutes: {lesson.estimated_minutes ?? "—"}</p>
        {primaryTask ? (
          <p className="text-xs text-subtle">
            Review hint from task: {primaryTask.review_method}
            {primaryTask.is_required ? " · required" : ""}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={updateLessonMetaAction} className="space-y-4 text-sm">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <input type="hidden" name="courseId" value={courseId} />

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Completion requirement
        </h3>
        <label className="block space-y-1">
          <span className="text-xs text-subtle">Requirement type</span>
          <select
            name="completionType"
            className={inputClasses}
            defaultValue={lesson.completion_type || "view_only"}
          >
            {COMPLETION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {quizPassMissingQuiz ? (
          <p className="text-xs text-amber-200">
            Soft check: Pass quiz is selected but no quiz exists. Add one in the
            Quiz tab.
          </p>
        ) : null}
      </section>

      <section className="space-y-2 border-t border-line pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Progress metadata
        </h3>
        <Field
          label="XP points"
          name="xpPoints"
          type="number"
          defaultValue={String(lesson.xp_points ?? 0)}
        />
        <Field
          label="Estimated minutes"
          name="estimatedMinutes"
          type="number"
          defaultValue={
            lesson.estimated_minutes != null
              ? String(lesson.estimated_minutes)
              : ""
          }
        />
        <Field
          label="Level"
          name="level"
          defaultValue={lesson.level ?? ""}
        />
        <TextArea
          label="Learning objectives (one per line)"
          name="learningObjectives"
          rows={3}
          defaultValue={(lesson.learning_objectives ?? []).join("\n")}
        />
      </section>

      <section className="space-y-2 border-t border-line pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Review hints
        </h3>
        {primaryTask ? (
          <p className="text-xs text-subtle">
            From task &ldquo;{primaryTask.title}&rdquo;:{" "}
            {primaryTask.review_method}
            {primaryTask.is_required ? " · required for unlock" : " · optional"}
          </p>
        ) : (
          <p className="text-xs text-subtle">
            Add a lesson task to configure mentor review gates.
          </p>
        )}
      </section>

      <section className="space-y-2 border-t border-line pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Published
        </h3>
        <select
          name="status"
          className={inputClasses}
          defaultValue={lesson.status || "draft"}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </section>

      <Button type="submit" size="sm" className="w-full">
        Save lesson controls
      </Button>
    </form>
  );
}
