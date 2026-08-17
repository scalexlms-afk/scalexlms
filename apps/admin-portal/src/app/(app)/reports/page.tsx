import { redirect } from "next/navigation";

/** Photo IA uses Analytics; keep /reports as alias. */
export default function ReportsAliasPage() {
  redirect("/analytics");
}
