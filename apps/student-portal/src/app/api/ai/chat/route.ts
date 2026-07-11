import { createClient } from "@scalex/db/server";
import { streamChat, type ChatMessage } from "@scalex/ai";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as { chatId?: string; message?: string };
  const message = body.message?.trim();

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  let chatId = body.chatId;

  if (!chatId) {
    const { data: chat, error } = await supabase
      .from("ai_chats")
      .insert({ student_id: user.id, title: message.slice(0, 80) } as never)
      .select("id")
      .single();

    if (error || !chat) {
      return new Response(error?.message ?? "Failed to create chat", {
        status: 500,
      });
    }

    chatId = (chat as { id: string }).id;
  }

  const { error: userMessageError } = await supabase
    .from("ai_chat_messages")
    .insert({ chat_id: chatId, role: "user", content: message } as never);

  if (userMessageError) {
    return new Response(userMessageError.message, { status: 500 });
  }

  const { data: history } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const messages: ChatMessage[] = ((history ?? []) as { role: string; content: string }[])
    .filter((row) => row.role === "user" || row.role === "assistant")
    .map((row) => ({
      role: row.role as "user" | "assistant",
      content: row.content,
    }));

  const stream = await streamChat(
    messages,
    supabase as unknown as Parameters<typeof streamChat>[1]
  );
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
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Chat-Id": chatId,
    },
  });
}
