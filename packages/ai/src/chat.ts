import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@scalex/db/types";
import type OpenAI from "openai";
import { createLongCatClient, longCatModel } from "./client";
import {
  formatContext,
  retrieveContext,
  retrieveCurriculumTitles,
} from "./context";

const ACADEMY_SYSTEM_PROMPT = `You are the ScaleX LaunchPad AI Mentor for Amazon FBA Private Label students.

Knowledge mix (follow this closely):
- ~80%: Prefer and ground answers in the ScaleX academy curriculum list and lesson excerpts provided below when they are relevant.
- ~20%: Use general ecommerce / Amazon FBA knowledge only to fill practical gaps the excerpts do not cover (for example LLC paperwork details if lessons focus on product research instead).

Hard rules:
- You DO have access to ScaleX academy materials listed below. Never say you lack academy content, cannot reference lessons, or that no materials were provided when the curriculum list or excerpts are present.
- When excerpts answer the question, lead with that academy guidance and cite lesson titles from the materials.
- If the academy only partially covers a topic, say what ScaleX covers, then add brief general guidance for the gap.
- Do not invent ScaleX-specific lesson titles that are not in the materials below.
- For "what courses / what do you offer / what do you have access to": summarize the curriculum lesson titles below and explain that ScaleX is an execution program (lessons → milestone tasks → mentor review), not a passive video library.
- Be practical, concise, and execution-oriented.`;

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
  const [context, curriculumTitles] = await Promise.all([
    retrieveContext(query, supabase),
    retrieveCurriculumTitles(supabase),
  ]);

  return [
    {
      role: "system",
      content: `${ACADEMY_SYSTEM_PROMPT}\n\n--- Academy content ---\n${formatContext(context, curriculumTitles)}`,
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
