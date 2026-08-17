import { cookies } from "next/headers";
import {
  SCALEX_ROLE_COOKIE,
  scalexNavCookieOptions,
} from "@scalex/db/nav-cookies";

export { SCALEX_ROLE_COOKIE, scalexNavCookieOptions } from "@scalex/db/nav-cookies";

export async function setScalexRoleCookie(role: string) {
  const jar = await cookies();
  jar.set(SCALEX_ROLE_COOKIE, role, scalexNavCookieOptions());
}

export async function clearScalexNavCookies() {
  const jar = await cookies();
  jar.set(SCALEX_ROLE_COOKIE, "", {
    ...scalexNavCookieOptions(),
    maxAge: 0,
  });
}
