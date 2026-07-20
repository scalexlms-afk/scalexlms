"use client";

import { useEffect, useState, type ReactNode } from "react";
import { List, X } from "@phosphor-icons/react";
import {
  NavItemRow,
  type NavGroup,
  type NavLinkComponent,
} from "./nav-sidebar";

interface MobileNavProps {
  groups: NavGroup[];
  brand?: ReactNode;
  footer?: ReactNode;
  linkComponent?: NavLinkComponent;
}

export function MobileNav({
  groups,
  brand,
  footer,
  linkComponent,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line glass-strong metallic-edge text-foreground transition-colors hover:border-line-strong"
      >
        <List weight="bold" className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="relative flex h-full w-72 max-w-[80%] flex-col overflow-hidden border-r border-line bg-surface/95 backdrop-blur-xl metallic-edge shadow-2xl animate-fade-up">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_25%_0%,rgba(227,30,36,0.16),transparent_68%)]"
              aria-hidden
            />
            <div className="relative flex items-center justify-between border-b border-line px-5 py-5">
              {brand}
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted metallic-edge transition-colors hover:bg-surface-3 hover:text-foreground"
              >
                <X weight="bold" className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 py-5">
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    {group.title}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={`${group.title}-${item.label}-${item.href}`}>
                        <NavItemRow
                          item={item}
                          linkComponent={linkComponent}
                          onNavigate={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            {footer && (
              <div className="relative border-t border-line bg-surface/35 px-5 py-4">
                {footer}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
