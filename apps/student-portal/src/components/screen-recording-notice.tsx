"use client";

import { useEffect, useState } from "react";

/**
 * Best-effort UI only. Does not capture screens, read files, or upload anything.
 * Detects this page calling getDisplayMedia / a granted display-capture permission.
 */
export function ScreenRecordingNotice() {
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const media = navigator.mediaDevices;
    const original = media?.getDisplayMedia?.bind(media);

    if (media && original) {
      media.getDisplayMedia = ((...args: Parameters<typeof original>) => {
        if (!cancelled) setDetected(true);
        return original(...args);
      }) as typeof media.getDisplayMedia;
    }

    const permissions = navigator.permissions;
    if (permissions?.query) {
      void permissions
        .query({ name: "display-capture" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "granted") setDetected(true);
          status.onchange = () => {
            if (!cancelled && status.state === "granted") setDetected(true);
          };
        })
        .catch(() => {
          /* Permissions API may not support display-capture */
        });
    }

    return () => {
      cancelled = true;
      if (media && original) {
        media.getDisplayMedia = original;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <p className="rounded-lg border border-line bg-surface-3 px-3 py-2 text-xs text-muted">
        This page is protected. Screen recording may be detected.
      </p>
      {detected ? (
        <p
          role="status"
          className="rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-xs font-medium text-accent-amber"
        >
          Recording may be detected.
        </p>
      ) : null}
    </div>
  );
}
