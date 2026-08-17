"use client";

import {
  useEffect,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Logo,
  MobileNav,
  NavSidebar,
  NotificationBell,
  ThemeToggle,
  type NavGroup,
} from "@scalex/ui";
import {
  AdminCourseMobileTabs,
  AdminCourseRail,
} from "@/components/admin-course-rail";
import {
  buildAdminBreadcrumbs,
  parseCourseContext,
  type AdminCourseOption,
} from "@/lib/admin-nav";

const SIDEBAR_COLLAPSE_KEY = "scalex-admin-sidebar-collapsed";

function AdminNavLink({
  href,
  className,
  onClick,
  title,
  children,
}: {
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={onClick} title={title}>
      {children}
    </Link>
  );
}

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export function AdminChrome({
  groups,
  footer,
  collapsedFooter,
  notifications,
  markReadAction,
  courses,
  children,
}: {
  groups: NavGroup[];
  footer: ReactNode;
  collapsedFooter?: ReactNode;
  notifications: Notification[];
  markReadAction?: (formData: FormData) => Promise<void>;
  courses: AdminCourseOption[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  const courseCtx = parseCourseContext(pathname);
  const crumbs = buildAdminBreadcrumbs({ pathname, courses });

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-surface">
      <div
        className={`relative z-20 hidden h-full min-h-0 shrink-0 overflow-hidden md:block ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <NavSidebar
          groups={groups}
          brand={
            collapsed ? (
              <button
                type="button"
                aria-label="Expand sidebar"
                onClick={toggleCollapsed}
                className="mx-auto block"
              >
                <Logo size="sm" />
              </button>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <Logo size="md" showTagline />
                <button
                  type="button"
                  aria-label="Collapse sidebar"
                  onClick={toggleCollapsed}
                  className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted hover:text-foreground"
                >
                  «
                </button>
              </div>
            )
          }
          headerSlot={
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to…"
              className="admin-input py-2"
              aria-label="Jump to page"
            />
          }
          footer={collapsed ? collapsedFooter ?? footer : footer}
          linkComponent={AdminNavLink}
          className="admin-sidebar-dark h-full min-h-0 w-full"
          density="compact"
          collapsibleGroups
          collapsed={collapsed}
          persistKey="scalex-admin-nav"
          filterQuery={query}
        />
      </div>

      {courseCtx ? (
        <AdminCourseRail
          courses={courses}
          currentCourseId={courseCtx.courseId}
        />
      ) : null}

      <div className="admin-main-canvas flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface-2/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
              <MobileNav
                groups={groups}
                brand={<Logo size="sm" />}
                linkComponent={AdminNavLink}
                footer={footer}
                density="compact"
                collapsibleGroups
              />
            </div>
            <div className="min-w-0">
              <nav className="hidden items-center gap-1 text-xs text-muted md:flex">
                {crumbs.crumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {index > 0 ? <span className="text-subtle">/</span> : null}
                    {crumb.href && index < crumbs.crumbs.length - 1 ? (
                      <Link href={crumb.href} className="hover:text-scalex-red">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
              <p className="truncate text-sm font-semibold text-foreground md:mt-0.5">
                {crumbs.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell
              notifications={notifications}
              markReadAction={markReadAction}
            />
          </div>
        </header>

        {courseCtx ? (
          <AdminCourseMobileTabs currentCourseId={courseCtx.courseId} />
        ) : null}

        <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 md:p-7 lg:p-8">
          <div className="mx-auto max-w-[1600px] animate-fade-in space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
