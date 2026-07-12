import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@scalex/db/types";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/reset-password",
  "/auth/callback",
  "/",
];
const SEO_ROUTES = [
  "/robots.txt",
  "/sitemap.xml",
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SEO_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}?`))) {
    return NextResponse.next();
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

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isPayment = PAYMENT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPaymentApi = PAYMENT_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  };

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

  // Redirect away from auth/payment pages if already active
  if (profileData?.status === "active") {
    if (isAuthPage || (isPayment && pathname !== "/payment/success")) {
      return redirectTo("/dashboard");
    }
  }

  if (profileData?.role !== "student" && !isPublic && !isPayment && !isPaymentApi && !isAuthPage) {
    return redirectTo("/unauthorized");
  }

  if (
    profileData?.status !== "active" &&
    !isPublic &&
    !isPayment &&
    !isPaymentApi &&
    !isAuthPage
  ) {
    return redirectTo("/payment");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
