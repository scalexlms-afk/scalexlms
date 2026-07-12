"use client";

import { useState } from "react";
import { Field, TextArea, inputClasses } from "@/components/field";
import { MediaUploadField } from "@/components/media-upload-field";
import { MediaPreview } from "@/components/media-preview";
import {
  deleteLessonAction,
  reextractLessonPdfAction,
  updateLessonAction,
} from "@/app/content/actions";
import { Button } from "@scalex/ui";

type Lesson = {
  id: string;
  title: string;
  content_type: string;
  content_url: string | null;
  content_text: string | null;
  order_index: number;
};

export function EditLessonForm({
  lesson,
  moduleId,
  previewUrl,
}: {
  lesson: Lesson;
  moduleId: string;
  previewUrl?: string | null;
}) {
  const [contentType, setContentType] = useState(lesson.content_type);

  return (
    <div className="mt-2 rounded-lg border border-line bg-surface/30 p-3">
      <form action={updateLessonAction} className="grid gap-3">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" name="title" defaultValue={lesson.title} required />
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
            defaultValue={String(lesson.order_index)}
          />
        </div>
        {(contentType === "video" || contentType === "pdf") && (
          <MediaUploadField
            folder={`lessons/${moduleId}`}
            accept="video/mp4,video/webm,video/quicktime,application/pdf"
            label={contentType === "video" ? "Video file" : "PDF file"}
            name="contentUrl"
            defaultUrl={lesson.content_url}
          />
        )}
        {(contentType === "video" || contentType === "pdf") &&
          previewUrl &&
          lesson.content_url && (
            <MediaPreview url={previewUrl} kind={contentType} />
          )}
        {contentType === "link" && (
          <Field
            label="External URL"
            name="contentUrl"
            type="url"
            defaultValue={lesson.content_url ?? ""}
          />
        )}
        {contentType === "text" && (
          <input type="hidden" name="contentUrl" value="" />
        )}
        <TextArea
          label="Instructor notes (optional)"
          name="contentText"
          rows={3}
          defaultValue={lesson.content_text ?? ""}
          placeholder="Optional notes prepended to auto-extracted PDF text for the AI Mentor."
        />
        {contentType === "pdf" && lesson.content_url && (
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              formAction={reextractLessonPdfAction}
              className="!px-3 !py-2 text-xs"
            >
              Re-extract PDF for AI
            </Button>
            {lesson.content_text && (
              <span className="text-xs text-accent-green">
                AI text indexed ({lesson.content_text.length.toLocaleString()} chars)
              </span>
            )}
          </div>
        )}
        <Button type="submit" className="!px-3 !py-2 text-xs">
          Update lesson
        </Button>
      </form>
      <form action={deleteLessonAction} className="mt-2">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <Button
          type="submit"
          variant="secondary"
          className="!bg-accent-danger/20 !text-accent-danger !px-3 !py-2 text-xs"
        >
          Delete lesson
        </Button>
      </form>
    </div>
  );
}
