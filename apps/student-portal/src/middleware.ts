import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@scalex/db/types";
import { hasSupabaseAuthCookie } from "@scalex/db/nav-cookies";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/unauthorized",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
]);

const PUBLIC_PREFIXES = [
  "/blog",
  "/auth",
  "/reset-password/",
  "/update-password",
  "/api/stripe/webhook",
  "/api/cron",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function loginRedirect(request: NextRequest, from?: NextResponse) {
  const url = request.nextUrl.clone();
  const dest = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("redirect", dest);
  const response = NextResponse.redirect(url);
  if (from) copyCookies(from, response);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const hasAuth = hasSupabaseAuthCookie(request.cookies.getAll());

  let supabaseResponse = NextResponse.next({ request });
  supabaseResponse.headers.set("x-scalex-pathname", pathname);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          supabaseResponse.headers.set("x-scalex-pathname", pathname);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always refresh the JWT so mid-session navigations keep a live session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    return loginRedirect(request, supabaseResponse);
  }

  if (!hasAuth && !user && !isPublic) {
    return loginRedirect(request, supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
