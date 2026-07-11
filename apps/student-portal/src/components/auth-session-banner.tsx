import Link from "next/link";
import { createClient } from "@scalex/db/server";
import { Button } from "@scalex/ui";

export async function AuthSessionBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, email")
    .eq("id", user.id)
    .single();

  const profileData = profile as { status: string; email: string } | null;

  if (!profileData) return null;

  if (profileData.status === "active") {
    return (
      <div className="mb-4 rounded-lg bg-accent-green/10 px-3 py-2 text-sm text-accent-green">
        Signed in as {profileData.email}.{" "}
        <Link href="/dashboard" className="underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-3 rounded-lg bg-accent-amber/10 px-3 py-3 text-sm text-accent-amber">
      <p>
        You&apos;re already signed in as {profileData.email}. Complete payment
        to activate your account, or sign out to use a different account.
      </p>
      <div className="flex gap-2">
        <Link href="/payment">
          <Button size="sm">Continue to Payment</Button>
        </Link>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
