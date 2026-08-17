import { notFound } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth";
import { getEmailPreviews } from "@scalex/email";

export default async function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  await requireAdminProfile();
  const previews = getEmailPreviews();

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Development
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Transactional email previews
          </h1>
          <p className="mt-1 text-muted">
            Local-only rendering of every branded ScaleX email.
          </p>
        </div>

        <div className="space-y-8">
          {previews.map((preview) => (
            <section key={preview.name} className="space-y-3">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {preview.name}
                </h2>
                <p className="text-sm text-muted">
                  Subject: {preview.subject}
                </p>
              </div>
              <iframe
                title={`${preview.name} email preview`}
                srcDoc={preview.html}
                className="h-[900px] w-full rounded-xl border border-line bg-[#0B0B10]"
                sandbox=""
              />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
