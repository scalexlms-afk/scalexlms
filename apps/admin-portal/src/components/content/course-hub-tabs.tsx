"use client";

import { usePathname } from "next/navigation";
import { AdminFilterTabs } from "@/components/admin-ui";

const TAB_DEFS = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "structure", label: "Structure", suffix: "/structure" },
  { id: "students", label: "Students", suffix: "/students" },
  { id: "certificates", label: "Certificates", suffix: "/certificates" },
  { id: "analytics", label: "Analytics", suffix: "/analytics" },
  { id: "settings", label: "Settings", suffix: "/settings" },
] as const;

function activeTabFromPath(pathname: string, base: string): string {
  if (pathname.startsWith(`${base}/structure`)) return "structure";
  if (pathname.startsWith(`${base}/students`)) return "students";
  if (pathname.startsWith(`${base}/certificates`)) return "certificates";
  if (pathname.startsWith(`${base}/analytics`)) return "analytics";
  if (pathname.startsWith(`${base}/settings`)) return "settings";
  return "overview";
}

export function CourseHubTabs({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/content/courses/${courseId}`;
  const active = activeTabFromPath(pathname, base);

  return (
    <AdminFilterTabs
      active={active}
      tabs={TAB_DEFS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        href: `${base}${tab.suffix}`,
      }))}
    />
  );
}
