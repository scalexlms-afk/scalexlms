"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/messages/chat-window";
import { ConversationRail } from "@/components/messages/conversation-rail";
import { MessagesHero } from "@/components/messages/messages-hero";
import { MessagesRail } from "@/components/messages/messages-rail";
import type { MessagesPageData } from "@/lib/messages-shared";

export function MessagesWorkspace({
  data,
  sendAction,
  markReadAction,
}: {
  data: MessagesPageData;
  sendAction: (content: string) => Promise<void>;
  markReadAction?: () => Promise<void>;
}) {
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <div className="messages-theme space-y-4">
      <MessagesHero />

      <div className="grid gap-3 lg:grid-cols-[168px_minmax(0,1fr)_188px] xl:grid-cols-[180px_minmax(0,1fr)_200px] lg:items-start">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="lg:hidden">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              onOpenMentor={() => setThreadOpen(true)}
              mentorActive={threadOpen}
              collapsible
            />
          </div>
          <div className="hidden lg:block">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              onOpenMentor={() => setThreadOpen(true)}
              mentorActive={threadOpen}
            />
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          {threadOpen ? (
            <ChatWindow
              userId={data.userId}
              mentor={data.mentor}
              initialMessages={data.messages}
              sendAction={sendAction}
              markReadAction={markReadAction}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                Inbox
              </p>
              <p className="mt-2 text-sm text-muted">
                Select your mentor conversation to open the thread.
              </p>
              <button
                type="button"
                onClick={() => setThreadOpen(true)}
                className="mt-5 inline-flex rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-purple/90"
              >
                Open mentor chat
              </button>
            </div>
          )}
        </div>

        <div className="order-3 min-w-0 lg:order-3">
          <MessagesRail
            mentor={data.mentor}
            context={data.context}
            recentSubmissions={data.recentSubmissions}
          />
        </div>
      </div>
    </div>
  );
}
