import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { collectAccountExport } from "@/lib/account-export";

export async function GET() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await collectAccountExport(session.userId);
    const body = JSON.stringify(data, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="scalex-account-export-${session.userId.slice(0, 8)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
