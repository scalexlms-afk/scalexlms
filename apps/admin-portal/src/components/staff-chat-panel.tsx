"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ChatBubble, ChatComposer, ChatThread, Card } from "@scalex/ui";
import { createClient } from "@scalex/db/client";

export type ChatMessageRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
};

export function StaffChatPanel({
  userId,
  peerId,
  peerName,
  initialMessages,
  sendAction,
  markReadAction,
}: {
  userId: string;
  peerId: string;
  peerName: string;
  initialMessages: ChatMessageRow[];
  sendAction: (content: string) => Promise<void>;
  markReadAction?: () => Promise<void>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    void markReadAction?.();
  }, [markReadAction, peerId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`staff-dm-${userId}-${peerId}`)
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
            return [...prev, row];
          });
          if (row.recipient_id === userId) void markReadAction?.();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, peerId, markReadAction]);

  const onSubmit = useCallback(
    async (content: string) => {
      setError(null);
      const optimistic: ChatMessageRow = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        sender_id: userId,
        recipient_id: peerId,
      };
      setMessages((prev) => [...prev, optimistic]);
      startTransition(async () => {
        try {
          await sendAction(content);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to send");
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        }
      });
    },
    [peerId, sendAction, userId]
  );

  return (
    <Card className="flex h-[min(70vh,640px)] flex-col">
      <ChatThread
        empty={
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-muted">
              No messages yet. Send the first reply to {peerName}.
            </p>
          </div>
        }
      >
        {messages.map((msg) => {
          const mine = msg.sender_id === userId;
          return (
            <ChatBubble
              key={msg.id}
              mine={mine}
              author={mine ? "You" : peerName}
              timestamp={new Date(msg.created_at).toLocaleString()}
            >
              {msg.content}
            </ChatBubble>
          );
        })}
      </ChatThread>
      {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}
      <ChatComposer onSubmit={onSubmit} disabled={pending} />
    </Card>
  );
}
