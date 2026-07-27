"use client";

import { ChatWindow } from "@/components/messages/chat-window";
import { ConversationRail } from "@/components/messages/conversation-rail";
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
  return (
    <div className="messages-theme lg:-mx-4 lg:-mb-4 xl:-mx-6">
      {/* Mobile: keep a compact title; desktop matches mockup (nav label only). */}
      <h1 className="mb-4 font-display text-xl font-bold text-foreground lg:hidden">
        Mentor Chat
      </h1>

      <div className="grid gap-3 lg:h-[calc(100dvh-4.25rem)] lg:grid-cols-[minmax(200px,0.85fr)_minmax(0,2fr)_minmax(240px,1.05fr)] lg:items-stretch xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,2.1fr)_minmax(260px,1fr)]">
        <div className="order-2 min-h-0 min-w-0 lg:order-1 lg:h-full">
          <div className="lg:hidden">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              collapsible
            />
          </div>
          <div className="hidden h-full lg:block">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              fillHeight
            />
          </div>
        </div>

        <div className="order-1 min-h-0 min-w-0 lg:order-2 lg:h-full">
          <ChatWindow
            userId={data.userId}
            mentor={data.mentor}
            initialMessages={data.messages}
            sendAction={sendAction}
            markReadAction={markReadAction}
          />
        </div>

        <div className="order-3 min-h-0 min-w-0 lg:order-3 lg:h-full">
          <MessagesRail
            mentor={data.mentor}
            context={data.context}
            recentSubmissions={data.recentSubmissions}
            fillHeight
          />
        </div>
      </div>
    </div>
  );
}
