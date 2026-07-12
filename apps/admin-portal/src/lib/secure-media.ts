import {
  isExternalMediaUrl,
  isLessonStorageMedia,
  LESSON_MEDIA_BUCKET,
  MEDIA_SIGNED_URL_TTL,
  parseStoragePath,
} from "@scalex/db/media";
import { getServiceDb } from "./admin-db";

/**
 * Resolve a lesson/recording URL for admin preview on the (now private)
 * lesson-media bucket. Storage paths are signed with the service role; external
 * URLs pass through unchanged.
 */
export async function getSecureMediaUrl(
  urlOrPath: string | null
): Promise<string | null> {
  if (!urlOrPath) return null;

  if (isExternalMediaUrl(urlOrPath) || !isLessonStorageMedia(urlOrPath)) {
    return urlOrPath;
  }

  const path = parseStoragePath(urlOrPath);
  if (!path) return null;

  const db = getServiceDb();
  const { data, error } = await db.storage
    .from(LESSON_MEDIA_BUCKET)
    .createSignedUrl(path, MEDIA_SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Sign many URLs in parallel, keyed by an id (e.g. lesson/session id). */
export async function signMediaUrls(
  entries: { id: string; url: string | null }[]
): Promise<Record<string, string>> {
  const results = await Promise.all(
    entries.map(async ({ id, url }) => ({
      id,
      signed: await getSecureMediaUrl(url),
    }))
  );

  const map: Record<string, string> = {};
  for (const { id, signed } of results) {
    if (signed) map[id] = signed;
  }
  return map;
}
