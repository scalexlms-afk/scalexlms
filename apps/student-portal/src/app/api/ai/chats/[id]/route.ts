import { createClient } from "@scalex/db/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: chat } = await supabase
    .from("ai_chats")
    .select("id, title")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  const filtered = ((messages ?? []) as { role: string; content: string }[])
    .filter((row) => row.role === "user" || row.role === "assistant")
    .map((row) => ({
      role: row.role as "user" | "assistant",
      content: row.content,
    }));

  return NextResponse.json({
    id: (chat as { id: string; title: string | null }).id,
    title: (chat as { id: string; title: string | null }).title,
    messages: filtered,
  });
}
