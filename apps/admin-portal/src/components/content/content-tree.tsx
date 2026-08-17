"use client";

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
  return `/content/courses/${courseId}/structure?entity=${entity}&id=${id}`;
}

function isActive(
  selected: { entity: string; id: string } | null,
  entity: ContentEntityType,
  id: string
) {
  return selected?.entity === entity && selected?.id === id;
}

function MilestoneRow({
  href,
  number,
  title,
  meta,
  active,
}: {
  href: string;
  number: number;
  title: string;
  meta: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-xl border-l-2 px-2.5 py-2.5 text-sm transition-colors ${
        active
          ? "border-scalex-red bg-scalex-red/15"
          : "border-transparent hover:bg-surface-3"
      }`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-scalex-red text-white"
            : "bg-surface-3 text-muted"
        }`}
      >
        {number}
      </span>
      <span className="min-w-0">
        <span
          className={`block truncate font-medium ${
            active ? "text-scalex-red" : "text-foreground"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-subtle">{meta}</span>
      </span>
    </Link>
  );
}

function NestedRow({
  href,
  type,
  title,
  active,
}: {
  href: string;
  type: "Module" | "Lesson" | "Task";
  title: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-scalex-red/15 font-medium text-scalex-red"
          : "text-foreground hover:bg-surface-3"
      }`}
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-subtle">
        {type}
      </span>
      <span className="min-w-0 truncate">{title}</span>
    </Link>
  );
}

function ancestorMilestoneId(
  milestones: NonNullable<ContentCourse["milestones"]>,
  selected: { entity: string; id: string } | null
): string | null {
  if (!selected || selected.entity === "course") return null;
  if (selected.entity === "milestone") return selected.id;

  for (const ms of milestones) {
    if (ms.modules?.some((mod) => mod.id === selected.id)) return ms.id;
    if (
      ms.modules?.some((mod) =>
        mod.lessons?.some(
          (lesson) =>
            lesson.id === selected.id ||
            lesson.tasks?.some((task) => task.id === selected.id)
        )
      )
    ) {
      return ms.id;
    }
    if (ms.tasks?.some((task) => task.id === selected.id)) return ms.id;
  }
  return null;
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
  const openId = ancestorMilestoneId(milestones, selected);

  if (milestones.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted">
        No milestones yet. Add your first milestone to start building the course.
      </p>
    );
  }

  return (
    <nav className="space-y-1">
      {milestones.map((ms, index) => {
        const modules = [...(ms.modules ?? [])].sort(
          (a, b) => a.order_index - b.order_index
        );
        const lessonCount = modules.reduce(
          (sum, mod) => sum + (mod.lessons?.length ?? 0),
          0
        );
        const isOpen = openId === ms.id;
        const milestoneActive = isActive(selected, "milestone", ms.id);

        return (
          <div key={ms.id}>
            <MilestoneRow
              href={treeHref(course.id, "milestone", ms.id)}
              number={ms.order_index || index + 1}
              title={ms.title}
              meta={`${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`}
              active={milestoneActive}
            />
            {isOpen ? (
              <div className="ml-5 space-y-0.5 border-l border-line py-1 pl-2">
                {modules.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-subtle">
                    No modules yet — add them on the right.
                  </p>
                ) : (
                  modules.map((mod) => {
                    const lessons = [...(mod.lessons ?? [])].sort(
                      (a, b) => a.order_index - b.order_index
                    );
                    return (
                      <div key={mod.id}>
                        <NestedRow
                          href={treeHref(course.id, "module", mod.id)}
                          type="Module"
                          title={mod.title}
                          active={isActive(selected, "module", mod.id)}
                        />
                        <div className="ml-2 space-y-0.5">
                          {lessons.map((lesson) => (
                            <div key={lesson.id}>
                              <NestedRow
                                href={treeHref(course.id, "lesson", lesson.id)}
                                type="Lesson"
                                title={lesson.title}
                                active={isActive(selected, "lesson", lesson.id)}
                              />
                              {(lesson.tasks ?? []).map((task) => (
                                <div key={task.id} className="ml-2">
                                  <NestedRow
                                    href={treeHref(course.id, "task", task.id)}
                                    type="Task"
                                    title={task.title}
                                    active={isActive(selected, "task", task.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
