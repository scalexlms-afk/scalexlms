import Link from "next/link";
import { notFound } from "next/navigation";
import { ProtectedMediaPlayer } from "@/components/protected-media-player";
import { requireStudentProfile } from "@/lib/auth";
import { getLessonById, isMilestoneUnlocked } from "@/lib/data";
import { getSecureMediaUrl } from "@/lib/secure-media";
import { createClient } from "@scalex/db/server";
import { isLessonStorageMedia } from "@scalex/db/media";
import { Card, Button, StatusPill } from "@scalex/ui";
import { markLessonComplete } from "../actions";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireStudentProfile();
  const lesson = await getLessonById(id);

  if (!lesson) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonMilestoneId = (lesson as any).modules?.milestones?.id as
    | string
    | undefined;
  const unlocked = lessonMilestoneId
    ? await isMilestoneUnlocked(userId, lessonMilestoneId)
    : true;

  if (!unlocked) {
    return (
    <>
      <div className="mx-auto max-w-2xl">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-scalex-red"
          >
            ← Back to Roadmap
          </Link>
          <Card className="mt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-3 text-2xl">
              &#128274;
            </div>
            <h1 className="mt-4 font-display text-xl font-bold">
              This lesson is locked
            </h1>
            <p className="mt-2 text-sm text-muted">
              Finish and get approval on the previous milestone task to unlock
              this content.
            </p>
            <Link href="/roadmap" className="mt-6 inline-block">
              <Button>Go to Roadmap</Button>
            </Link>
          </Card>
        </div>
    </>
    );
  }

  const secureMediaUrl =
    lesson.content_url &&
    (lesson.content_type === "video" || lesson.content_type === "pdf")
      ? await getSecureMediaUrl(lesson.content_url)
      : lesson.content_url;

  const watermark = `${profile.email} · ${profile.name}`;

  const supabase = await createClient();
  const { data: completion } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("student_id", userId)
    .eq("lesson_id", id)
    .maybeSingle();

  const isComplete = !!completion;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (lesson as any).modules;
  const milestone = mod?.milestones;
  const course = milestone?.courses;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-scalex-red"
          >
            ← Back to Roadmap
          </Link>
          {course && (
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-subtle">
              {course.title} · {milestone?.title} · {mod?.title}
            </p>
          )}
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {lesson.title}
            </h1>
            {isComplete && <StatusPill label="Completed" variant="approved" />}
          </div>
        </div>

        <Card>
          {lesson.content_type === "video" || lesson.content_type === "pdf" ? (
            secureMediaUrl ? (
              <ProtectedMediaPlayer
                url={secureMediaUrl}
                title={lesson.title}
                type={lesson.content_type === "pdf" ? "pdf" : "video"}
                watermark={watermark}
              />
            ) : (
              <p className="text-muted">
                Media unavailable. Please try again later.
              </p>
            )
          ) : lesson.content_type === "link" && lesson.content_url ? (
            isLessonStorageMedia(lesson.content_url) ? (
              <p className="text-sm text-muted">
                This resource is only available inside protected lessons.
              </p>
            ) : (
              <a
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-scalex-red hover:underline"
              >
                Open external resource →
              </a>
            )
          ) : (
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground">
              {lesson.content_text ?? "No content available."}
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-line bg-surface-2 px-5 py-4">
          {isComplete ? (
            <p className="flex items-center gap-2 text-sm text-accent-green">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-green/15">
                ✓
              </span>
              You&apos;ve completed this lesson
            </p>
          ) : (
            <>
              <p className="text-sm text-muted">
                Finished? Mark this lesson complete to update your progress.
              </p>
              <form action={markLessonComplete.bind(null, id)}>
                <Button type="submit">Mark as Complete</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
