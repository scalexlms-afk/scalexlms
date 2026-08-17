"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type MouseEventHandler,
  type ReactNode,
} from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: number;
  pillBadge?: { label: string; tone?: "ai" | "neutral" };
  emphasis?: "primary" | "default";
  kind?: "link" | "action";
  /** When kind is "action", POST to this path (defaults to href). */
  action?: string;
  children?: NavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type NavLinkComponent = ComponentType<{
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  title?: string;
  children: ReactNode;
}>;

export type NavDensity = "comfortable" | "compact";

function DefaultNavLink({
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
    <a href={href} className={className} onClick={onClick} title={title}>
      {children}
    </a>
  );
}

interface NavSidebarProps {
  groups: NavGroup[];
  brand?: ReactNode;
  footer?: ReactNode;
  linkComponent?: NavLinkComponent;
  className?: string;
  density?: NavDensity;
  collapsibleGroups?: boolean;
  collapsed?: boolean;
  persistKey?: string;
  filterQuery?: string;
  headerSlot?: ReactNode;
}

function pillToneClass(tone: "ai" | "neutral" = "neutral") {
  return tone === "ai"
    ? "bg-accent-purple/20 text-accent-purple"
    : "bg-surface-3 text-muted";
}

function groupHasActive(group: NavGroup): boolean {
  return group.items.some(itemIsActive);
}

function itemIsActive(item: NavItem): boolean {
  if (item.active) return true;
  return (item.children ?? []).some(itemIsActive);
}

function itemMatchesQuery(item: NavItem, query: string): boolean {
  if (!query) return true;
  if (item.label.toLowerCase().includes(query)) return true;
  return (item.children ?? []).some((child) => itemMatchesQuery(child, query));
}

function filterGroups(groups: NavGroup[], query: string): NavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => itemMatchesQuery(item, q)),
    }))
    .filter((group) => group.items.length > 0);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-3.5 w-3.5 shrink-0 text-subtle transition-transform ${open ? "rotate-90" : ""}`}
      aria-hidden
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavItemRow({
  item,
  onNavigate,
  linkComponent: LinkComponent = DefaultNavLink,
  density = "comfortable",
  collapsed = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  linkComponent?: NavLinkComponent;
  density?: NavDensity;
  collapsed?: boolean;
}) {
  const isPrimary = item.emphasis === "primary" && !item.active;
  const compact = density === "compact";
  const rowClass = `group relative flex w-full items-center ${
    collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3"
  } rounded-xl border text-sm font-medium transition-all duration-200 ${
    compact ? "py-1.5" : "py-2.5"
  } ${
    item.active
      ? "border-scalex-red/20 bg-gradient-to-r from-scalex-red/22 via-scalex-red/8 to-transparent text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      : isPrimary
        ? "border-transparent text-foreground hover:border-line hover:bg-surface-3/65"
        : "border-transparent text-muted hover:border-line hover:bg-surface-3/65 hover:text-foreground"
  }`;

  const iconClass = item.active
    ? "text-scalex-red"
    : isPrimary
      ? "text-scalex-red/80 group-hover:text-scalex-red"
      : "text-subtle group-hover:text-muted";

  const iconBox = compact ? "h-6 w-6" : "h-7 w-7";

  const content = (
    <>
      {item.active && !collapsed && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-scalex-red" />
      )}
      {item.icon && (
        <span
          className={`flex ${iconBox} shrink-0 items-center justify-center rounded-lg transition-colors ${
            item.active
              ? "bg-scalex-red/15"
              : "bg-white/[0.025] group-hover:bg-white/[0.05]"
          } ${iconClass}`}
        >
          {item.icon}
        </span>
      )}
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
          {item.pillBadge && (
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${pillToneClass(
                item.pillBadge.tone
              )}`}
            >
              {item.pillBadge.label}
            </span>
          )}
          {typeof item.badge === "number" && item.badge > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-scalex-red px-1.5 text-[11px] font-bold leading-none text-white">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      ) : typeof item.badge === "number" && item.badge > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-scalex-red px-1 text-[9px] font-bold text-white">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.kind === "action") {
    return (
      <form action={item.action ?? item.href} method="post" className="w-full">
        <button
          type="submit"
          onClick={onNavigate}
          className={rowClass}
          title={collapsed ? item.label : undefined}
        >
          {content}
        </button>
      </form>
    );
  }

  return (
    <LinkComponent
      href={item.href}
      onClick={onNavigate}
      className={rowClass}
      title={collapsed ? item.label : undefined}
    >
      {content}
    </LinkComponent>
  );
}

