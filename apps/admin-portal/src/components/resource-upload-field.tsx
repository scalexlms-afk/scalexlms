"use client";

import { useRef, useState } from "react";
import { createClient } from "@scalex/db/client";
import { ACADEMY_RESOURCES_BUCKET } from "@scalex/db/media";
import { Button } from "@scalex/ui";

export function ResourceUploadField({
  name = "filePath",
  sizeName = "fileSizeBytes",
  typeName = "fileType",
}: {
  name?: string;
  sizeName?: string;
  typeName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState("");
  const [size, setSize] = useState("");
  const [fileType, setFileType] = useState("link");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `library/${Date.now()}-${safe}`;
      const { error: uploadError } = await supabase.storage
        .from(ACADEMY_RESOURCES_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
      if (uploadError) throw new Error(uploadError.message);

      const ext = (file.name.split(".").pop() ?? "file").toLowerCase();
      setPath(storagePath);
      setSize(String(file.size));
      setFileType(ext);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={path} />
      <input type="hidden" name={sizeName} value={size} />
      <input type="hidden" name={typeName} value={fileType} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp4,.png,.jpg,.jpeg"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          className="!px-3 !py-2 text-xs"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : path ? "Replace file" : "Upload file"}
        </Button>
        {fileName ? (
          <span className="max-w-[220px] truncate text-xs text-accent-green">
            {fileName}
          </span>
        ) : (
          <span className="text-xs text-muted">Or paste an external link below</span>
        )}
      </div>
      {error ? <p className="text-xs text-accent-danger">{error}</p> : null}
    </div>
  );
}
