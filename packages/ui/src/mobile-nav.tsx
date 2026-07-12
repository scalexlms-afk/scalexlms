"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { NavGroup } from "./nav-sidebar";

interface MobileNavProps {
  groups: NavGroup[];
  brand?: ReactNode;
  footer?: ReactNode;
}

export function MobileNav({ groups, brand, footer }: MobileNavProps) {
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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-foreground transition-colors hover:bg-surface-3"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="relative flex h-full w-72 max-w-[80%] flex-col border-r border-line bg-surface shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-line px-5 py-5">
              {brand}
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
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
                          onClick={() => setOpen(false)}
                          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            item.active
                              ? "bg-gradient-to-r from-scalex-red/15 to-transparent text-foreground"
                              : "text-muted hover:bg-surface-3 hover:text-foreground"
                          }`}
                        >
                          {item.icon && (
                            <span
                              className={
                                item.active
                                  ? "text-scalex-red"
                                  : "text-subtle"
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
              <div className="border-t border-line px-5 py-4">
                {footer}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
