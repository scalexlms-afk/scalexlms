import type { ReactNode } from "react";
import Link from "next/link";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  searchPlaceholder,
  primaryAction,
  secondaryAction,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  searchPlaceholder?: string;
  primaryAction?: { label: string; href?: string };
  secondaryAction?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-scalex-red">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {searchPlaceholder ? (
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="admin-input max-w-xs"
              aria-label={searchPlaceholder}
            />
          ) : null}
          {secondaryAction}
          {primaryAction ? (
            primaryAction.href ? (
              <Link href={primaryAction.href} className="admin-btn-primary">
                {primaryAction.label}
              </Link>
            ) : (
              <button type="button" className="admin-btn-primary">
                {primaryAction.label}
              </button>
            )
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AdminKpiGrid({
  items,
}: {
  items: {
    label: string;
    value: string;
    hint?: string;
    tone?: "default" | "danger" | "success";
  }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="admin-kpi">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p
            className={`mt-2 font-display text-2xl font-bold ${
              item.tone === "danger"
                ? "text-accent-danger"
                : item.tone === "success"
                  ? "text-accent-green"
                  : "text-foreground"
            }`}
          >
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-xs text-subtle">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AdminFilterTabs({
  tabs,
  active,
}: {
  tabs: { id: string; label: string; count?: number; href?: string }[];
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const className = `admin-tab ${isActive ? "admin-tab-active" : "hover:text-foreground"}`;
        const label = (
          <>
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
            ) : null}
          </>
        );
        if (tab.href) {
          return (
            <Link key={tab.id} href={tab.href} className={className}>
              {label}
            </Link>
          );
        }
        return (
          <span key={tab.id} className={className}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

export function AdminDetailRail({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="admin-card flex h-full flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
      {footer ? (
        <div className="border-t border-line bg-surface-3/50 p-4">{footer}</div>
      ) : null}
    </aside>
  );
}

export function AdminPanel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          {title ? (
            <h2 className="font-display text-sm font-semibold">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function AdminSplit({
  main,
  rail,
}: {
  main: ReactNode;
  rail: ReactNode;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">{main}</div>
      <div className="min-w-0">{rail}</div>
    </div>
  );
}
