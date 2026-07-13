import Link from "next/link";
import type { ContentCourse } from "@/lib/data";

export type ContentEntityType =
  | "course"
  | "milestone"
  | "module"
  | "lesson"
  | "task";

function treeHref(
  courseId: string,
  entity: ContentEntityType,
  id: string
) {
  return `/content/courses/${courseId}?entity=${entity}&id=${id}`;
}

function isActive(
  selected: { entity: string; id: string } | null,
  entity: ContentEntityType,
  id: string
) {
  return selected?.entity === entity && selected?.id === id;
}

function NodeLink({
  href,
  label,
  active,
  muted,
}: {
  href: string;
  label: string;
  active: boolean;
  muted?: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-scalex-red/15 font-medium text-scalex-red"
          : "text-foreground hover:bg-surface-3"
      }`}
    >
      {label}
      {muted ? (
        <span className="ml-1 text-xs text-subtle">{muted}</span>
      ) : null}
    </Link>
  );
}

export function ContentTree({
  course,
  selected,
}: {
  course: ContentCourse;
  selected: { entity: string; id: string } | null;
}) {
  const milestones = [...(course.milestones ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <nav className="space-y-1 text-sm">
      <NodeLink
        href={treeHref(course.id, "course", course.id)}
        label={course.title}
        active={isActive(selected, "course", course.id)}
      />

      {milestones.map((ms) => {
        const modules = [...(ms.modules ?? [])].sort(
          (a, b) => a.order_index - b.order_index
        );
        const tasks = ms.tasks ?? [];
        return (
          <div key={ms.id} className="ml-2 border-l border-line pl-2">
            <NodeLink
              href={treeHref(course.id, "milestone", ms.id)}
              label={ms.title}
              active={isActive(selected, "milestone", ms.id)}
              muted={`M${ms.order_index}`}
            />

            {tasks.length > 0 && (
              <div className="ml-2 mt-0.5 space-y-0.5">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  Tasks
                </p>
                {tasks.map((task) => (
                  <NodeLink
                    key={task.id}
                    href={treeHref(course.id, "task", task.id)}
                    label={task.title}
                    active={isActive(selected, "task", task.id)}
                  />
                ))}
              </div>
            )}

            {modules.map((mod) => {
              const lessons = [...(mod.lessons ?? [])].sort(
                (a, b) => a.order_index - b.order_index
              );
              return (
                <div key={mod.id} className="ml-2 mt-0.5 border-l border-line/60 pl-2">
                  <NodeLink
                    href={treeHref(course.id, "module", mod.id)}
                    label={mod.title}
                    active={isActive(selected, "module", mod.id)}
                    muted={`${lessons.length}L`}
                  />
                  <div className="ml-1 space-y-0.5">
                    {lessons.map((lesson) => (
                      <NodeLink
                        key={lesson.id}
                        href={treeHref(course.id, "lesson", lesson.id)}
                        label={lesson.title}
                        active={isActive(selected, "lesson", lesson.id)}
                        muted={lesson.content_type}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
