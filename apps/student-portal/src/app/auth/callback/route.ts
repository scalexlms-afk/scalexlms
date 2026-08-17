import { NextResponse } from "next/server";
import { createClient } from "@scalex/db/server";
import { safeRelativePath } from "@/lib/site";
import { setScalexNavCookies } from "@/lib/nav-cookies";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRelativePath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();
        const row = profile as { role?: string; status?: string } | null;
        await setScalexNavCookies(row?.role ?? "student", row?.status ?? "pending");
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
