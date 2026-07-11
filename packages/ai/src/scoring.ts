import { createLongCatClient, longCatModel } from "./client";

export interface SubmissionScore {
  score: number;
  notes: string;
}

const SCORING_SYSTEM_PROMPT = `You grade ScaleX LaunchPad student task submissions.

Return JSON only with this shape:
{"score":<number from 0 to 100>, "notes": "<concise feedback for the student>"}

Score against the task requirements. Reward clear, complete, actionable work.
Penalize missing requirements, vagueness, or off-topic content.`;

export async function scoreSubmission(
  taskTitle: string,
  taskDescription: string,
  submissionContent: string
): Promise<SubmissionScore> {
  const client = createLongCatClient();

  const response = await client.chat.completions.create({
    model: longCatModel,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SCORING_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `Task title: ${taskTitle}`,
          `Task description: ${taskDescription}`,
          `Submission:\n${submissionContent}`,
        ].join("\n\n"),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();

  if (!raw) {
    throw new Error("Scoring model returned an empty response");
  }

  const parsed = JSON.parse(raw) as Partial<SubmissionScore>;
  const score = Number(parsed.score);

  if (!Number.isFinite(score)) {
    throw new Error("Scoring model returned an invalid score");
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    notes: typeof parsed.notes === "string" ? parsed.notes.trim() : "",
  };
}
