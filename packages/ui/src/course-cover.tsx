"use client";

import { useState } from "react";

export function CourseCover({
  src,
  title,
  className = "h-full w-full object-cover",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-scalex-red/25 via-surface-3 to-surface-2"
        aria-hidden
      >
        <span className="font-display text-2xl font-bold text-scalex-red">
          {title.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
