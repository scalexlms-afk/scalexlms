import { notFound } from "next/navigation";
import { CERTIFICATES_BUCKET, MEDIA_SIGNED_URL_TTL } from "@scalex/db";
import { AdminPanel } from "@/components/admin-ui";
import { requireAdminProfile } from "@/lib/auth";
import { getServiceDb } from "@/lib/admin-db";
import {
  getCourseById,
  getCourseCertificates,
  getCourseStudents,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { canAccess } from "@scalex/db/rbac";
import { Button } from "@scalex/ui";
import {
  issueCertificateAction,
  issueEligibleCertificatesAction,
  regenerateCertificatePdfAction,
} from "./actions";

async function signCertificateUrl(
  pdfUrl: string | null
): Promise<string | null> {
  if (!pdfUrl) return null;
  if (pdfUrl.includes("://")) return pdfUrl;

  const db = getServiceDb();
  const { data, error } = await db.storage
    .from(CERTIFICATES_BUCKET)
    .createSignedUrl(pdfUrl, MEDIA_SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export default async function CourseCertificatesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { profile } = await requireAdminProfile();
  const canIssue = canAccess(profile.role, "course_content", "full");

  const [course, certificates, students] = await Promise.all([
    getCourseById(courseId),
    getCourseCertificates(courseId),
    getCourseStudents(courseId),
  ]);
  if (!course) notFound();

  const signedUrls = await Promise.all(
    certificates.map(async (row) => ({
      id: row.id,
      url: await signCertificateUrl(row.pdf_url),
    }))
  );
  const downloadById = new Map(signedUrls.map((s) => [s.id, s.url]));

  const issuedStudentIds = new Set(
    certificates.map((c) => c.student?.id).filter(Boolean) as string[]
  );
  const eligible = students.filter(
    (s) =>
      s.student &&
      Number(s.completion_percent ?? 0) >= 100 &&
      !issuedStudentIds.has(s.student.id)
  );

  return (
    <div className="space-y-4">
      <AdminPanel title="Certificates">
        {canIssue && eligible.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-3/40 px-3 py-2">
            <p className="text-sm text-muted">
              {eligible.length} student{eligible.length === 1 ? "" : "s"} at
              100% without a certificate.
            </p>
            <form action={issueEligibleCertificatesAction}>
              <input type="hidden" name="courseId" value={courseId} />
              <Button type="submit" size="sm">
                Issue all eligible
              </Button>
            </form>
          </div>
        ) : null}

        {certificates.length === 0 ? (
          <p className="text-sm text-muted">
            No certificates issued for this course yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-subtle">
                  <th className="px-2 py-2 font-semibold">Student</th>
                  <th className="px-2 py-2 font-semibold">Email</th>
                  <th className="px-2 py-2 font-semibold">Issued</th>
                  <th className="px-2 py-2 font-semibold">PDF</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((row) => {
                  const downloadUrl = downloadById.get(row.id) ?? null;
                  return (
                    <tr key={row.id} className="border-b border-line/60">
                      <td className="px-2 py-2.5">
                        {row.student?.name ?? "Unknown"}
                      </td>
                      <td className="px-2 py-2.5 text-muted">
                        {row.student?.email ?? "—"}
                      </td>
                      <td className="px-2 py-2.5 text-muted">
                        {formatDate(row.issued_at)}
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          {downloadUrl ? (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-scalex-red hover:underline"
                            >
                              Download
                            </a>
                          ) : row.pdf_url ? (
                            <span className="text-subtle">Unavailable</span>
                          ) : (
                            <span className="text-subtle">—</span>
                          )}
                          {canIssue && row.student?.id ? (
                            <form action={regenerateCertificatePdfAction}>
                              <input
                                type="hidden"
                                name="courseId"
                                value={courseId}
                              />
                              <input
                                type="hidden"
                                name="studentId"
                                value={row.student.id}
                              />
                              <button
                                type="submit"
                                className="text-xs text-muted hover:text-foreground"
                              >
                                Regenerate
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {canIssue ? (
        <AdminPanel title="Eligible to issue">
          {eligible.length === 0 ? (
            <p className="text-sm text-muted">
              No enrolled students at 100% completion without a certificate.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wider text-subtle">
                    <th className="px-2 py-2 font-semibold">Student</th>
                    <th className="px-2 py-2 font-semibold">Email</th>
                    <th className="px-2 py-2 font-semibold">Completion</th>
                    <th className="px-2 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {eligible.map((row) => (
                    <tr key={row.id} className="border-b border-line/60">
                      <td className="px-2 py-2.5">
                        {row.student?.name ?? "Unknown"}
                      </td>
                      <td className="px-2 py-2.5 text-muted">
                        {row.student?.email ?? "—"}
                      </td>
                      <td className="px-2 py-2.5 text-muted">
                        {Math.round(Number(row.completion_percent))}%
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <form action={issueCertificateAction}>
                          <input
                            type="hidden"
                            name="courseId"
                            value={courseId}
                          />
                          <input
                            type="hidden"
                            name="studentId"
                            value={row.student!.id}
                          />
                          <Button type="submit" size="sm">
                            Issue
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>
      ) : null}
    </div>
  );
}
