"use client";

import { useState } from "react";
import { Button } from "@scalex/ui";

type MediaPreviewProps = {
  url: string;
  kind: "video" | "pdf";
  label?: string;
};

export function MediaPreview({ url, kind, label }: MediaPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-surface/30 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-subtle">
          {label ?? (kind === "video" ? "Current video" : "Current PDF")}
        </span>
        <Button
          type="button"
          className="!px-3 !py-1.5 text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide preview" : "Preview"}
        </Button>
      </div>
      {open && (
        <div className="mt-2">
          {kind === "video" ? (
            <video
              src={url}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              className="max-h-64 w-full rounded-md bg-black"
            />
          ) : (
            <iframe
              src={url}
              title="PDF preview"
              className="h-72 w-full rounded-md bg-white"
            />
          )}
        </div>
      )}
    </div>
  );
}
