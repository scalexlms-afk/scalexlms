"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavLinkComponent } from "@scalex/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Logo,
  MobileNav,
  NavSidebar,
  NotificationBell,
  ThemeToggle,
  type NavGroup,
} from "@scalex/ui";
import { AdminCourseBar } from "@/components/admin-course-rail";
import {
  loadAdminChromeExtras,
  type AdminChromeExtras,
} from "@/components/admin-chrome-data";
import { markNotificationRead } from "@/app/(app)/notifications/actions";
import {
  buildAdminBreadcrumbs,
  parseCourseContext,
} from "@/lib/admin-nav";
import {
  adminRoleLabel,
  buildAdminNavGroups,
  parseAdminNavRole,
} from "@/lib/admin-nav-catalog";
import type { UserRole } from "@scalex/db/types";

const SIDEBAR_COLLAPSE_KEY = "scalex-admin-sidebar-collapsed";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      {open ? (
        <path
          d="M4 7h16M4 12h10M4 17h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function withActiveGroups(
  groups: NavGroup[],
  pathname: string,
  pendingHref: string | null
): NavGroup[] {
  const activePath = pendingHref ?? pathname;
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.href ? pathActive(activePath, item.href) : Boolean(item.active),
    })),
  }));
}

function isModifiedClick(event: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function createPrefetchNavLink(
  setPendingHref: (href: string) => void
): NavLinkComponent {
  return function PrefetchNavLink({
    href,
    className,
    onClick,
    title,
    children,
  }) {
    return (
      <Link
        href={href}
        className={className}
        title={title}
        prefetch
        onClick={(event) => {
          if (!isModifiedClick(event)) setPendingHref(href);
          onClick?.(event);
        }}
      >
        {children}
      </Link>
    );
  };
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminChrome({
  initialRole,
  children,
}: {
  initialRole?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [extras, setExtras] = useState<AdminChromeExtras | null>(null);
  const AdminNavLink = useMemo(
    () => createPrefetchNavLink(setPendingHref),
    []
  );

  const role: UserRole =
    extras?.role ?? parseAdminNavRole(initialRole) ?? "super_admin";

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    loadAdminChromeExtras()
      .then((data) => {
        if (!cancelled) setExtras(data);
      })
      .catch(() => {
        /* keep chrome without extras */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const badges = extras?.badges;
  const groups = useMemo(
    () => buildAdminNavGroups(role, badges ?? {}),
    [role, badges]
  );

  useEffect(() => {
    for (const href of groups.flatMap((group) =>
      group.items.map((item) => item.href).filter(Boolean)
    )) {
      router.prefetch(href);
    }
  }, [groups, router]);

  const courseCtx = parseCourseContext(pathname);
  const crumbs = buildAdminBreadcrumbs({
    pathname,
    courses: extras?.courses ?? [],
  });
  const activeGroups = withActiveGroups(groups, pathname, pendingHref);
  const sidebarOpen = !collapsed;

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
  }

  async function onMarkRead(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    setExtras((current) => {
      if (!current) return current;
      const notifications = current.notifications.map((item) =>
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item
      );
      return {
        ...current,
        notifications,
        badges: {
          ...current.badges,
          messages: notifications.filter((item) => !item.read_at).length,
        },
      };
    });
    await markNotificationRead(formData);
  }

  const footer = (
    <div className="text-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-scalex-red/20 text-xs font-bold text-scalex-red">
          {initialsFromName(extras?.name ?? "A")}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {adminRoleLabel(role)}
          </p>
          <p className="truncate text-xs text-muted">{extras?.email ?? ""}</p>
        </div>
      </div>
      <form action="/auth/signout" method="post" className="mt-3">
        <button
          type="submit"
          className="text-xs font-medium text-accent-danger hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );

  const menuButton = (
    <button
      type="button"
      aria-label={sidebarOpen ? "Hide menu" : "Show menu"}
      aria-expanded={sidebarOpen}
      onClick={toggleCollapsed}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-foreground transition hover:bg-surface-3"
    >
      <MenuIcon open={sidebarOpen} />
    </button>
  );

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-surface">
      <div
        className={`relative z-20 hidden h-full min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 md:block ${
          collapsed ? "w-0 border-r-0" : "w-64"
        }`}
      >
        {!collapsed ? (
          <NavSidebar
            groups={activeGroups}
            brand={
              <div className="flex items-start justify-between gap-2">
                <Logo size="md" showTagline />
              </div>
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
            footer={footer}
            linkComponent={AdminNavLink}
            className="admin-sidebar-dark h-full min-h-0 w-full"
            density="compact"
            collapsibleGroups
            collapsed={false}
            filterQuery={query}
          />
        ) : null}
      </div>

      <div className="admin-main-canvas flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface-2/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden md:block">{menuButton}</div>
            <div className="md:hidden">
              <MobileNav
                groups={activeGroups}
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
                      <Link href={crumb.href} className="hover:text-scalex-red" prefetch>
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
              notifications={extras?.notifications ?? []}
              markReadAction={onMarkRead}
            />
            <Link
              href="/notifications"
              className="hidden text-xs font-semibold text-muted hover:text-scalex-red sm:inline"
              prefetch
            >
              Inbox
            </Link>
          </div>
        </header>

        {courseCtx ? (
          <AdminCourseBar
            courses={extras?.courses ?? []}
            currentCourseId={courseCtx.courseId}
          />
        ) : null}

        <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 md:p-7 lg:p-8">
          <div className="mx-auto max-w-[1600px] space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
