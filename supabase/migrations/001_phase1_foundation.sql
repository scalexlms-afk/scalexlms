-- Phase 1 Foundation schema for ScaleX LaunchPad

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'instructor', 'mentor', 'sales', 'student');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE plan_type AS ENUM ('standard', 'premium');
CREATE TYPE student_level AS ENUM ('beginner_seller', 'research_expert', 'brand_builder', 'amazon_launcher');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_content_type AS ENUM ('video', 'pdf', 'text', 'link');
CREATE TYPE payment_type AS ENUM ('first_payment', 'remaining', 'installment');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'refunded');

-- Profiles (mirrors auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  plan plan_type,
  level student_level DEFAULT 'beginner_seller',
  current_stage TEXT,
  status user_status NOT NULL DEFAULT 'inactive',
  mentor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status course_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(milestone_id, order_index)
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type lesson_content_type NOT NULL,
  content_url TEXT,
  content_text TEXT,
  duration_seconds INT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  plan plan_type NOT NULL DEFAULT 'standard',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_percent REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_plan_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  total_cents INT NOT NULL,
  first_payment_percent INT NOT NULL,
  remaining_percent INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payment_plan_settings_updated_at BEFORE UPDATE ON payment_plan_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student',
    'inactive'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Completion rollup function
CREATE OR REPLACE FUNCTION refresh_enrollment_completion(p_student_id UUID, p_course_id UUID)
RETURNS VOID AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  pct REAL;
BEGIN
  SELECT COUNT(l.id) INTO total_lessons
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN milestones ms ON ms.id = m.milestone_id
  WHERE ms.course_id = p_course_id;

  SELECT COUNT(lc.id) INTO completed_lessons
  FROM lesson_completions lc
  JOIN lessons l ON l.id = lc.lesson_id
  JOIN modules m ON m.id = l.module_id
  JOIN milestones ms ON ms.id = m.milestone_id
  WHERE lc.student_id = p_student_id AND ms.course_id = p_course_id;

  IF total_lessons = 0 THEN
    pct := 0;
  ELSE
    pct := (completed_lessons::REAL / total_lessons::REAL) * 100;
  END IF;

  UPDATE enrollments
  SET completion_percent = pct, updated_at = NOW()
  WHERE student_id = p_student_id AND course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
BEGIN
  SELECT ms.course_id INTO v_course_id
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN milestones ms ON ms.id = m.milestone_id
  WHERE l.id = NEW.lesson_id;

  PERFORM refresh_enrollment_completion(NEW.student_id, v_course_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lesson_completed
  AFTER INSERT ON lesson_completions
  FOR EACH ROW EXECUTE FUNCTION handle_lesson_completion();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_settings ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR auth_user_role() = 'super_admin');
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());

-- Published content readable by active students and admins
CREATE POLICY courses_read ON courses FOR SELECT USING (
  status = 'published' OR auth_user_role() IN ('super_admin', 'instructor')
);

CREATE POLICY milestones_read ON milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND (c.status = 'published' OR auth_user_role() IN ('super_admin', 'instructor')))
);

CREATE POLICY modules_read ON modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM milestones ms JOIN courses c ON c.id = ms.course_id
    WHERE ms.id = milestone_id AND (c.status = 'published' OR auth_user_role() IN ('super_admin', 'instructor'))
  )
);

CREATE POLICY lessons_read ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m JOIN milestones ms ON ms.id = m.milestone_id JOIN courses c ON c.id = ms.course_id
    WHERE m.id = module_id AND (c.status = 'published' OR auth_user_role() IN ('super_admin', 'instructor'))
  )
);

-- Enrollments: students see own
CREATE POLICY enrollments_select_own ON enrollments FOR SELECT USING (student_id = auth.uid() OR auth_user_role() = 'super_admin');
CREATE POLICY enrollments_insert_own ON enrollments FOR INSERT WITH CHECK (student_id = auth.uid() OR auth_user_role() = 'super_admin');

-- Payments: students see own
CREATE POLICY payments_select_own ON payments FOR SELECT USING (student_id = auth.uid() OR auth_user_role() = 'super_admin');
CREATE POLICY payments_insert_own ON payments FOR INSERT WITH CHECK (student_id = auth.uid() OR auth_user_role() = 'super_admin');

-- Invoices via payment ownership
CREATE POLICY invoices_select_own ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_id AND (p.student_id = auth.uid() OR auth_user_role() = 'super_admin'))
);

-- Lesson completions: students manage own
CREATE POLICY lesson_completions_select_own ON lesson_completions FOR SELECT USING (student_id = auth.uid() OR auth_user_role() = 'super_admin');
CREATE POLICY lesson_completions_insert_own ON lesson_completions FOR INSERT WITH CHECK (student_id = auth.uid());

-- Announcements: all authenticated users can read
CREATE POLICY announcements_read ON announcements FOR SELECT USING (auth.uid() IS NOT NULL);

-- Payment plan settings: readable by all authenticated
CREATE POLICY payment_plan_read ON payment_plan_settings FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Default payment plan
INSERT INTO payment_plan_settings (plan_key, total_cents, first_payment_percent, remaining_percent)
VALUES ('standard_launch', 99700, 70, 30);

-- Storage bucket for lesson media
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-media', 'lesson-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY lesson_media_read ON storage.objects FOR SELECT USING (bucket_id = 'lesson-media');
CREATE POLICY lesson_media_admin_write ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'lesson-media' AND auth_user_role() IN ('super_admin', 'instructor')
);
