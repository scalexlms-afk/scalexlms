"use client";

import { useCallback } from "react";

export function isPlayableVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|mov|m4v|m3u8)(\?|$)/i.test(url) ||
    url.includes("/storage/v1/object/sign/") ||
    url.includes("/storage/v1/object/public/lesson-media/")
  );
}

/**
 * Convert a YouTube/Vimeo watch URL into a privacy-friendly embeddable URL.
 * Returns null when the URL is not a recognised embed provider.
 */
export function getVideoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube: youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      const match = u.pathname.match(/\/(embed|shorts)\/([\w-]+)/);
      if (match) return `https://www.youtube-nocookie.com/embed/${match[2]}`;
    }

    // Vimeo: vimeo.com/<id> or player.vimeo.com/video/<id>
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}`
        : null;
    }
    if (host === "player.vimeo.com") {
      return url;
    }
  } catch {
    return null;
  }
  return null;
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

  const embedUrl =
    type !== "pdf" ? getVideoEmbedUrl(url) : null;
  const isVideo =
    type === "video" || (type === "auto" && isPlayableVideoUrl(url));
  const isPdf = type === "pdf" || /\.pdf(\?|$)/i.test(url);

  if (embedUrl) {
    return (
      <div
        className="relative aspect-video select-none"
        onContextMenu={blockContextMenu}
      >
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full rounded-lg border border-line bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {watermark && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
            aria-hidden
          >
            <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {watermark}
            </span>
          </div>
        )}
      </div>
    );
  }

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
          className="h-[min(70vh,600px)] w-full rounded-lg border border-line"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
        {watermark && (
          <p className="mt-2 text-center text-xs text-subtle">
            Licensed to {watermark} — do not distribute
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-muted">
      This resource opens in a protected viewer only.
    </p>
  );
}
