import { createClient } from "@scalex/db/server";
import {
  isExternalMediaUrl,
  isLessonStorageMedia,
  LESSON_MEDIA_BUCKET,
  MEDIA_SIGNED_URL_TTL,
  parseStoragePath,
} from "@scalex/db/media";

/**
 * Resolve a lesson/recording URL for student playback.
 * Storage paths get short-lived signed URLs; external URLs pass through.
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

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(LESSON_MEDIA_BUCKET)
    .createSignedUrl(path, MEDIA_SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
