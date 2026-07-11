import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@scalex/db/types";

export interface LessonContext {
  id: string;
  title: string;
  content_text: string | null;
  rank: number;
}

const CONTEXT_LIMIT = 5;

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

export async function retrieveContext(
  query: string,
  supabase: SupabaseClient<Database>
): Promise<LessonContext[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await (
    supabase as SupabaseClient<SearchLessonsContextDatabase>
  ).rpc("search_lessons_context", {
    query_text: trimmedQuery,
    result_limit: CONTEXT_LIMIT,
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

export function formatContext(chunks: LessonContext[]): string {
  if (chunks.length === 0) {
    return "No relevant academy lessons were found for this query.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[Lesson ${index + 1}: ${chunk.title}]\n${chunk.content_text ?? ""}`
    )
    .join("\n\n");
}
