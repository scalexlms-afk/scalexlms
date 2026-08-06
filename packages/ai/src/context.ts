import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@scalex/db/types";

export interface LessonContext {
  id: string;
  title: string;
  content_text: string | null;
  rank: number;
}

const CONTEXT_LIMIT = 6;
const EXCERPT_CHARS = 4500;
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "is",
  "are",
  "was",
  "were",
  "be",
  "i",
  "me",
  "my",
  "we",
  "you",
  "your",
  "do",
  "does",
  "did",
  "what",
  "which",
  "who",
  "how",
  "why",
  "when",
  "where",
  "can",
  "could",
  "would",
  "should",
  "u",
  "about",
  "with",
  "from",
  "this",
  "that",
  "it",
  "as",
  "at",
  "by",
  "if",
  "any",
  "some",
  "tell",
  "give",
  "need",
  "have",
  "has",
  "had",
  "get",
  "got",
  "please",
  "help",
]);

type SearchLessonsContextDatabase = Database & {
  public: Database["public"] & {
    Functions: Database["public"]["Functions"] & {
      search_lessons_context: {
        Args: {
          query_text: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          title: string;
          content_text: string | null;
          rank: number;
        }[];
      };
    };
  };
};

type LessonRow = {
  id: string;
  title: string;
  content_text: string | null;
};

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 8);
}

function truncateExcerpt(text: string | null): string {
  if (!text) return "";
  const cleaned = text.trim();
  if (cleaned.length <= EXCERPT_CHARS) return cleaned;
  return `${cleaned.slice(0, EXCERPT_CHARS)}\n…`;
}

function dedupeById(rows: LessonContext[]): LessonContext[] {
  const seen = new Set<string>();
  const out: LessonContext[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

async function searchFts(
  supabase: SupabaseClient<Database>,
  query: string,
  limit: number
): Promise<LessonContext[]> {
  const { data, error } = await (
    supabase as SupabaseClient<SearchLessonsContextDatabase>
  ).rpc("search_lessons_context", {
    query_text: query,
    result_limit: limit,
  });

  if (error) {
    throw new Error(`Failed to retrieve context: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content_text: row.content_text,
    rank: row.rank,
  }));
}

async function listAccessibleLessons(
  supabase: SupabaseClient<Database>
): Promise<LessonRow[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, content_text")
    .not("content_text", "is", null)
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to list academy lessons: ${error.message}`);
  }

  return ((data ?? []) as LessonRow[]).filter(
    (row) => (row.content_text?.trim().length ?? 0) > 80
  );
}

function keywordFallback(
  lessons: LessonRow[],
  keywords: string[],
  limit: number
): LessonContext[] {
  if (keywords.length === 0) return [];

  const scored = lessons
    .map((lesson) => {
      const hay = `${lesson.title}\n${lesson.content_text ?? ""}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (lesson.title.toLowerCase().includes(kw)) score += 5;
        if (hay.includes(kw)) score += 1;
      }
      return { lesson, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((row, index) => ({
    id: row.lesson.id,
    title: row.lesson.title,
    content_text: row.lesson.content_text,
    rank: row.score + (limit - index) * 0.01,
  }));
}

export async function retrieveKnowledgeArticles(
  supabase: SupabaseClient<Database>,
  query: string,
  limit = 4
): Promise<LessonContext[]> {
  const keywords = extractKeywords(query);
  const { data, error } = await supabase
    .from("ai_knowledge_articles")
    .select("id, title, body, status")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) return [];

  const rows = data as {
    id: string;
    title: string;
    body: string;
    status: string;
  }[];

  if (keywords.length === 0) {
    return rows.slice(0, limit).map((row, index) => ({
      id: `kb:${row.id}`,
      title: row.title,
      content_text: row.body,
      rank: 0.5 * (limit - index),
    }));
  }

  const scored = rows
    .map((row) => {
      const hay = `${row.title}\n${row.body}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (row.title.toLowerCase().includes(kw)) score += 6;
        if (hay.includes(kw)) score += 1;
      }
      return { row, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((item, index) => ({
    id: `kb:${item.row.id}`,
    title: item.row.title,
    content_text: item.row.body,
    rank: item.score + (limit - index) * 0.01,
  }));
}

export async function retrieveContext(
  query: string,
  supabase: SupabaseClient<Database>
): Promise<LessonContext[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const keywords = extractKeywords(trimmedQuery);
  let hits = await searchFts(supabase, trimmedQuery, CONTEXT_LIMIT);

  // Retry FTS with keyword-only query (drops stopwords like "what/how/do")
  if (hits.length === 0 && keywords.length > 0) {
    hits = await searchFts(supabase, keywords.join(" "), CONTEXT_LIMIT);
  }

  const [catalog, knowledge] = await Promise.all([
    listAccessibleLessons(supabase),
    retrieveKnowledgeArticles(supabase, trimmedQuery, 4),
  ]);

  if (hits.length === 0 && catalog.length > 0) {
    hits = keywordFallback(catalog, keywords, CONTEXT_LIMIT);
  }

  // Last resort: still return a few substantive lessons so the model
  // never thinks the academy library is empty.
  if (hits.length === 0 && catalog.length > 0) {
    hits = catalog.slice(0, Math.min(3, CONTEXT_LIMIT)).map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      content_text: lesson.content_text,
      rank: 0.01 * (CONTEXT_LIMIT - index),
    }));
  }

  return dedupeById([...knowledge, ...hits]).slice(0, CONTEXT_LIMIT);
}

export async function retrieveCurriculumTitles(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const lessons = await listAccessibleLessons(supabase);
  return lessons.map((lesson) => lesson.title);
}

export function formatContext(
  chunks: LessonContext[],
  curriculumTitles: string[] = []
): string {
  const sections: string[] = [];

  if (curriculumTitles.length > 0) {
    sections.push(
      `ScaleX academy curriculum (lesson titles you may cite):\n${curriculumTitles
        .map((title, i) => `${i + 1}. ${title}`)
        .join("\n")}`
    );
  }

  if (chunks.length === 0) {
    sections.push(
      "No ranked lesson excerpts matched this query. Use the curriculum list above plus careful general Amazon FBA guidance, and say when you are filling a gap outside the excerpts."
    );
  } else {
    sections.push(
      chunks
        .map(
          (chunk, index) =>
            `[${chunk.id.startsWith("kb:") ? "Knowledge" : "Lesson"} ${index + 1}: ${chunk.title}]\n${truncateExcerpt(chunk.content_text)}`
        )
        .join("\n\n")
    );
  }

  return sections.join("\n\n---\n\n");
}
