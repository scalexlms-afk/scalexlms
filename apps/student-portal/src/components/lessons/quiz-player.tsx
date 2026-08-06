"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@scalex/ui";
import type { StudentLessonQuiz } from "@/lib/data";
import { submitQuizAttemptAction } from "@/app/(portal)/lessons/actions";

export function QuizPlayer({
  lessonId,
  quiz,
  alreadyPassed,
}: {
  lessonId: string;
  quiz: StudentLessonQuiz;
  alreadyPassed?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    scorePercent: number;
    passed: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  function handleSubmit() {
    if (!allAnswered) {
      setError("Answer every question before submitting.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const outcome = await submitQuizAttemptAction(lessonId, answers);
        setResult(outcome);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not submit quiz.");
      }
    });
  }

  if (alreadyPassed && !result) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold">{quiz.title}</h2>
        <p className="mt-2 text-sm text-accent-green">
          You already passed this quiz. Lesson marked complete.
        </p>
      </Card>
    );
  }

  if (result) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold">{quiz.title}</h2>
        <p
          className={`mt-3 text-sm font-medium ${
            result.passed ? "text-accent-green" : "text-scalex-red"
          }`}
        >
          {result.passed ? "Passed" : "Not passed"} — {result.scorePercent}%
          (need {quiz.pass_percent}%)
        </p>
        {!result.passed ? (
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              Try again
            </Button>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{quiz.title}</h2>
          <p className="mt-1 text-sm text-muted">
            Pass with {quiz.pass_percent}% or higher to complete this lesson.
          </p>
        </div>
      </div>

      <ol className="mt-6 space-y-6">
        {quiz.questions.map((question, index) => (
          <li key={question.id}>
            <p className="text-sm font-medium">
              {index + 1}. {question.prompt}
            </p>
            <ul className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                return (
                  <li key={`${question.id}-${optionIndex}`}>
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: optionIndex,
                        }))
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "border-scalex-red bg-scalex-red/10 text-foreground"
                          : "border-line bg-surface-3 text-muted hover:border-line-strong hover:text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {error ? <p className="mt-4 text-sm text-scalex-red">{error}</p> : null}

      <div className="mt-6">
        <Button type="button" onClick={handleSubmit} disabled={pending}>
          {pending ? "Submitting…" : "Submit quiz"}
        </Button>
      </div>
    </Card>
  );
}
