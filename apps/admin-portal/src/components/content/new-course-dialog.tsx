"use client";

import { useState } from "react";
import { Field, TextArea } from "@/components/field";
import { createCourseAction } from "@/app/content/actions";
import { Button } from "@scalex/ui";

export function NewCourseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="admin-btn-primary"
        onClick={() => setOpen(true)}
      >
        + New course
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface-2 p-5 shadow-xl">
            <h2 className="font-display text-lg font-semibold">New course</h2>
            <p className="mt-1 text-sm text-muted">
              Starts as a draft. You can add milestones and lessons next.
            </p>
            <form action={createCourseAction} className="mt-4 space-y-3">
              <input type="hidden" name="status" value="draft" />
              <Field label="Name" name="title" required placeholder="Amazon FBA" />
              <TextArea
                label="Short description"
                name="description"
                rows={3}
                placeholder="What students will learn"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <Button type="submit">Create and open</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
