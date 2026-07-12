import {
  LESSON_MEDIA_BUCKET,
  parseStoragePath,
} from "@scalex/db/media";

export {
  LESSON_MEDIA_BUCKET,
  parseStoragePath,
  isLessonStorageMedia,
} from "@scalex/db/media";

export function storagePathFromPublicUrl(url: string | null): string | null {
  return parseStoragePath(url);
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function lessonMediaPath(moduleId: string, fileName: string): string {
  return `lessons/${moduleId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function recordingMediaPath(sessionId: string, fileName: string): string {
  return `recordings/${sessionId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}
