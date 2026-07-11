-- Harden functions per Supabase security advisors

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.auth_user_role() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.refresh_enrollment_completion(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.handle_lesson_completion() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.auth_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_lesson_completion() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_enrollment_completion(UUID, UUID) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS lesson_media_read ON storage.objects;
CREATE POLICY lesson_media_read ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-media' AND auth.uid() IS NOT NULL);
