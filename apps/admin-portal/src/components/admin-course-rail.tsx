"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  COURSE_HUB_TABS,
  courseHubTabFromPath,
  type AdminCourseOption,
} from "@/lib/admin-nav";

export function AdminCourseBar({
  courses,
  currentCourseId,
}: {
  courses: AdminCourseOption[];
  currentCourseId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = courseHubTabFromPath(pathname, currentCourseId);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
      <label className="sr-only" htmlFor="admin-course-switcher">
        Switch course
      </label>
      <select
        id="admin-course-switcher"
        className="admin-input max-w-[220px] py-1.5 text-sm"
        value={currentCourseId}
        onChange={(event) => {
          const nextId = event.target.value;
          const tab = COURSE_HUB_TABS.find((item) => item.id === activeTab);
          router.push(`/content/courses/${nextId}${tab?.suffix ?? ""}`);
        }}
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>

      <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {COURSE_HUB_TABS.map((tab) => {
          const href = `/content/courses/${currentCourseId}${tab.suffix}`;
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`admin-tab shrink-0 ${isActive ? "admin-tab-active" : ""}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/content"
        className="shrink-0 text-xs font-medium text-muted hover:text-scalex-red"
      >
        All courses
      </Link>
    </div>
  );
}

/** @deprecated Use AdminCourseBar */
export function AdminCourseRail(props: {
  courses: AdminCourseOption[];
  currentCourseId: string;
}) {
  return <AdminCourseBar {...props} />;
}

export function AdminCourseMobileTabs(props: {
  currentCourseId: string;
  courses?: AdminCourseOption[];
}) {
  return (
    <AdminCourseBar
      courses={props.courses ?? []}
      currentCourseId={props.currentCourseId}
    />
  );
}
