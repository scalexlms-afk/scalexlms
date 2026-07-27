"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  Checks,
  PaperPlaneTilt,
  Paperclip,
  Smiley,
} from "@phosphor-icons/react";
import { createClient } from "@scalex/db/client";
import { MessageActionBar } from "@/components/messages/message-action-bar";
import {
  formatMessageClock,
  mentorInitials,
  type ChatMessageRow,
  type MentorSummary,
} from "@/lib/messages-shared";

export function ChatWindow({
  userId,
  mentor,
  initialMessages,
  sendAction,
  markReadAction,
}: {
  userId: string;
  mentor: MentorSummary;
  initialMessages: ChatMessageRow[];
  sendAction: (content: string) => Promise<void>;
  markReadAction?: () => Promise<void>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const threadRef = useRef<HTMLDivElement>(null);
  const peerId = mentor.id;

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    void markReadAction?.();
  }, [markReadAction, peerId]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm-${userId}-${peerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as ChatMessageRow;
          const involves =
            (row.sender_id === userId && row.recipient_id === peerId) ||
            (row.sender_id === peerId && row.recipient_id === userId);
          if (!involves) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            const withoutTemp = prev.filter(
              (m) =>
                !(
                  m.id.startsWith("temp-") &&
                  m.sender_id === row.sender_id &&
                  m.content === row.content
                )
            );
            return [...withoutTemp, row];
          });
          if (row.recipient_id === userId) {
            void markReadAction?.();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, peerId, markReadAction]);

  const onSubmit = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setError(null);
      setDraft("");
      const optimistic: ChatMessageRow = {
        id: `temp-${Date.now()}`,
        content: trimmed,
        created_at: new Date().toISOString(),
        sender_id: userId,
        recipient_id: peerId,
      };
      setMessages((prev) => [...prev, optimistic]);
      startTransition(async () => {
        try {
          await sendAction(trimmed);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to send");
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setDraft(trimmed);
        }
      });
    },
    [peerId, sendAction, userId]
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit(draft);
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-accent-purple/20 bg-surface-2/40 lg:h-[min(78vh,720px)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {mentor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.avatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-semibold text-accent-purple ring-1 ring-line">
              {mentorInitials(mentor.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-foreground md:text-base">
                {mentor.name}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-accent-green">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden />
                Online
              </span>
            </div>
            <p className="truncate text-xs text-muted">
              Amazon FBA Expert &amp; ScaleX Mentor
            </p>
          </div>
        </div>
        <span
          title="Profile coming soon"
          className="hidden shrink-0 rounded-xl border border-line px-3 py-2 text-xs font-medium text-subtle/80 sm:inline-flex"
        >
          Profile · Soon
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={threadRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5"
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-center">
              <p className="max-w-sm text-sm text-muted">
                No messages yet. Say hello to {mentor.name} — they&apos;re here
                to review tasks and guide your launch.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const mine = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      mine
                        ? "bg-accent-purple text-white"
                        : "border border-line bg-surface-3/80 text-foreground"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                        mine ? "text-white/70" : "text-subtle"
                      }`}
                    >
                      {formatMessageClock(msg.created_at)}
                      {mine ? (
                        <Checks
                          weight="bold"
                          className="h-3.5 w-3.5"
                          aria-hidden
                        />
                      ) : null}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error ? (
          <p className="shrink-0 px-4 text-sm text-accent-danger md:px-5">{error}</p>
        ) : null}

        <div className="shrink-0 border-t border-line px-4 py-3 md:px-5">
          <MessageActionBar />

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="rounded-2xl border border-line bg-surface/80 p-2 focus-within:border-accent-purple/50">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void onSubmit(draft);
                  }
                }}
                rows={4}
                placeholder="Type your message…"
                disabled={pending}
                className="min-h-[6.5rem] w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-subtle"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="inline-flex cursor-default items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-subtle/70"
                  >
                    <Paperclip className="h-3.5 w-3.5" aria-hidden />
                    <span className="hidden sm:inline">Attach</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="inline-flex cursor-default items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-subtle/70"
                  >
                    <Smiley className="h-3.5 w-3.5" aria-hidden />
                    <span className="hidden sm:inline">Emoji</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={pending || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-purple/90 disabled:opacity-50"
                >
                  <PaperPlaneTilt weight="fill" className="h-4 w-4" aria-hidden />
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
