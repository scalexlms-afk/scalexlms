export const COURSE_HUB_TABS = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "structure", label: "Content", suffix: "/structure" },
  { id: "students", label: "Students", suffix: "/students" },
  { id: "certificates", label: "Certificates", suffix: "/certificates" },
  { id: "analytics", label: "Analytics", suffix: "/analytics" },
  { id: "settings", label: "Settings", suffix: "/settings" },
] as const;

export type CourseHubTabId = (typeof COURSE_HUB_TABS)[number]["id"];

export type AdminCourseOption = {
  id: string;
  title: string;
  status: string;
};

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};

const NAV_LABELS: Record<string, { group: string; title: string }> = {
  "/": { group: "Overview", title: "Dashboard" },
  "/analytics": { group: "Overview", title: "Analytics" },
  "/content": { group: "Academy", title: "Courses" },
  "/resources": { group: "Academy", title: "Resources" },
  "/ai-knowledge": { group: "Academy", title: "AI Knowledge Base" },
  "/students": { group: "Students", title: "All students" },
  "/reviews": { group: "Students", title: "Task Reviews" },
  "/community": { group: "Engagement", title: "Community" },
  "/sessions": { group: "Engagement", title: "Live Sessions" },
  "/messages": { group: "Engagement", title: "Messages" },
  "/support": { group: "Engagement", title: "Support Tickets" },
  "/crm": { group: "Business", title: "CRM" },
  "/finance": { group: "Business", title: "Finance" },
  "/team": { group: "System", title: "Team Members" },
  "/roles": { group: "System", title: "Roles & Permissions" },
  "/settings": { group: "System", title: "Settings" },
};

export function parseCourseContext(pathname: string): {
  courseId: string;
  tab: CourseHubTabId;
} | null {
  const match = pathname.match(/^\/content\/courses\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return null;
  const tab = (match[2] ?? "overview") as CourseHubTabId;
  const known = COURSE_HUB_TABS.some((item) => item.id === tab);
  return {
    courseId: match[1],
    tab: known ? tab : "overview",
  };
}

export function courseHubTabFromPath(
  pathname: string,
  courseId: string
): CourseHubTabId {
  const base = `/content/courses/${courseId}`;
  if (pathname.startsWith(`${base}/structure`)) return "structure";
  if (pathname.startsWith(`${base}/students`)) return "students";
  if (pathname.startsWith(`${base}/certificates`)) return "certificates";
  if (pathname.startsWith(`${base}/analytics`)) return "analytics";
  if (pathname.startsWith(`${base}/settings`)) return "settings";
  return "overview";
}

export function buildAdminBreadcrumbs({
  pathname,
  courses,
}: {
  pathname: string;
  courses: AdminCourseOption[];
}): { crumbs: AdminBreadcrumb[]; title: string } {
  const courseCtx = parseCourseContext(pathname);
  if (courseCtx) {
    const course = courses.find((item) => item.id === courseCtx.courseId);
    const tab = COURSE_HUB_TABS.find((item) => item.id === courseCtx.tab);
    const courseTitle = course?.title ?? "Course";
    const crumbs: AdminBreadcrumb[] = [
      { label: "Academy", href: "/content" },
      { label: "Courses", href: "/content" },
      {
        label: courseTitle,
        href: `/content/courses/${courseCtx.courseId}`,
      },
    ];
    if (courseCtx.tab !== "overview" && tab) {
      crumbs.push({
        label: tab.label,
        href: `/content/courses/${courseCtx.courseId}${tab.suffix}`,
      });
    }
    return {
      crumbs,
      title:
        courseCtx.tab === "overview"
          ? courseTitle
          : `${courseTitle} · ${tab?.label ?? "Course"}`,
    };
  }

  const exact = NAV_LABELS[pathname];
  if (exact) {
    return {
      crumbs: [
        { label: exact.group, href: pathname },
        { label: exact.title },
      ],
      title: exact.title,
    };
  }

  const prefix = Object.keys(NAV_LABELS)
    .filter((href) => href !== "/" && pathname.startsWith(href))
    .sort((a, b) => b.length - a.length)[0];
  if (prefix) {
    const meta = NAV_LABELS[prefix];
    return {
      crumbs: [
        { label: meta.group, href: prefix },
        { label: meta.title, href: prefix },
      ],
      title: meta.title,
    };
  }

  return {
    crumbs: [{ label: "Overview", href: "/" }],
    title: "Dashboard",
  };
}