function NestedItems({
  items,
  onNavigate,
  linkComponent,
  density,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  linkComponent?: NavLinkComponent;
  density?: NavDensity;
}) {
  return (
    <ul className="ml-4 space-y-0.5 border-l border-line pl-2">
      {items.map((child) => (
        <li key={`${child.label}-${child.href}`}>
          <NavItemRow
            item={child}
            onNavigate={onNavigate}
            linkComponent={linkComponent}
            density={density}
          />
        </li>
      ))}
    </ul>
  );
}

export function NavSidebar({
  groups,
  brand,
  footer,
  linkComponent,
  className = "",
  density = "comfortable",
  collapsibleGroups = false,
  collapsed = false,
  persistKey,
  filterQuery = "",
  headerSlot,
}: NavSidebarProps) {
  const visibleGroups = useMemo(
    () => filterGroups(groups, filterQuery),
    [groups, filterQuery]
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.title] = groupHasActive(group);
    }
    return initial;
  });

  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as Record<string, boolean>;
      setOpenGroups((prev) => ({ ...prev, ...stored }));
    } catch {
      /* ignore */
    }
  }, [persistKey]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of groups) {
        if (groupHasActive(group) && next[group.title] !== true) {
          next[group.title] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [groups]);

  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    window.localStorage.setItem(persistKey, JSON.stringify(openGroups));
  }, [openGroups, persistKey]);

  const searching = filterQuery.trim().length > 0;

  function toggleGroup(title: string) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <aside
      className={`relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-line bg-surface/90 backdrop-blur-xl metallic-edge ${
        collapsed ? "w-16" : "w-64"
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_25%_0%,rgba(227,30,36,0.15),transparent_68%)]"
        aria-hidden
      />
      {brand && (
        <div
          className={`relative shrink-0 border-b border-line ${
            collapsed ? "px-2 py-4" : "px-5 py-5"
          }`}
        >
          {brand}
        </div>
      )}
      {headerSlot && !collapsed ? (
        <div className="relative shrink-0 border-b border-line px-3 py-3">
          {headerSlot}
        </div>
      ) : null}
      <nav
        className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 ${
          collapsed ? "space-y-4 px-1.5" : "space-y-2 px-3"
        }`}
      >
        {visibleGroups.map((group) => {
          const isOpen =
            !collapsibleGroups ||
            collapsed ||
            searching ||
            openGroups[group.title] === true;
          return (
            <div key={group.title}>
              {collapsed ? (
                <p className="sr-only">{group.title}</p>
              ) : collapsibleGroups ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={isOpen}
                  className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle transition hover:bg-surface-3/50 hover:text-muted"
                >
                  <span>{group.title}</span>
                  <Chevron open={isOpen} />
                </button>
              ) : (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  {group.title}
                </p>
              )}
              {isOpen ? (
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={`${group.title}-${item.label}-${item.href}`}>
                      <NavItemRow
                        item={item}
                        linkComponent={linkComponent}
                        density={density}
                        collapsed={collapsed}
                      />
                      {!collapsed && item.children && item.children.length > 0 ? (
                        <div className="mt-0.5">
                          <NestedItems
                            items={item.children}
                            linkComponent={linkComponent}
                            density={density}
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
      {footer && (
        <div
          className={`relative shrink-0 border-t border-line bg-surface/35 backdrop-blur-sm ${
            collapsed ? "px-2 py-3" : "px-5 py-4"
          }`}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
