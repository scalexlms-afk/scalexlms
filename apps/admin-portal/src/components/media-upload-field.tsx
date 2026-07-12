"use client";

import { useRef, useState } from "react";
import { createClient } from "@scalex/db/client";
import { LESSON_MEDIA_BUCKET } from "@scalex/db/media";
import { Button } from "@scalex/ui";

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
      <label className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          className="!px-3 !py-2 text-xs"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : url ? "Replace file" : "Upload file"}
        </Button>
        {fileName && (
          <span className="text-xs text-subtle">{fileName}</span>
        )}
        {url && !fileName && (
          <span className="max-w-[200px] truncate text-xs text-accent-green">
            File attached
          </span>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-subtle">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-accent-danger">{error}</p>}
    </div>
  );
}
