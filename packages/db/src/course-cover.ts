export function slugifyCourseTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CourseCoverInput = {
  title: string;
  cover_url?: string | null;
  cover_path?: string | null;
};

function publicStorageUrl(path: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/lesson-media/${path.replace(/^\/+/, "")}`;
}

/** Prefer uploaded cover_url / cover_path; else `/courses/{slug}.png`. */
export function courseCoverSrc(course: CourseCoverInput): string {
  const url = course.cover_url?.trim();
  if (url) return url;

  const path = course.cover_path?.trim();
  if (path) {
    if (path.includes("://") || path.startsWith("/")) return path;
    return publicStorageUrl(path) ?? path;
  }

  return `/courses/${slugifyCourseTitle(course.title)}.png`;
}
