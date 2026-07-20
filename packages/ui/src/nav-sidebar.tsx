import type {
  ComponentType,
  MouseEventHandler,
  ReactNode,
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
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type NavLinkComponent = ComponentType<{
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}>;

function DefaultNavLink({
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
    <a href={href} className={className} onClick={onClick}>
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
}

function pillToneClass(tone: "ai" | "neutral" = "neutral") {
  return tone === "ai"
    ? "bg-accent-purple/20 text-accent-purple"
    : "bg-surface-3 text-muted";
}

export function NavItemRow({
  item,
  onNavigate,
  linkComponent: LinkComponent = DefaultNavLink,
}: {
  item: NavItem;
  onNavigate?: () => void;
  linkComponent?: NavLinkComponent;
}) {
  const isPrimary = item.emphasis === "primary" && !item.active;
  const rowClass = `group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
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

  const content = (
    <>
      {item.active && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-scalex-red" />
      )}
      {item.icon && (
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
            item.active
              ? "bg-scalex-red/15"
              : "bg-white/[0.025] group-hover:bg-white/[0.05]"
          } ${iconClass}`}
        >
          {item.icon}
        </span>
      )}
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
    <LinkComponent
      href={item.href}
      onClick={onNavigate}
      className={rowClass}
    >
      {content}
    </LinkComponent>
  );
}

export function NavSidebar({
  groups,
  brand,
  footer,
  linkComponent,
  className = "",
}: NavSidebarProps) {
  return (
    <aside
      className={`relative flex w-64 min-h-screen shrink-0 flex-col border-r border-line bg-surface/90 backdrop-blur-xl metallic-edge ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_25%_0%,rgba(227,30,36,0.15),transparent_68%)]"
        aria-hidden
      />
      {brand && (
        <div className="relative border-b border-line px-5 py-6">{brand}</div>
      )}
      <nav className="relative flex-1 space-y-6 px-3 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={`${group.title}-${item.label}-${item.href}`}>
                  <NavItemRow item={item} linkComponent={linkComponent} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer && (
        <div className="relative mt-auto border-t border-line bg-surface/35 px-5 py-4 backdrop-blur-sm">
          {footer}
        </div>
      )}
    </aside>
  );
}
