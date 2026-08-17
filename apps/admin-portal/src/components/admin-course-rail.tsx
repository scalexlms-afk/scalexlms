"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  COURSE_HUB_TABS,
  courseHubTabFromPath,
  type AdminCourseOption,
} from "@/lib/admin-nav";

export function AdminCourseRail({
  courses,
  currentCourseId,
}: {
  courses: AdminCourseOption[];
  currentCourseId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = courseHubTabFromPath(pathname, currentCourseId);
  const current = courses.find((course) => course.id === currentCourseId);

  return (
    <aside className="admin-course-rail hidden h-full min-h-0 w-[220px] shrink-0 flex-col overflow-hidden border-r border-line bg-surface-2 xl:flex">
      <div className="shrink-0 border-b border-line px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          This course
        </p>
        <label className="sr-only" htmlFor="admin-course-switcher">
          Switch course
        </label>
        <select
          id="admin-course-switcher"
          className="admin-input mt-2 py-2 text-sm"
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
        {current ? (
          <p className="mt-1.5 text-[11px] capitalize text-muted">
            {current.status}
          </p>
        ) : null}
      </div>
      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {COURSE_HUB_TABS.map((tab) => {
          const href = `/content/courses/${currentCourseId}${tab.suffix}`;
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-scalex-red/10 text-scalex-red"
                  : "text-muted hover:bg-surface-3 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-line px-3 py-3">
        <Link href="/content" className="text-xs font-medium text-muted hover:text-scalex-red">
          ← All courses
        </Link>
      </div>
    </aside>
  );
}

export function AdminCourseMobileTabs({
  currentCourseId,
}: {
  currentCourseId: string;
}) {
  const pathname = usePathname();
  const activeTab = courseHubTabFromPath(pathname, currentCourseId);

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line bg-surface-2 px-3 py-2 xl:hidden">
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
    </div>
  );
}
