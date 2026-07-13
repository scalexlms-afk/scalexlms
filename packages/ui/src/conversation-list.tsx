import type { ReactNode } from "react";

export function ConversationList({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <ul className="divide-y divide-line">{children}</ul>
    </div>
  );
}

export function ConversationListItem({
  href,
  active,
  title,
  preview,
  badge,
}: {
  href: string;
  active?: boolean;
  title: string;
  preview?: string;
  badge?: ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        className={`block px-4 py-3 transition-colors hover:bg-surface-3 ${
          active ? "bg-surface-3" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
          {badge}
        </div>
        {preview && (
          <p className="mt-1 truncate text-xs text-muted">{preview}</p>
        )}
      </a>
    </li>
  );
}
