-- Restore Foundation milestone (order_index 1) on published Amazon FBA course.
-- Idempotent: skips if order_index 1 already exists for that course.
-- Safe to re-run; does not touch milestones 2–8 or student data.

DO $$
DECLARE
  v_course_id UUID;
  v_milestone_id UUID;
  v_module_id UUID;
  v_existing_milestone UUID;
BEGIN
  SELECT id INTO v_course_id
  FROM courses
  WHERE title = 'Amazon FBA Private Label Mastery'
    AND status = 'published'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Published Amazon FBA course not found; skipping restore.';
    RETURN;
  END IF;

  SELECT id INTO v_existing_milestone
  FROM milestones
  WHERE course_id = v_course_id
    AND order_index = 1;

  IF v_existing_milestone IS NOT NULL THEN
    RAISE NOTICE 'Foundation milestone already exists at order_index 1; skipping restore.';
    RETURN;
  END IF;

  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Foundation', 1, 'foundation', 'text-accent-blue')
  RETURNING id INTO v_milestone_id;

  INSERT INTO modules (milestone_id, title, order_index)
  VALUES (v_milestone_id, 'Getting Started', 1)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Welcome to ScaleX LaunchPad', 'text', 'Learn the execution-first approach to Amazon FBA private label.', 1),
    (v_module_id, 'Amazon FBA Overview', 'text', 'Understand how FBA works and what private label means.', 2);

  INSERT INTO tasks (milestone_id, title, description, accepted_formats)
  VALUES (
    v_milestone_id,
    'Submit Business Plan',
    'Upload your Amazon FBA business plan document outlining your goals and strategy.',
    '{text,link,pdf,image,excel}'::submission_format[]
  )
  ON CONFLICT (milestone_id) DO NOTHING;
END $$;
