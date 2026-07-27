"use client";

import type { AiChatSummary } from "@/lib/ai-mentor";

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentChats({
  chats,
  activeChatId,
  onSelect,
  onViewAll,
}: {
  chats: AiChatSummary[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onViewAll?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Recent conversations
        </p>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-accent-purple hover:underline"
          >
            View all
          </button>
        ) : null}
      </div>
      {chats.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-line bg-surface-2/30 px-4 py-5 text-center">
          <p className="text-sm text-muted">No conversations yet</p>
          <p className="mt-1 text-xs text-subtle">
            Ask a question to start your first chat.
          </p>
        </div>
      ) : (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {chats.map((chat) => {
            const active = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelect(chat.id)}
                className={`min-w-[160px] shrink-0 rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-accent-purple/50 bg-accent-purple/10"
                    : "border-line bg-surface-2/50 hover:border-accent-purple/30"
                }`}
              >
                <span className="line-clamp-1 text-sm font-medium text-foreground">
                  {chat.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">
                  {formatRelative(chat.updatedAt)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
