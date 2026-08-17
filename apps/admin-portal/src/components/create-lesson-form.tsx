"use client";

import { useState } from "react";
import { Field, TextArea, inputClasses } from "@/components/field";
import { MediaUploadField } from "@/components/media-upload-field";
import { createLessonAction } from "@/app/content/actions";
import { Button } from "@scalex/ui";

export function CreateLessonForm({
  moduleId,
  defaultOrder,
}: {
  moduleId: string;
  defaultOrder: number;
}) {
  const [contentType, setContentType] = useState("text");

  return (
    <form
      action={createLessonAction}
      className="mt-3 grid gap-3 rounded-lg border border-line bg-surface/40 p-3"
    >
      <p className="text-sm font-semibold">Add lesson</p>
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" name="title" required placeholder="Lesson title" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            Type
          </label>
          <select
            name="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className={inputClasses}
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="link">External link</option>
          </select>
        </div>
        <Field
          label="Order"
          name="orderIndex"
          type="number"
          min="1"
          defaultValue={String(defaultOrder)}
        />
      </div>
      {(contentType === "video" || contentType === "pdf") && (
        <MediaUploadField
          folder={`lessons/${moduleId}`}
          accept="video/mp4,video/webm,video/quicktime,application/pdf"
          label={contentType === "video" ? "Upload video" : "Upload PDF"}
          name="contentUrl"
          helperText="PDF text is auto-extracted for the AI Mentor on save. MP4/WebM plays in-app for students."
        />
      )}
      {contentType === "link" && (
        <Field
          label="External URL"
          name="contentUrl"
          type="url"
          placeholder="https://..."
          required
        />
      )}
      {contentType === "text" && (
        <input type="hidden" name="contentUrl" value="" />
      )}
      <TextArea
        label="Instructor notes (optional)"
        name="contentText"
        rows={3}
        placeholder="Optional. PDF text is extracted automatically for the AI Mentor when you save."
      />
      <Button type="submit">+ Add lesson</Button>
    </form>
  );
}
