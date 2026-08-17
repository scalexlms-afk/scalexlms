export function slugifyCourseTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Public path for a course cover (`/courses/{slug}.png` in each portal). */
export function courseCoverSrc(course: { title: string }): string {
  return `/courses/${slugifyCourseTitle(course.title)}.png`;
}
