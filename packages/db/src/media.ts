export const LESSON_MEDIA_BUCKET = "lesson-media";
export const ACADEMY_RESOURCES_BUCKET = "academy-resources";
export const CERTIFICATES_BUCKET = "certificates";
export const PLATFORM_BACKUPS_BUCKET = "platform-backups";
export const COMMUNITY_MEDIA_BUCKET = "community-media";
export const AVATARS_BUCKET = "avatars";

export const PLATFORM_STORAGE_BUCKETS = [
  { id: LESSON_MEDIA_BUCKET, label: "Lesson media", purpose: "Lesson video and PDF files" },
  { id: COMMUNITY_MEDIA_BUCKET, label: "Community media", purpose: "Community post images" },
  { id: ACADEMY_RESOURCES_BUCKET, label: "Academy resources", purpose: "Downloadable resource files" },
  { id: CERTIFICATES_BUCKET, label: "Certificates", purpose: "Issued certificate PDFs" },
  { id: PLATFORM_BACKUPS_BUCKET, label: "Platform backups", purpose: "App JSON snapshot exports" },
  { id: AVATARS_BUCKET, label: "Avatars", purpose: "Profile photos" },
] as const;

/** Signed URL lifetime for student playback (seconds). */
export const MEDIA_SIGNED_URL_TTL = 60 * 60; // 1 hour

export function parseStoragePath(
  urlOrPath: string | null,
  bucket: string = LESSON_MEDIA_BUCKET
): string | null {
  if (!urlOrPath) return null;

  const trimmed = urlOrPath.trim();
  if (!trimmed.includes("://")) {
    return trimmed.replace(/^\/+/, "");
  }

  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
  ];

  for (const marker of markers) {
    const idx = trimmed.indexOf(marker);
    if (idx !== -1) {
      const rest = trimmed.slice(idx + marker.length);
      return rest.split("?")[0] ?? null;
    }
  }

  return null;
}

export function isLessonStorageMedia(urlOrPath: string | null): boolean {
  if (!urlOrPath) return false;
  return parseStoragePath(urlOrPath) !== null;
}

export function isExternalMediaUrl(url: string): boolean {
  return Boolean(url.includes("://") && !isLessonStorageMedia(url));
}
