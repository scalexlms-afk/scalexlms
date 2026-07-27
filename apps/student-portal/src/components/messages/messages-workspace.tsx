"use client";

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
  return (
    <div className="messages-theme space-y-6">
      <MessagesHero />

      <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_220px] xl:grid-cols-[210px_minmax(0,1fr)_240px] 2xl:grid-cols-[220px_minmax(0,1fr)_260px] lg:items-start">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="lg:hidden">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
              collapsible
            />
          </div>
          <div className="hidden lg:block">
            <ConversationRail
              mentor={data.mentor}
              unreadFromMentor={data.unreadFromMentor}
              lastMessagePreview={data.lastMessagePreview}
              lastMessageAt={data.lastMessageAt}
            />
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <ChatWindow
            userId={data.userId}
            mentor={data.mentor}
            initialMessages={data.messages}
            sendAction={sendAction}
            markReadAction={markReadAction}
          />
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
