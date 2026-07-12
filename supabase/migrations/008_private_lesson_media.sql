-- Make lesson-media private; students access via short-lived signed URLs only.

UPDATE storage.buckets SET public = false WHERE id = 'lesson-media';
