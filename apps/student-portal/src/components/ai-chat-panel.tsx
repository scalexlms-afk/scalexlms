"use client";

import { useRef, useState } from "react";
import { Button, Card } from "@scalex/ui";
import { inputClasses } from "@/components/field";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
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

      if (!response.ok) {
        throw new Error("Failed to reach AI mentor");
      }

      const headerChatId = response.headers.get("X-Chat-Id");
      if (headerChatId) setChatId(headerChatId);

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

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) =>
        prev.filter(
          (_, index) =>
            index < prev.length - 1 || prev[prev.length - 1]?.role !== "assistant"
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-semibold">Ask your AI mentor</p>
            <p className="mt-2 max-w-md text-sm text-text-secondary-dark">
              Get help with product research, sourcing, PPC, and any lesson
              topic from the LaunchPad curriculum.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-scalex-red/15 text-text-primary-dark"
                    : "bg-scalex-charcoal-alt text-text-primary-dark"
                }`}
              >
                {message.content || (streaming ? "…" : "")}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-3 text-sm text-accent-danger">{error}</p>
      )}

      <form onSubmit={sendMessage} className="mt-4 flex gap-3 border-t border-white/[0.06] pt-4">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your Amazon journey…"
          className={inputClasses}
          disabled={streaming}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          {streaming ? "Thinking…" : "Send"}
        </Button>
      </form>
    </Card>
  );
}
