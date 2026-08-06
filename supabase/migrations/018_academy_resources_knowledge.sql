-- Academy Resources library + AI Knowledge Base articles (adminpics screens).

CREATE TYPE resource_visibility AS ENUM ('public', 'private', 'draft');
CREATE TYPE knowledge_category AS ENUM (
  'guide',
  'policy',
  'tutorial',
  'template',
  'faq',
  'case_study'
);
CREATE TYPE knowledge_status AS ENUM ('draft', 'published');

CREATE TABLE academy_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Templates',
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  file_type TEXT NOT NULL DEFAULT 'link',
  file_path TEXT,
  file_url TEXT,
  file_size_bytes INT,
  visibility resource_visibility NOT NULL DEFAULT 'draft',
  download_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT academy_resources_file_check CHECK (
    file_path IS NOT NULL OR file_url IS NOT NULL
  )
);

CREATE TABLE ai_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category knowledge_category NOT NULL DEFAULT 'guide',
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status knowledge_status NOT NULL DEFAULT 'draft',
  view_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX academy_resources_visibility_idx ON academy_resources (visibility);
CREATE INDEX academy_resources_category_idx ON academy_resources (category);
CREATE INDEX ai_knowledge_articles_status_idx ON ai_knowledge_articles (status);
CREATE INDEX ai_knowledge_articles_category_idx ON ai_knowledge_articles (category);

CREATE TRIGGER academy_resources_updated_at
  BEFORE UPDATE ON academy_resources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER ai_knowledge_articles_updated_at
  BEFORE UPDATE ON ai_knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE academy_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Students: public resources only
CREATE POLICY academy_resources_student_select ON academy_resources
  FOR SELECT USING (
    visibility = 'public'
    AND auth_is_active_student()
  );

-- Staff (non-service): full read
CREATE POLICY academy_resources_staff_select ON academy_resources
  FOR SELECT USING (auth_is_admin());

CREATE POLICY academy_resources_staff_write ON academy_resources
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- Students: published knowledge articles
CREATE POLICY ai_knowledge_student_select ON ai_knowledge_articles
  FOR SELECT USING (
    status = 'published'
    AND auth_is_active_student()
  );

CREATE POLICY ai_knowledge_staff_select ON ai_knowledge_articles
  FOR SELECT USING (auth_is_admin());

CREATE POLICY ai_knowledge_staff_write ON ai_knowledge_articles
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- Storage bucket for resource files (private; signed URLs via service/admin client)
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-resources', 'academy-resources', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY academy_resources_storage_staff_all ON storage.objects
  FOR ALL USING (
    bucket_id = 'academy-resources'
    AND auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    bucket_id = 'academy-resources'
    AND auth_user_role() IN ('super_admin', 'instructor')
  );

CREATE POLICY academy_resources_storage_student_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'academy-resources'
    AND auth_is_active_student()
  );
