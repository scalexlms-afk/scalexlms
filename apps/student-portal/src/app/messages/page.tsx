import { PortalShell } from "@/components/portal-shell";
import { TextArea } from "@/components/field";
import { requireStudentProfile } from "@/lib/auth";
import { createClient } from "@scalex/db/server";
import { Button, Card } from "@scalex/ui";
import { sendMentorMessageAction } from "./actions";

export default async function MessagesPage() {
  const { userId, profile } = await requireStudentProfile();
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id, content, created_at, sender_id, recipient_id, sender:profiles!sender_id(name)"
    )
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <PortalShell activePath="/messages">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Messages
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Mentor messages
          </h1>
          <p className="mt-1 text-muted">
            Message your assigned mentor about tasks, sourcing, or launch blockers.
          </p>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Send a message</h2>
          {!profile.mentor_id ? (
            <p className="mt-3 text-sm text-muted">
              No mentor is assigned yet. You can still open a support ticket.
            </p>
          ) : (
            <form action={sendMentorMessageAction} className="mt-4 space-y-4">
              <TextArea label="Message" name="content" rows={4} required />
              <Button type="submit">Send to mentor</Button>
            </form>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Conversation</h2>
          {(messages ?? []).length === 0 ? (
            <Card>
              <p className="text-sm text-muted">No messages yet.</p>
            </Card>
          ) : (
            (messages ?? []).map((msg) => {
              const row = msg as {
                id: string;
                content: string;
                created_at: string;
                sender_id: string;
                sender: { name: string } | null;
              };
              const mine = row.sender_id === userId;
              return (
                <Card key={row.id}>
                  <p className="text-xs text-subtle">
                    {mine ? "You" : row.sender?.name ?? "Mentor"} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{row.content}</p>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PortalShell>
  );
}
