import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@scalex/db/types";
import {
  SCALEX_ROLE_COOKIE,
  SCALEX_STATUS_COOKIE,
  hasSupabaseAuthCookie,
  scalexNavCookieOptions,
} from "@scalex/db/nav-cookies";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/reset-password",
  "/update-password",
  "/auth/callback",
  "/unauthorized",
  "/",
  "/blog",
];
const SEO_ROUTES = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
];
const PAYMENT_ROUTES = ["/payment", "/payment/success", "/payment/cancel"];
const PAYMENT_API_ROUTES = ["/api/stripe/checkout", "/api/stripe/activate"];

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function attachNavCookies(
  response: NextResponse,
  role: string,
  status: string
) {
  const opts = scalexNavCookieOptions();
  response.cookies.set(SCALEX_ROLE_COOKIE, role, opts);
  response.cookies.set(SCALEX_STATUS_COOKIE, status, opts);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SEO_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}?`))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isPayment = PAYMENT_ROUTES.some((route) => pathname.startsWith(route));
  const isPaymentApi = PAYMENT_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  const hasAuth = hasSupabaseAuthCookie(request.cookies.getAll());
  const roleCookie = request.cookies.get(SCALEX_ROLE_COOKIE)?.value;
  const statusCookie = request.cookies.get(SCALEX_STATUS_COOKIE)?.value;

  const redirectTo = (path: string, from: NextResponse) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(from, redirectResponse);
    return redirectResponse;
  };

  const gateProfile = (
    role: string | undefined,
    status: string | undefined,
    response: NextResponse
  ) => {
    if (status === "active") {
      const paymentMode = request.nextUrl.searchParams.get("mode");
      const allowActivePayment =
        pathname === "/payment/success" ||
        (pathname === "/payment" &&
          (paymentMode === "remaining" || paymentMode === "upgrade"));

      if (isAuthPage || (isPayment && !allowActivePayment)) {
        return redirectTo("/dashboard", response);
      }
    }

    if (role !== "student" && !isPublic && !isPayment && !isPaymentApi && !isAuthPage) {
      return redirectTo("/unauthorized", response);
    }

    if (
      status !== "active" &&
      !isPublic &&
      !isPayment &&
      !isPaymentApi &&
      !isAuthPage
    ) {
      return redirectTo("/payment", response);
    }

    return response;
  };

  if (hasAuth && roleCookie && statusCookie === "active") {
    return gateProfile(roleCookie, statusCookie, NextResponse.next({ request }));
  }

  if (!hasAuth) {
    if (!isPublic && !isPayment && !isPaymentApi) {
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
    if (!isPublic && !isPayment && !isPaymentApi) {
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
    .select("status, role")
    .eq("id", user.id)
    .single();

  const profileData = profile as { status: string; role: string } | null;
  if (profileData?.role && profileData.status) {
    attachNavCookies(supabaseResponse, profileData.role, profileData.status);
  }

  return gateProfile(profileData?.role, profileData?.status, supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
