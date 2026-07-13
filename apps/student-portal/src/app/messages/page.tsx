import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { MentorChatPanel } from "@/components/mentor-chat-panel";
import { requireStudentProfile } from "@/lib/auth";
import { createClient } from "@scalex/db/server";
import { isPremiumPlan } from "@scalex/db";
import { Card } from "@scalex/ui";
import {
  markMentorMessagesReadAction,
  sendMentorMessageAction,
} from "./actions";

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
    profile.mentor_id
      ? supabase
          .from("messages")
          .select(
            "id, content, created_at, sender_id, recipient_id, sender:profiles!sender_id(name)"
          )
          .or(
            `and(sender_id.eq.${userId},recipient_id.eq.${profile.mentor_id}),and(sender_id.eq.${profile.mentor_id},recipient_id.eq.${userId})`
          )
          .order("created_at", { ascending: true })
          .limit(100)
      : Promise.resolve({ data: [] }),
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
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Messages
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Mentor chat
          </h1>
          <p className="mt-1 text-muted">
            {premium
              ? `Private chat with ${mentorName}.`
              : "Private mentor messaging is included in the Premium Launch Program."}
          </p>
        </div>

        {params.error && (
          <Card className="border-scalex-red/40 bg-scalex-red/5">
            <p className="text-sm text-scalex-red">{params.error}</p>
          </Card>
        )}

        {!premium ? (
          <Card>
            <p className="text-sm text-muted">
              Upgrade to Premium for private mentor messaging and live
              mentorship calls.
            </p>
            <Link
              href="/payment?mode=upgrade"
              className="mt-3 inline-block text-sm font-medium text-scalex-red hover:underline"
            >
              Upgrade to Premium →
            </Link>
          </Card>
        ) : !profile.mentor_id ? (
          <Card>
            <p className="text-sm text-muted">
              No mentor is assigned yet.{" "}
              <Link href="/support" className="text-scalex-red hover:underline">
                Open a support ticket
              </Link>
              .
            </p>
          </Card>
        ) : (
          <MentorChatPanel
            userId={userId}
            peerId={profile.mentor_id}
            peerName={mentorName}
            initialMessages={(messages ?? []) as never}
            sendAction={sendMentorMessageAction}
            markReadAction={markMentorMessagesReadAction}
          />
        )}
      </div>
    </PortalShell>
  );
}
