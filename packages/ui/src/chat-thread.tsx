"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

export function ChatThread({
  children,
  empty,
}: {
  children: ReactNode;
  empty?: ReactNode;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [children]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!hasChildren ? empty : children}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export function ChatComposer({
  onSubmit,
  disabled,
  placeholder = "Type a message…",
}: {
  onSubmit: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const content = String(data.get("content") ?? "").trim();
    if (!content || disabled) return;
    form.reset();
    await onSubmit(content);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex gap-3 border-t border-line pt-4"
    >
      <input
        name="content"
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-scalex-red focus:ring-2 focus:ring-scalex-red/20 disabled:opacity-60"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-lg bg-scalex-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        Send
      </button>
    </form>
  );
}
