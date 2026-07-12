-- Allow admins to update and delete lesson-media objects (replace/remove uploads)

CREATE POLICY lesson_media_admin_update ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'lesson-media'
    AND auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    bucket_id = 'lesson-media'
    AND auth_user_role() IN ('super_admin', 'instructor')
  );

CREATE POLICY lesson_media_admin_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'lesson-media'
    AND auth_user_role() IN ('super_admin', 'instructor')
  );
