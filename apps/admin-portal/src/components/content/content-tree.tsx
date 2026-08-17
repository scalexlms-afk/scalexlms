"use client";

import { useEffect, useState } from "react";
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
  const selectedMilestoneId = (() => {
    if (selected?.entity === "milestone") return selected.id;
    for (const ms of milestones) {
      if (ms.modules?.some((mod) => mod.id === selected?.id)) return ms.id;
      if (
        ms.modules?.some((mod) =>
          mod.lessons?.some(
            (lesson) =>
              lesson.id === selected?.id ||
              lesson.tasks?.some((task) => task.id === selected?.id)
          )
        )
      ) {
        return ms.id;
      }
      if (ms.tasks?.some((task) => task.id === selected?.id)) return ms.id;
    }
    return milestones[0]?.id;
  })();

  const [openId, setOpenId] = useState<string | null>(selectedMilestoneId ?? null);

  useEffect(() => {
    if (selectedMilestoneId) setOpenId(selectedMilestoneId);
  }, [selectedMilestoneId]);

  if (milestones.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted">
        No milestones yet. Add your first milestone to start building the course.
      </p>
    );
  }

  return (
    <nav className="space-y-1 text-sm">
      {milestones.map((ms) => {
        const modules = [...(ms.modules ?? [])].sort(
          (a, b) => a.order_index - b.order_index
        );
        const lessonCount = modules.reduce(
          (sum, mod) => sum + (mod.lessons?.length ?? 0),
          0
        );
        const isOpen = openId === ms.id;
        return (
          <div key={ms.id} className="rounded-lg">
            <div className="flex items-stretch">
              <button
                type="button"
                aria-expanded={isOpen}
                className="px-1 text-subtle hover:text-foreground"
                onClick={() => setOpenId(isOpen ? null : ms.id)}
              >
                {isOpen ? "▾" : "▸"}
              </button>
              <div className="min-w-0 flex-1">
                <NodeLink
                  href={treeHref(course.id, "milestone", ms.id)}
                  label={`Milestone ${ms.order_index} · ${ms.title}`}
                  active={isActive(selected, "milestone", ms.id)}
                  muted={`${lessonCount} lessons`}
                />
              </div>
            </div>
            {isOpen ? (
              <div className="ml-5 space-y-1 border-l border-line pl-2">
                {modules.map((mod) => {
                  const lessons = [...(mod.lessons ?? [])].sort(
                    (a, b) => a.order_index - b.order_index
                  );
                  return (
                    <div key={mod.id}>
                      <NodeLink
                        href={treeHref(course.id, "module", mod.id)}
                        label={`Module · ${mod.title}`}
                        active={isActive(selected, "module", mod.id)}
                      />
                      <div className="ml-2 space-y-0.5">
                        {lessons.map((lesson) => (
                          <div key={lesson.id}>
                            <NodeLink
                              href={treeHref(course.id, "lesson", lesson.id)}
                              label={`Lesson · ${lesson.title}`}
                              active={isActive(selected, "lesson", lesson.id)}
                            />
                            {(lesson.tasks ?? []).map((task) => (
                              <div key={task.id} className="ml-2">
                                <NodeLink
                                  href={treeHref(course.id, "task", task.id)}
                                  label={`Task · ${task.title}`}
                                  active={isActive(selected, "task", task.id)}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
