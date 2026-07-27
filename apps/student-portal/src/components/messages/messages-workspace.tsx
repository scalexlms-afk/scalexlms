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
    <div className="messages-theme flex h-full min-h-0 flex-col">
      <h1 className="mb-3 shrink-0 font-display text-xl font-bold text-foreground lg:hidden">
        Mentor Chat
      </h1>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(260px,300px)] lg:items-stretch">
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
          <div className="hidden h-full min-h-0 lg:block">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              fillHeight
            />
          </div>
        </div>

        <div className="order-1 min-h-[min(70vh,640px)] min-w-0 lg:order-2 lg:h-full lg:min-h-0">
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
