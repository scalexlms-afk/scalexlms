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

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px] lg:items-start">
        <ConversationRail
          mentor={data.mentor}
          unreadFromMentor={data.unreadFromMentor}
          lastMessagePreview={data.lastMessagePreview}
          lastMessageAt={data.lastMessageAt}
        />

        <div className="min-w-0">
          <ChatWindow
            userId={data.userId}
            mentor={data.mentor}
            initialMessages={data.messages}
            sendAction={sendAction}
            markReadAction={markReadAction}
          />
        </div>

        <MessagesRail
          mentor={data.mentor}
          context={data.context}
          recentSubmissions={data.recentSubmissions}
        />
      </div>
    </div>
  );
}
