import type { ReactNode } from "react";

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
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavSidebarProps {
  groups: NavGroup[];
  brand?: ReactNode;
  footer?: ReactNode;
}

function pillToneClass(tone: "ai" | "neutral" = "neutral") {
  return tone === "ai"
    ? "bg-accent-purple/20 text-accent-purple"
    : "bg-surface-3 text-muted";
}

export function NavItemRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const isPrimary = item.emphasis === "primary" && !item.active;
  const rowClass = `group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    item.active
      ? "bg-gradient-to-r from-scalex-red/15 to-transparent text-foreground"
      : isPrimary
        ? "text-foreground hover:bg-surface-3"
        : "text-muted hover:bg-surface-3 hover:text-foreground"
  }`;

  const iconClass = item.active
    ? "text-scalex-red"
    : isPrimary
      ? "text-scalex-red/80 group-hover:text-scalex-red"
      : "text-subtle group-hover:text-muted";

  const content = (
    <>
      {item.active && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-scalex-red" />
      )}
      {item.icon && <span className={iconClass}>{item.icon}</span>}
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
  );

  if (item.kind === "action") {
    return (
      <form action={item.action ?? item.href} method="post" className="w-full">
        <button type="submit" onClick={onNavigate} className={rowClass}>
          {content}
        </button>
      </form>
    );
  }

  return (
    <a href={item.href} onClick={onNavigate} className={rowClass}>
      {content}
    </a>
  );
}

export function NavSidebar({ groups, brand, footer }: NavSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col bg-surface border-r border-line">
      {brand && (
        <div className="border-b border-line px-5 py-6">{brand}</div>
      )}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={`${group.title}-${item.label}-${item.href}`}>
                  <NavItemRow item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer && (
        <div className="border-t border-line px-5 py-4">{footer}</div>
      )}
    </aside>
  );
}
