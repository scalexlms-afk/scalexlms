"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarSimple } from "@phosphor-icons/react";
import {
  Logo,
  MobileNav,
  NavSidebar,
  StatusPill,
  ThemeToggle,
  type NavGroup,
  type NavItem,
  type NavLinkComponent,
} from "@scalex/ui";
import { planLabel, planPillVariant } from "@scalex/db/plans";
import {
  loadPortalChromeExtras,
  type PortalChromeExtras,
} from "@/components/portal-chrome-data";
import {
  buildPortalNavGroups,
  portalNavHrefs,
} from "@/lib/portal-nav-catalog";

const SIDEBAR_STORAGE_KEY = "scalex-sidebar-open";

function isModifiedClick(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  button: number;
}) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

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
      active: isItemActive(activePath, item),
    })),
  }));
}

function SidebarFooter({
  extras,
}: {
  extras: PortalChromeExtras | null;
}) {
  const name = extras?.name ?? "Student";
  const email = extras?.email ?? "";
  const avatarUrl = extras?.avatarUrl ?? null;
  const plan = extras?.plan ?? null;
  const pct = Math.min(
    100,
    Math.max(0, Math.round(extras?.completionPercent ?? 0))
  );
  const milestoneTotal = extras?.milestoneTotal ?? 8;
  const step = Math.min(
    milestoneTotal,
    Math.max(1, Math.round(extras?.milestoneIndex ?? 1))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-foreground ring-1 ring-line metallic-edge">
            {initialsFromName(name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
      </div>

      <StatusPill
        label={`${planLabel(plan, true)} Plan`}
        variant={planPillVariant(plan)}
      />

      <div className="rounded-[var(--radius-card)] border border-line px-3 py-3 metallic-graphite metallic-edge">
        <p className="text-sm font-semibold text-foreground">
          Program Progress: {pct}% Complete
        </p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-scalex-red-dark to-scalex-red shadow-[0_0_12px_-2px_rgba(227,30,36,0.6)] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Step {step} of {milestoneTotal}
        </p>
      </div>
    </div>
  );
}

export function PortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [extras, setExtras] = useState<PortalChromeExtras | null>(null);
  const PortalNavLink = useMemo(
    () => createPrefetchNavLink(setPendingHref),
    []
  );

  const groups = useMemo(
    () => buildPortalNavGroups(extras?.unreadCount ?? 0),
    [extras?.unreadCount]
  );

  useEffect(() => {
    for (const href of portalNavHrefs(groups)) {
      router.prefetch(href);
    }
  }, [groups, router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    loadPortalChromeExtras()
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

  const activeGroups = withActiveGroups(groups, pathname, pendingHref);

  const footer = <SidebarFooter extras={extras} />;

  const sidebarToggle = (
    <button
      type="button"
      aria-label={open ? "Close sidebar" : "Open sidebar"}
      aria-pressed={open}
      onClick={() => setOpen((value) => !value)}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line glass-strong metallic-edge text-foreground transition-colors hover:border-line-strong"
    >
      <SidebarSimple
        weight={open ? "fill" : "regular"}
        className="h-5 w-5"
        aria-hidden
      />
    </button>
  );

  return (
    <div className="relative flex min-h-screen bg-surface">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_-8%,rgba(227,30,36,0.12),transparent_32%),radial-gradient(circle_at_105%_72%,rgba(227,30,36,0.055),transparent_28%)]"
        aria-hidden
      />

      <div
        className={`relative z-10 hidden shrink-0 md:block ${open ? "w-64" : "w-14"}`}
      >
        {open ? (
          <>
            <div className="pointer-events-none absolute right-3 top-3 z-30">
              <div className="pointer-events-auto">{sidebarToggle}</div>
            </div>
            <NavSidebar
              groups={activeGroups}
              brand={
                <div className="pr-11">
                  <Logo size="md" showTagline />
                </div>
              }
              footer={footer}
              linkComponent={PortalNavLink}
              className="min-h-dvh"
            />
          </>
        ) : (
          <div className="sticky top-0 flex justify-center px-2 pt-3">
            {sidebarToggle}
          </div>
        )}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="pointer-events-none sticky top-0 z-20 flex h-14 items-center justify-end gap-2 px-4">
          <div className="pointer-events-auto mr-auto flex items-center gap-2 md:hidden">
            <MobileNav
              groups={activeGroups}
              brand={<Logo size="sm" />}
              footer={footer}
              linkComponent={PortalNavLink}
            />
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
