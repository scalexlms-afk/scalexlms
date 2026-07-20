"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarSimple } from "@phosphor-icons/react";
import {
  Logo,
  MobileNav,
  NavSidebar,
  ThemeToggle,
  type NavGroup,
  type NavItem,
} from "@scalex/ui";

const SIDEBAR_STORAGE_KEY = "scalex-sidebar-open";

function isItemActive(activePath: string, item: NavItem) {
  if (item.kind === "action") return false;
  if (item.label === "Continue Learning") {
    return activePath === "/continue-learning";
  }
  if (item.href === "/tasks") {
    return activePath === "/tasks" || activePath.startsWith("/tasks/");
  }
  if (item.href === "/billing") {
    return activePath === "/billing" || activePath.startsWith("/payment");
  }
  if (item.href === "/notifications") {
    return activePath === "/notifications";
  }
  if (item.href === "/achievements") {
    return activePath === "/achievements";
  }
  if (item.href === "/settings") {
    return activePath === "/settings";
  }
  return activePath === item.href || activePath.startsWith(`${item.href}/`);
}

function withActiveGroups(groups: NavGroup[], pathname: string): NavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: isItemActive(pathname, item),
    })),
  }));
}

export function PortalChrome({
  groups,
  footer,
  children,
}: {
  groups: NavGroup[];
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "0") setOpen(false);
    if (stored === "1") setOpen(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "1" : "0");
  }, [open, hydrated]);

  const activeGroups = withActiveGroups(groups, pathname);

  return (
    <div className="relative flex min-h-screen bg-surface">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_-8%,rgba(227,30,36,0.12),transparent_32%),radial-gradient(circle_at_105%_72%,rgba(227,30,36,0.055),transparent_28%)]"
        aria-hidden
      />

      {open ? (
        <div className="relative z-10 hidden md:block">
          <NavSidebar
            groups={activeGroups}
            brand={<Logo size="md" showTagline />}
            footer={footer}
            linkComponent={Link}
          />
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="pointer-events-none sticky top-0 z-20 flex h-14 items-center justify-end gap-2 px-4">
          <div className="pointer-events-auto mr-auto flex items-center gap-2">
            <div className="md:hidden">
              <MobileNav
                groups={activeGroups}
                brand={<Logo size="sm" />}
                footer={footer}
                linkComponent={Link}
              />
            </div>
            <button
              type="button"
              aria-label={open ? "Close sidebar" : "Open sidebar"}
              aria-pressed={open}
              onClick={() => setOpen((value) => !value)}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-line glass-strong metallic-edge text-foreground transition-colors hover:border-line-strong md:flex"
            >
              <SidebarSimple
                weight={open ? "fill" : "regular"}
                className="h-5 w-5"
                aria-hidden
              />
            </button>
            {!open ? (
              <div className="hidden md:block">
                <Logo size="sm" />
              </div>
            ) : null}
          </div>
          <div className="pointer-events-auto rounded-full border border-line glass-strong p-0.5 metallic-edge shadow-[0_14px_38px_-24px_rgba(0,0,0,0.85)]">
            <ThemeToggle />
          </div>
        </header>

        <main className="relative z-10 flex-1 p-4 pt-2 md:p-8 md:pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
