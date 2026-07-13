import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { TextArea } from "@/components/field";
import { requireStudentProfile } from "@/lib/auth";
import { createClient } from "@scalex/db/server";
import { isPremiumPlan } from "@scalex/db";
import { Button, Card } from "@scalex/ui";
import { sendMentorMessageAction } from "./actions";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { userId, profile } = await requireStudentProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const premium = isPremiumPlan(profile.plan);

  const [{ data: messages }, { data: mentor }] = await Promise.all([
    supabase
      .from("messages")
      .select(
        "id, content, created_at, sender_id, recipient_id, sender:profiles!sender_id(name)"
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(30),
    profile.mentor_id
      ? supabase
          .from("profiles")
          .select("id, name")
          .eq("id", profile.mentor_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const mentorName =
    (mentor as { name?: string } | null)?.name ?? "your mentor";

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
            {premium
              ? `Private chat with ${mentorName} about tasks, sourcing, or launch blockers.`
              : "Private mentor messaging is included in the Premium Launch Program."}
          </p>
        </div>

        {params.error && (
          <Card className="border-scalex-red/40 bg-scalex-red/5">
            <p className="text-sm text-scalex-red">{params.error}</p>
          </Card>
        )}
        {params.sent && (
          <Card className="border-accent-green/40 bg-accent-green/5">
            <p className="text-sm text-accent-green">
              Message sent to {mentorName}.
            </p>
          </Card>
        )}

        <Card>
          <h2 className="font-display text-lg font-semibold">Send a message</h2>
          {!premium ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted">
                Upgrade to Premium for private mentor messaging and live
                mentorship calls.
              </p>
              <Link
                href="/payment?mode=upgrade"
                className="inline-block text-sm font-medium text-scalex-red hover:underline"
              >
                Upgrade to Premium →
              </Link>
            </div>
          ) : !profile.mentor_id ? (
            <p className="mt-3 text-sm text-muted">
              No mentor is assigned yet.{" "}
              <Link href="/support" className="text-scalex-red hover:underline">
                Open a support ticket
              </Link>{" "}
              and our team will follow up.
            </p>
          ) : (
            <form action={sendMentorMessageAction} className="mt-4 space-y-4">
              <TextArea label="Message" name="content" rows={4} required />
              <Button type="submit">Send to {mentorName}</Button>
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
                  <p className="mt-1 whitespace-pre-wrap text-sm">{row.content}</p>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PortalShell>
  );
}
