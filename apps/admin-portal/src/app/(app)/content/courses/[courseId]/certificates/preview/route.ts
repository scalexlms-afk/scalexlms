import { requireAdminProfile } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import { generateCertificatePdf } from "@/lib/certificate-pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  await requireAdminProfile();
  const { courseId } = await context.params;
  const db = getServiceDb();
  const { data } = await db
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();

  const bytes = await generateCertificatePdf({
    studentName: "Alex Morgan",
    courseTitle: data?.title ?? "ScaleX Launch Program",
    issuedAt: new Date(),
  });

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'inline; filename="scalex-certificate-preview.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
