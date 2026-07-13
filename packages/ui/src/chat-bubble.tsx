import type { ReactNode } from "react";

export function ChatBubble({
  mine,
  author,
  timestamp,
  children,
}: {
  mine?: boolean;
  author?: string;
  timestamp?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
          mine
            ? "bg-scalex-red/15 text-foreground"
            : "bg-surface-3 text-foreground"
        }`}
      >
        {(author || timestamp) && (
          <p className="mb-1 text-[11px] text-subtle">
            {[author, timestamp].filter(Boolean).join(" · ")}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
