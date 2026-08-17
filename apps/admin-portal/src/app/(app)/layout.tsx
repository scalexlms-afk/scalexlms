import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminChrome } from "@/components/admin-chrome";
import { SCALEX_ROLE_COOKIE } from "@scalex/db/nav-cookies";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = (await cookies()).get(SCALEX_ROLE_COOKIE)?.value ?? null;
  return <AdminChrome initialRole={role}>{children}</AdminChrome>;
}
