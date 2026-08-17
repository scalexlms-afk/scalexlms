export const SCALEX_ROLE_COOKIE = "scalex-role";
export const SCALEX_STATUS_COOKIE = "scalex-status";

const ADMIN_ROLES = ["super_admin", "instructor", "mentor", "sales"] as const;

export type ScalexNavCookieOptions = {
  path: string;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
};

export function scalexNavCookieOptions(): ScalexNavCookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  };
}

export function hasSupabaseAuthCookie(
  cookies: Iterable<{ name: string; value: string }>
): boolean {
  for (const cookie of cookies) {
    if (cookie.name.includes("-auth-token") && cookie.value.length > 0) {
      return true;
    }
  }
  return false;
}

export function isScalexAdminRole(
  role: string | undefined | null
): role is (typeof ADMIN_ROLES)[number] {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}
