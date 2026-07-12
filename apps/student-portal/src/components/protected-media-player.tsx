"use client";

import { useCallback } from "react";

export function isPlayableVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ||
    url.includes("/storage/v1/object/sign/") ||
    url.includes("/storage/v1/object/public/lesson-media/")
  );
}

type ProtectedMediaPlayerProps = {
  url: string;
  title: string;
  type: "video" | "pdf" | "auto";
  watermark?: string;
};

export function ProtectedMediaPlayer({
  url,
  title,
  type,
  watermark,
}: ProtectedMediaPlayerProps) {
  const blockContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const isVideo =
    type === "video" || (type === "auto" && isPlayableVideoUrl(url));
  const isPdf = type === "pdf" || /\.pdf(\?|$)/i.test(url);

  if (isVideo) {
    return (
      <div
        className="relative select-none"
        onContextMenu={blockContextMenu}
      >
        <video
          controls
          playsInline
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          className="w-full rounded-lg bg-black"
          src={url}
          title={title}
        />
        {watermark && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
            aria-hidden
          >
            <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-16 opacity-[0.18]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="-rotate-12 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  {watermark}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="relative select-none" onContextMenu={blockContextMenu}>
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="h-[min(70vh,600px)] w-full rounded-lg border border-white/10"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
        {watermark && (
          <p className="mt-2 text-center text-xs text-text-tertiary-dark">
            Licensed to {watermark} — do not distribute
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-text-secondary-dark">
      This resource opens in a protected viewer only.
    </p>
  );
}
