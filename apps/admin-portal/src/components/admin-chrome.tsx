"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import {
  Logo,
  MobileNav,
  NavSidebar,
  NotificationBell,
  ThemeToggle,
  type NavGroup,
} from "@scalex/ui";

function AdminNavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
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
  notifications,
  markReadAction,
  children,
}: {
  groups: NavGroup[];
  footer: ReactNode;
  notifications: Notification[];
  markReadAction?: (formData: FormData) => Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="sticky top-0 z-20 hidden h-screen shrink-0 md:block">
        <NavSidebar
          groups={groups}
          brand={<Logo size="md" showTagline />}
          linkComponent={AdminNavLink}
          footer={footer}
          className="admin-sidebar-dark"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col admin-main-canvas">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface-2/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3 md:hidden">
            <MobileNav
              groups={groups}
              brand={<Logo size="sm" />}
              linkComponent={AdminNavLink}
              footer={footer}
            />
            <Logo size="sm" />
          </div>
          <div className="hidden text-sm font-medium text-muted md:block">
            ScaleX Management OS
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell
              notifications={notifications}
              markReadAction={markReadAction}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] animate-fade-in space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
