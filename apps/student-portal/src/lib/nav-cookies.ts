import { cookies } from "next/headers";
import {
  SCALEX_ROLE_COOKIE,
  SCALEX_STATUS_COOKIE,
  scalexNavCookieOptions,
} from "@scalex/db/nav-cookies";

export {
  SCALEX_ROLE_COOKIE,
  SCALEX_STATUS_COOKIE,
  scalexNavCookieOptions,
} from "@scalex/db/nav-cookies";

export async function setScalexNavCookies(role: string, status: string) {
  const jar = await cookies();
  const opts = scalexNavCookieOptions();
  jar.set(SCALEX_ROLE_COOKIE, role, opts);
  jar.set(SCALEX_STATUS_COOKIE, status, opts);
}

export async function clearScalexNavCookies() {
  const jar = await cookies();
  const opts = { ...scalexNavCookieOptions(), maxAge: 0 };
  jar.set(SCALEX_ROLE_COOKIE, "", opts);
  jar.set(SCALEX_STATUS_COOKIE, "", opts);
}
