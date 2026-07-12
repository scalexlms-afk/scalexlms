import { extractText, getDocumentProxy } from "unpdf";
import {
  isLessonStorageMedia,
  LESSON_MEDIA_BUCKET,
  parseStoragePath,
} from "@scalex/db/media";
import { getServiceDb } from "@/lib/admin-db";

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_CHARS = 100_000;

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

export type PdfExtractResult = {
  text: string;
  pageCount: number;
};

async function fetchPdfBytes(urlOrPath: string): Promise<ArrayBuffer | null> {
  if (isLessonStorageMedia(urlOrPath)) {
    const path = parseStoragePath(urlOrPath);
    if (!path) return null;
    const db = getServiceDb();
    const { data, error } = await db.storage
      .from(LESSON_MEDIA_BUCKET)
      .download(path);
    if (error || !data) return null;
    const buffer = await data.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_PDF_BYTES) {
      return null;
    }
    return buffer;
  }

  if (!urlOrPath.includes("://")) return null;

  const response = await fetch(urlOrPath, { cache: "no-store" });
  if (!response.ok) return null;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_PDF_BYTES) {
    return null;
  }
  return buffer;
}

export async function extractPdfTextFromUrl(
  urlOrPath: string
): Promise<PdfExtractResult | null> {
  try {
    const buffer = await fetchPdfBytes(urlOrPath);
    if (!buffer) return null;

    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const merged = Array.isArray(text) ? text.join("\n\n") : text;
    const normalized = normalizeExtractedText(merged);

    if (!normalized) return null;

    return {
      text: normalized,
      pageCount: totalPages,
    };
  } catch {
    return null;
  }
}

export async function buildPdfLessonContentText(
  contentUrl: string,
  userNotes: string | null,
  options: { reextract: boolean; previousUrl?: string | null }
): Promise<{ contentText: string | null; extracted: boolean; pageCount?: number }> {
  const urlChanged =
    options.previousUrl !== undefined &&
    options.previousUrl !== contentUrl;

  if (!options.reextract && userNotes && !urlChanged) {
    return { contentText: userNotes, extracted: false };
  }

  const result = await extractPdfTextFromUrl(contentUrl);
  if (!result) {
    return { contentText: userNotes, extracted: false };
  }

  const contentText = userNotes
    ? `${userNotes.trim()}\n\n---\n\n${result.text}`
    : result.text;

  return {
    contentText,
    extracted: true,
    pageCount: result.pageCount,
  };
}
