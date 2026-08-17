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
};

export function MediaUploadField({
  folder,
  accept,
  label,
  name,
  defaultUrl,
  helperText,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from(LESSON_MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw new Error(uploadError.message);

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
          MP4, WebM, or PDF
        </span>
      </button>
      {helperText ? (
        <p className="mt-1 text-xs text-subtle">{helperText}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-accent-danger">{error}</p> : null}
    </div>
  );
}
