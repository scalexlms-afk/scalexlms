"use client";

import { Field, TextArea } from "@/components/field";
import { MediaUploadField } from "@/components/media-upload-field";
import { MediaPreview } from "@/components/media-preview";
import {
  deleteSessionAction,
  updateSessionAction,
} from "@/app/sessions/actions";
import { Button } from "@scalex/ui";

type SessionEditorProps = {
  session: {
    id: string;
    title: string;
    description: string | null;
    meeting_url: string | null;
    recording_url: string | null;
  };
  recordingPreviewUrl?: string | null;
};

export function SessionEditor({ session, recordingPreviewUrl }: SessionEditorProps) {
  return (
    <div className="mt-4 border-t border-line pt-4">
      <form action={updateSessionAction} className="grid gap-3">
        <input type="hidden" name="sessionId" value={session.id} />
        <Field label="Title" name="title" defaultValue={session.title} required />
        <TextArea
          label="Description"
          name="description"
          rows={2}
          defaultValue={session.description ?? ""}
        />
        <Field
          label="Meeting URL"
          name="meeting_url"
          type="url"
          defaultValue={session.meeting_url ?? ""}
        />
        <MediaUploadField
          folder={`recordings/${session.id}`}
          accept="video/mp4,video/webm,video/quicktime"
          label="Upload class recording"
          name="recording_url"
          defaultUrl={session.recording_url}
          helperText="Upload MP4/WebM — students can watch inside the app."
        />
        {recordingPreviewUrl && session.recording_url && (
          <MediaPreview
            url={recordingPreviewUrl}
            kind="video"
            label="Current recording"
          />
        )}
        <Button type="submit" className="!px-3 !py-2 text-xs">
          Save changes
        </Button>
      </form>
      <form action={deleteSessionAction} className="mt-2">
        <input type="hidden" name="sessionId" value={session.id} />
        <Button
          type="submit"
          variant="secondary"
          className="!bg-accent-danger/20 !text-accent-danger !px-3 !py-2 text-xs"
        >
          Delete session
        </Button>
      </form>
    </div>
  );
}
