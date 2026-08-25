import { getServiceDb } from "@/lib/admin-db";

async function signedSubmissionUrl(path: string): Promise<string | null> {
  const db = getServiceDb();
  const { data, error } = await db.storage
    .from("submissions")
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function isImageName(name: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}

function isPdfName(name: string) {
  return /\.pdf$/i.test(name);
}

export async function SubmissionPreview({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const type = typeof content.type === "string" ? content.type : null;
  const text =
    typeof content.text === "string"
      ? content.text
      : typeof content.body === "string"
        ? content.body
        : null;
  const link = typeof content.link === "string" ? content.link : null;
  const filePath =
    typeof content.file_path === "string" ? content.file_path : null;
  const fileName =
    typeof content.file_name === "string"
      ? content.file_name
      : filePath
        ? filePath.split("/").pop() ?? "file"
        : null;
  const comments = typeof content.comments === "string" ? content.comments : null;

  const fileUrl = filePath ? await signedSubmissionUrl(filePath) : null;

  return (
    <div className="space-y-3 text-sm">
      {text ? (
        <p className="whitespace-pre-wrap text-foreground">{text}</p>
      ) : null}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold text-scalex-red hover:underline"
        >
          {link}
        </a>
      ) : null}
      {fileName ? (
        <div className="space-y-2">
          <p className="text-xs text-muted">File · {fileName}</p>
          {fileUrl && isImageName(fileName) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-80 w-full rounded-xl object-contain bg-surface-3"
            />
          ) : null}
          {fileUrl && isPdfName(fileName) ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="h-80 w-full rounded-xl bg-white"
            />
          ) : null}
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-xs font-semibold text-scalex-red hover:underline"
            >
              Open / download {fileName}
            </a>
          ) : (
            <p className="text-xs text-subtle">Preview unavailable.</p>
          )}
        </div>
      ) : null}
      {comments ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Student notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-muted">{comments}</p>
        </div>
      ) : null}
      {!text && !link && !fileName && !comments ? (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-3 p-3 text-xs text-muted">
          {JSON.stringify(content, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
