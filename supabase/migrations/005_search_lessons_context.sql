-- FTS search RPC for AI Mentor grounding

CREATE OR REPLACE FUNCTION search_lessons_context(query_text TEXT, result_limit INT DEFAULT 5)
RETURNS TABLE (id UUID, title TEXT, content_text TEXT, rank REAL)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT l.id, l.title, l.content_text,
    ts_rank(l.search_vector, plainto_tsquery('english', query_text)) AS rank
  FROM lessons l
  WHERE l.search_vector @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_lessons_context(TEXT, INT) TO authenticated;
