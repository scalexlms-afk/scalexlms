"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileArrowUp } from "@phosphor-icons/react";
import { Button, Card } from "@scalex/ui";
import { inputClasses } from "@/components/field";
import { submitTaskAction } from "@/app/(portal)/tasks/actions";

export function TaskSubmitForm({
  taskId,
  acceptedFormats,
  canSubmit,
  lockedMessage,
}: {
  taskId: string;
  acceptedFormats: string[];
  canSubmit: boolean;
  lockedMessage?: string;
}) {
  const allowsFile =
    acceptedFormats.includes("pdf") ||
    acceptedFormats.includes("image") ||
    acceptedFormats.includes("excel");
  const allowsLink = acceptedFormats.includes("link");
  const allowsText = acceptedFormats.includes("text");

  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!canSubmit) {
    return (
      <Card id="submit">
        <h2 className="font-display text-lg font-semibold">
          Upload Your Submission
        </h2>
        <p className="mt-2 text-sm text-muted">
          {lockedMessage ??
            "This task cannot be submitted right now. Check your review status above."}
        </p>
      </Card>
    );
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("taskId", taskId);
    if (comments.trim()) formData.set("comments", comments.trim());

    if (allowsFile && file) {
      formData.set("submissionType", "file");
      formData.set("file", file);
    } else if (allowsLink && link.trim()) {
      formData.set("submissionType", "link");
      formData.set("link", link.trim());
    } else if (allowsText && (text.trim() || comments.trim())) {
      formData.set("submissionType", "text");
      formData.set("text", text.trim() || comments.trim());
    } else {
      setError("Add a file, link, or text response before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await submitTaskAction(formData);
        setFile(null);
        setLink("");
        setText("");
        setComments("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submission failed");
      }
    });
  }

  return (
    <Card id="submit">
      <h2 className="font-display text-lg font-semibold">
        Upload Your Submission
      </h2>
      <p className="mt-1 text-sm text-muted">
        Accepted: {acceptedFormats.join(", ") || "file / link / text"}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {allowsFile && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
              dragging
                ? "border-scalex-red bg-scalex-red/10"
                : "border-line bg-surface-3/30 hover:border-scalex-red/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-scalex-red/10 text-scalex-red metallic-edge">
              <FileArrowUp weight="duotone" className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">
              {file ? file.name : "Drag & drop your file here"}
            </p>
            <p className="mt-1 text-xs text-muted">
              or click to browse · PDF, images, Excel
            </p>
          </div>
        )}

        {allowsLink && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Or paste a link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Google Drive, Dropbox, or any URL"
              className={inputClasses}
            />
          </div>
        )}

        {allowsText && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Text response
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Describe your work…"
              className={inputClasses}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            Comments (optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Anything your mentor should know…"
            className={inputClasses}
          />
        </div>

        {error && <p className="text-sm text-accent-danger">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Submitting…" : "Submit Task for Review"}
        </Button>
      </form>
    </Card>
  );
}
