import { createClient } from "@scalex/db/server";
import { streamChat, type ChatMessage } from "@scalex/ai";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError("Please sign in again to chat with AI mentor.", 401);
    }

    const body = (await req.json()) as { chatId?: string; message?: string };
    const message = body.message?.trim();

    if (!message) {
      return jsonError("Message is required", 400);
    }

    if (!process.env.LONGCAT_API_KEY) {
      return jsonError(
        "AI mentor is not configured (LONGCAT_API_KEY missing). Contact support.",
        503
      );
    }

    let chatId = body.chatId;

    if (!chatId) {
      const { data: chat, error } = await supabase
        .from("ai_chats")
        .insert({ student_id: user.id, title: message.slice(0, 80) } as never)
        .select("id")
        .single();

      if (error || !chat) {
        return jsonError(error?.message ?? "Failed to create chat", 500);
      }

      chatId = (chat as { id: string }).id;
    }

    const { error: userMessageError } = await supabase
      .from("ai_chat_messages")
      .insert({ chat_id: chatId, role: "user", content: message } as never);

    if (userMessageError) {
      return jsonError(userMessageError.message, 500);
    }

    const { data: history } = await supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    const messages: ChatMessage[] = (
      (history ?? []) as { role: string; content: string }[]
    )
      .filter((row) => row.role === "user" || row.role === "assistant")
      .map((row) => ({
        role: row.role as "user" | "assistant",
        content: row.content,
      }));

    let stream: Awaited<ReturnType<typeof streamChat>>;
    try {
      stream = await streamChat(
        messages,
        supabase as unknown as Parameters<typeof streamChat>[1]
      );
    } catch (error) {
      const raw = error instanceof Error ? error.message : "AI mentor is unavailable";
      const friendly = raw.includes("LONGCAT_API_KEY")
        ? "AI mentor is not configured. Ask support if this persists."
        : raw;
      return jsonError(friendly, 503);
    }

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          await supabase.from("ai_chat_messages").insert({
            chat_id: chatId,
            role: "assistant",
            content: fullResponse,
          } as never);

          controller.close();
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Stream interrupted";
          try {
            controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
            controller.close();
          } catch {
            controller.error(error);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chatId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach AI mentor";
    return jsonError(message, 500);
  }
}
