"use client";

import { useState } from "react";
import { Field, TextArea } from "@/components/field";
import {
  deleteCourseAction,
  updateCourseAction,
} from "@/app/content/actions";
import { Button } from "@scalex/ui";

type CourseStatus = "draft" | "published" | "archived";

export function CourseSettingsForm({
  course,
}: {
  course: {
    id: string;
    title: string;
    description: string | null;
    status: string;
  };
}) {
  const initialStatus: CourseStatus =
    course.status === "published" || course.status === "archived"
      ? course.status
      : "draft";
  const [status, setStatus] = useState<CourseStatus>(initialStatus);
  const published = status === "published";

  return (
    <div className="space-y-8">
      <form action={updateCourseAction} className="space-y-5">
        <input type="hidden" name="courseId" value={course.id} />
        <input type="hidden" name="status" value={status} />
        <Field
          label="Course name"
          name="title"
          defaultValue={course.title}
          required
        />
        <TextArea
          label="Description"
          name="description"
          rows={4}
          defaultValue={course.description ?? ""}
          placeholder="What students will learn"
        />

        <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="text-xs text-muted">
              Students can see this course when it is on.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() =>
              setStatus((current) =>
                current === "published" ? "draft" : "published"
              )
            }
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              published ? "bg-scalex-red" : "bg-surface-3"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                published ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            Advanced
          </summary>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">
              Archive hides the course from new enrollments without deleting it.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={status === "archived"}
                onChange={(event) =>
                  setStatus(event.target.checked ? "archived" : "draft")
                }
              />
              Archive this course
            </label>
          </div>
        </details>

        <Button type="submit">Save</Button>
      </form>

      <div className="border-t border-line pt-5">
        <h3 className="text-sm font-semibold text-accent-danger">Danger zone</h3>
        <p className="mt-1 text-sm text-muted">
          Deletes this course and all of its milestones, lessons, and tasks.
          This cannot be undone.
        </p>
        <form
          action={deleteCourseAction}
          className="mt-3"
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Delete this course and all of its content? This cannot be undone."
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="courseId" value={course.id} />
          <Button type="submit" variant="destructive" size="sm">
            Delete course
          </Button>
        </form>
      </div>
    </div>
  );
}
