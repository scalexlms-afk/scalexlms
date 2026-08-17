import type { ReactNode } from "react";
import Link from "next/link";

const KPI_CHIP: Record<
  "default" | "danger" | "success" | "info" | "warning",
  string
> = {
  default: "bg-scalex-red/15 text-scalex-red",
  danger: "bg-accent-danger/15 text-accent-danger",
  success: "bg-accent-green/15 text-accent-green",
  info: "bg-accent-blue/15 text-accent-blue",
  warning: "bg-accent-amber/15 text-accent-amber",
};

function DefaultKpiGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 19V9M10 19V5M16 19v-7M22 19H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  search,
  primaryAction,
  secondaryAction,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  search?: {
    action: string;
    placeholder: string;
    defaultValue?: string;
    hiddenFields?: Record<string, string>;
  };
  primaryAction?: { label: string; href: string };
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
          {search ? (
            <form
              method="get"
              action={search.action}
              className="flex flex-wrap items-center gap-2"
            >
              {search.hiddenFields
                ? Object.entries(search.hiddenFields).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))
                : null}
              <input
                type="search"
                name="q"
                defaultValue={search.defaultValue ?? ""}
                placeholder={search.placeholder}
                className="admin-input max-w-xs"
                aria-label={search.placeholder}
              />
              <button type="submit" className="admin-btn-secondary">
                Search
              </button>
            </form>
          ) : null}
          {secondaryAction}
          {primaryAction ? (
            <Link href={primaryAction.href} className="admin-btn-primary">
              {primaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  hint,
  action,
  icon,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-muted">
        {icon ?? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M4 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="mt-3 font-display text-sm font-semibold text-foreground">
        {title}
      </p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
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
    tone?: "default" | "danger" | "success" | "info" | "warning";
    icon?: ReactNode;
  }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const tone = item.tone ?? "default";
        return (
          <div key={item.label} className="admin-kpi">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {item.label}
              </p>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${KPI_CHIP[tone]}`}
              >
                {item.icon ?? <DefaultKpiGlyph />}
              </span>
            </div>
            <p
              className={`mt-2 font-display text-2xl font-bold ${
                tone === "danger"
                  ? "text-accent-danger"
                  : tone === "success"
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
        );
      })}
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
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
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
      <div className={padded ? "p-4" : ""}>{children}</div>
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
