"use client";

import { useRef, useState } from "react";
import { createClient } from "@scalex/db/client";
import { LESSON_MEDIA_BUCKET } from "@scalex/db/media";

type MediaUploadFieldProps = {
  folder: string;
  accept: string;
  label: string;
  name: string;
  defaultUrl?: string | null;
  helperText?: string;
  dropHint?: string;
};

export function MediaUploadField({
  folder,
  accept,
  label,
  name,
  defaultUrl,
  helperText,
  dropHint = "MP4, WebM, or PDF",
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(8);

    try {
      const supabase = createClient();
      const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      let tick = 0;
      tick = window.setInterval(() => {
        setProgress((current) => (current < 90 ? current + 8 : current));
      }, 200);
      try {
        const { error: uploadError } = await supabase.storage
          .from(LESSON_MEDIA_BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });
        setProgress(100);
        if (uploadError) throw new Error(uploadError.message);
      } finally {
        window.clearInterval(tick);
      }

      setUrl(path);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-muted">{label}</p>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFileChange(event.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex min-h-[160px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver
            ? "border-scalex-red bg-scalex-red/10"
            : "border-line bg-surface-3/40 hover:border-scalex-red/60 hover:bg-surface-3"
        }`}
      >
        <span className="text-sm font-medium text-foreground">
          {uploading
            ? "Uploading…"
            : fileName
              ? fileName
              : url
                ? "File attached — drop a new file to replace"
                : "Drop a video or PDF, or click to browse"}
        </span>
        <span className="mt-1 text-xs text-subtle">
          {dropHint}
        </span>
      </button>
      {uploading || progress > 0 ? (
        <div className="mt-3" aria-live="polite">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>{uploading ? "Uploading…" : progress >= 100 ? "Uploaded" : "Upload"}</span>
            <span>{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-scalex-red transition-[width] duration-200"
              style={{ width: `${Math.min(100, Math.max(uploading ? 8 : 0, progress))}%` }}
            />
          </div>
        </div>
      ) : null}
      {helperText ? (
        <p className="mt-1 text-xs text-subtle">{helperText}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-accent-danger">{error}</p> : null}
    </div>
  );
}
