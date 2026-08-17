import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@scalex/db/types";
import {
  SCALEX_ROLE_COOKIE,
  hasSupabaseAuthCookie,
  isScalexAdminRole,
  scalexNavCookieOptions,
} from "@scalex/db/nav-cookies";

const PUBLIC_ROUTES = ["/login", "/auth/callback", "/reset-password"];

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function attachRoleCookie(response: NextResponse, role: string) {
  response.cookies.set(SCALEX_ROLE_COOKIE, role, scalexNavCookieOptions());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isLogin = pathname === "/login";
  const hasAuth = hasSupabaseAuthCookie(request.cookies.getAll());
  const roleCookie = request.cookies.get(SCALEX_ROLE_COOKIE)?.value;

  const redirectTo = (path: string, from: NextResponse) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(from, redirectResponse);
    return redirectResponse;
  };

  const gateRole = (role: string | undefined, response: NextResponse) => {
    if (role === "student") {
      const studentPortalUrl =
        process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
      const redirectResponse = NextResponse.redirect(studentPortalUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    if (!isScalexAdminRole(role)) {
      if (isLogin) {
        return response;
      }

      if (!isPublic) {
        if (role) {
          return redirectTo("/forbidden", response);
        }

        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set(
          "error",
          "Account profile not found. Sign in with an admin staff account."
        );
        const redirectResponse = NextResponse.redirect(url);
        copyCookies(response, redirectResponse);
        return redirectResponse;
      }
    }

    if (isLogin && isScalexAdminRole(role)) {
      return redirectTo("/", response);
    }

    return response;
  };

  if (hasAuth && roleCookie) {
    return gateRole(roleCookie, NextResponse.next({ request }));
  }

  if (!hasAuth) {
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      const redirectResponse = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  if (role) {
    attachRoleCookie(supabaseResponse, role);
  }

  return gateRole(role, supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
