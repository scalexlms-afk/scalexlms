import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
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
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-gradient-to-r from-scalex-red/15 to-transparent text-foreground"
                        : "text-muted hover:bg-surface-3 hover:text-foreground"
                    }`}
                  >
                    {item.active && (
                      <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-scalex-red" />
                    )}
                    {item.icon && (
                      <span
                        className={
                          item.active
                            ? "text-scalex-red"
                            : "text-subtle group-hover:text-muted"
                        }
                      >
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
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
