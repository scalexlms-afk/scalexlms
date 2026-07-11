import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@scalex/db/types";
import type OpenAI from "openai";
import { createLongCatClient, longCatModel } from "./client";
import { formatContext, retrieveContext } from "./context";

const ACADEMY_SYSTEM_PROMPT = `You are the ScaleX LaunchPad AI assistant for Amazon FBA students.

Use the academy lesson excerpts below to ground your answers. Prefer that content when it is relevant.
If the excerpts do not cover the question, say what is missing and give concise, practical guidance.
Do not invent lesson titles or curriculum details that are not in the excerpts.`;

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function getLatestUserQuery(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      if (typeof message.content === "string") {
        return message.content;
      }

      if (Array.isArray(message.content)) {
        return message.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n");
      }
    }
  }

  return "";
}

async function buildGroundedMessages(
  messages: ChatMessage[],
  supabase: SupabaseClient<Database>
): Promise<ChatMessage[]> {
  const query = getLatestUserQuery(messages);
  const context = await retrieveContext(query, supabase);

  return [
    {
      role: "system",
      content: `${ACADEMY_SYSTEM_PROMPT}\n\n--- Academy content ---\n${formatContext(context)}`,
    },
    ...messages,
  ];
}

export async function chatCompletion(
  messages: ChatMessage[],
  supabase: SupabaseClient<Database>,
  options?: { model?: string }
): Promise<string> {
  const client = createLongCatClient();
  const groundedMessages = await buildGroundedMessages(messages, supabase);

  const response = await client.chat.completions.create({
    model: options?.model ?? longCatModel,
    messages: groundedMessages,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function streamChat(
  messages: ChatMessage[],
  supabase: SupabaseClient<Database>,
  options?: { model?: string }
): Promise<AsyncIterable<string>> {
  const client = createLongCatClient();
  const groundedMessages = await buildGroundedMessages(messages, supabase);

  const stream = await client.chat.completions.create({
    model: options?.model ?? longCatModel,
    messages: groundedMessages,
    stream: true,
  });

  async function* iterateStream(): AsyncIterable<string> {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;

      if (delta) {
        yield delta;
      }
    }
  }

  return iterateStream();
}
