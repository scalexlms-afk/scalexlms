"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CheckCircle,
  ListChecks,
  MagnifyingGlass,
  Microphone,
  PaperPlaneTilt,
  Paperclip,
  Robot,
  ThumbsDown,
  ThumbsUp,
  User,
  Lightbulb,
} from "@phosphor-icons/react";
import { AiMentorHero } from "@/components/ai-mentor/ai-mentor-hero";
import { AiMentorRail } from "@/components/ai-mentor/ai-mentor-rail";
import { RecentChats } from "@/components/ai-mentor/recent-chats";
import {
  SuggestedPrompts,
  buildSuggestedPrompts,
} from "@/components/ai-mentor/suggested-prompts";
import type { AiChatSummary, AiMentorContext } from "@/lib/ai-mentor";

type ChatMessage = { role: "user" | "assistant"; content: string };

type FeedbackChoice = "helpful" | "not_helpful" | "example" | "checklist";

function AssistantFeedbackChips({
  messageKey,
  disabled,
  onAction,
}: {
  messageKey: string;
  disabled?: boolean;
  onAction: (choice: FeedbackChoice) => void;
}) {
  const [picked, setPicked] = useState<FeedbackChoice | null>(null);

  const chips: Array<{
    id: FeedbackChoice;
    label: string;
    Icon: typeof ThumbsUp;
  }> = [
    { id: "helpful", label: "Helpful", Icon: ThumbsUp },
    { id: "not_helpful", label: "Not helpful", Icon: ThumbsDown },
    { id: "example", label: "Show example", Icon: Lightbulb },
    { id: "checklist", label: "Checklist", Icon: ListChecks },
  ];

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 pl-10">
      {chips.map(({ id, label, Icon }) => {
        const active = picked === id;
        return (
          <button
            key={`${messageKey}-${id}`}
            type="button"
            disabled={disabled || (picked !== null && !active)}
            onClick={() => {
              setPicked(id);
              onAction(id);
            }}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
              active
                ? "border-accent-purple/50 bg-accent-purple/15 text-accent-purple"
                : "border-line bg-surface-3/40 text-muted hover:border-accent-purple/30 hover:text-foreground disabled:opacity-50"
            }`}
          >
            {active && id === "helpful" ? (
              <CheckCircle weight="fill" className="h-3 w-3" aria-hidden />
            ) : (
              <Icon weight="bold" className="h-3 w-3" aria-hidden />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function AiMentorWorkspace({
  context,
  initialPrompt = "",
  initialChats,
}: {
  context: AiMentorContext;
  initialPrompt?: string;
  initialChats: AiChatSummary[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState(initialChats);
  const [streaming, setStreaming] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [chatSearch, setChatSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggested = useMemo(
    () => buildSuggestedPrompts(context.milestoneTitle),
    [context.milestoneTitle]
  );

  const filteredChats = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, chatSearch]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (initialPrompt.trim()) {
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  function startNewChat() {
    setChatId(null);
    setMessages([]);
    setInput("");
    setError(null);
    setShowPrompts(true);
    inputRef.current?.focus();
  }

  async function loadChat(id: string) {
    if (streaming || loadingChat) return;
    setLoadingChat(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/chats/${id}`);
      if (!res.ok) throw new Error("Could not load conversation");
      const data = (await res.json()) as {
        messages: ChatMessage[];
      };
      setChatId(id);
      setMessages(data.messages);
      queueMicrotask(scrollToBottom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    } finally {
      setLoadingChat(false);
    }
  }

  async function sendText(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || streaming) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: trimmed }),
      });

      if (!response.ok) throw new Error("Failed to reach AI mentor");

      const headerChatId = response.headers.get("X-Chat-Id");
      if (headerChatId) {
        setChatId(headerChatId);
        setChats((prev) => {
          const exists = prev.some((c) => c.id === headerChatId);
          if (exists) {
            return [
              {
                id: headerChatId,
                title: trimmed.slice(0, 80),
                updatedAt: new Date().toISOString(),
              },
              ...prev.filter((c) => c.id !== headerChatId),
            ];
          }
          return [
            {
              id: headerChatId,
              title: trimmed.slice(0, 80),
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 8);
        });
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: assistantText };
          }
          return next;
        });
      }

      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => {
        const withoutEmptyAssistant = [...prev];
        const last = withoutEmptyAssistant[withoutEmptyAssistant.length - 1];
        if (last?.role === "assistant" && !last.content) {
          withoutEmptyAssistant.pop();
        }
        return withoutEmptyAssistant;
      });
    } finally {
      setStreaming(false);
    }
  }

  function onFeedback(choice: FeedbackChoice) {
    if (choice === "example") {
      void sendText(
        `Show a practical real-world example related to the ${context.milestoneTitle} milestone from ScaleX curriculum.`
      );
      return;
    }
    if (choice === "checklist") {
      void sendText(
        `Generate a practical checklist for completing "${context.currentTaskTitle ?? context.milestoneTitle}" in ${context.milestoneTitle}.`
      );
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendText(input);
  }

  const busy = streaming || loadingChat;
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant" && messages[i]?.content) return i;
    }
    return -1;
  })();

  return (
    <div className="ai-mentor-theme space-y-6">
      <AiMentorHero
        milestoneTitle={context.milestoneTitle}
        onNewChat={startNewChat}
      />

      {showPrompts ? (
        <SuggestedPrompts
          prompts={suggested}
          disabled={busy}
          onSelect={(prompt) => void sendText(prompt)}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-h-[min(70vh,560px)] flex-1 flex-col rounded-2xl border border-line bg-surface-2/40">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-5">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-purple/15 text-accent-purple">
                    <Robot weight="duotone" className="h-7 w-7" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-lg font-semibold">
                    Ask LaunchPad AI anything
                  </p>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Grounded in ScaleX curriculum for {context.milestoneTitle}. Use
                    a suggested prompt or type your own question.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={`${message.role}-${index}`}>
                    <div
                      className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" ? (
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple">
                          <Robot weight="fill" className="h-4 w-4" aria-hidden />
                        </span>
                      ) : null}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                          message.role === "user"
                            ? "bg-accent-purple text-white"
                            : "border border-line bg-surface-3/80 text-foreground"
                        }`}
                      >
                        {message.content || (streaming ? "…" : "")}
                      </div>
                      {message.role === "user" ? (
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-muted">
                          <User weight="fill" className="h-4 w-4" aria-hidden />
                        </span>
                      ) : null}
                    </div>
                    {message.role === "assistant" &&
                    message.content &&
                    index === lastAssistantIndex &&
                    !streaming ? (
                      <AssistantFeedbackChips
                        messageKey={`${chatId ?? "new"}-${index}`}
                        disabled={busy}
                        onAction={onFeedback}
                      />
                    ) : null}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {error ? (
              <p className="px-4 text-sm text-accent-danger md:px-5">{error}</p>
            ) : null}

            <form
              onSubmit={onSubmit}
              className="border-t border-line px-4 py-4 md:px-5"
            >
              <div className="rounded-2xl border border-line bg-surface/80 p-2 focus-within:border-accent-purple/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendText(input);
                    }
                  }}
                  rows={2}
                  placeholder="Ask anything about your Amazon journey…"
                  disabled={busy}
                  className="w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-subtle"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
                  <div className="flex items-center gap-1">
                    <span
                      title="Coming soon"
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-subtle/70"
                    >
                      <Paperclip className="h-3.5 w-3.5" aria-hidden />
                      Attach
                      <span className="text-[10px]">Soon</span>
                    </span>
                    <span
                      title="Coming soon"
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-subtle/70"
                    >
                      <Microphone className="h-3.5 w-3.5" aria-hidden />
                      Voice
                      <span className="text-[10px]">Soon</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPrompts((v) => !v)}
                      aria-pressed={showPrompts}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        showPrompts
                          ? "bg-accent-purple/15 text-accent-purple"
                          : "text-accent-purple hover:bg-accent-purple/10"
                      }`}
                    >
                      Prompts
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-purple/90 disabled:opacity-50"
                  >
                    <PaperPlaneTilt weight="fill" className="h-4 w-4" aria-hidden />
                    {streaming ? "Thinking…" : "Send"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-subtle">
                AI responses are based on ScaleX curriculum and trusted sources.
                Always verify important information before taking action.
              </p>
            </form>
          </div>

          <div className="space-y-2">
            <label className="relative block">
              <MagnifyingGlass
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                aria-hidden
              />
              <input
                type="search"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-xl border border-line bg-surface-2/60 py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-subtle focus:border-accent-purple/50"
              />
            </label>
            <RecentChats
              chats={filteredChats}
              activeChatId={chatId}
              onSelect={(id) => void loadChat(id)}
              onViewAll={startNewChat}
            />
          </div>
        </div>

        <AiMentorRail
          context={context}
          disabled={busy}
          onAction={(prompt) => void sendText(prompt)}
        />
      </div>
    </div>
  );
}
