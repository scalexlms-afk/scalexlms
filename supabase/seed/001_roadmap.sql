-- Seed 8-milestone Amazon FBA roadmap content
-- Run after 001_phase1_foundation.sql

DO $$
DECLARE
  v_course_id UUID;
  v_milestone_id UUID;
  v_module_id UUID;
BEGIN
  INSERT INTO courses (title, description, status)
  VALUES (
    'Amazon FBA Private Label Mastery',
    'Take your brand from beginner to live Amazon seller through 8 structured milestones.',
    'published'
  )
  RETURNING id INTO v_course_id;

  -- Milestone 1: Foundation
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Foundation', 1, 'foundation', 'text-accent-blue')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Getting Started', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Welcome to ScaleX LaunchPad', 'text', 'Learn the execution-first approach to Amazon FBA private label.', 1),
    (v_module_id, 'Amazon FBA Overview', 'text', 'Understand how FBA works and what private label means.', 2);

  -- Milestone 2: Business Setup
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Business Setup', 2, 'setup', 'text-accent-teal')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Legal & Account Setup', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'LLC & Business Structure', 'text', 'Choose the right business structure for your Amazon brand.', 1),
    (v_module_id, 'Seller Central Setup', 'text', 'Step-by-step guide to creating your Amazon Seller account.', 2);

  -- Milestone 3: Brand Research
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Brand Research', 3, 'brand', 'text-accent-purple')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Brand Direction', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Defining Your Brand Identity', 'text', 'Name, positioning, and target customer profile.', 1),
    (v_module_id, 'Niche Selection Framework', 'text', 'How to pick a profitable niche with long-term potential.', 2);

  -- Milestone 4: Product Hunting
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Product Hunting', 4, 'hunt', 'text-scalex-red')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Finding Winning Products', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Demand Analysis', 'text', 'Validate demand using Amazon data and keyword tools.', 1),
    (v_module_id, 'Competition Research', 'text', 'Analyze competitors to find your differentiation angle.', 2),
    (v_module_id, 'Profit Calculation', 'text', 'Build your product P&L before committing.', 3);

  -- Milestone 5: Sourcing
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Sourcing', 5, 'source', 'text-accent-amber')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Supplier Selection', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Finding Suppliers on Alibaba', 'text', 'How to search, filter, and shortlist manufacturers.', 1),
    (v_module_id, 'Sample Ordering & QC', 'text', 'Order samples and evaluate quality before bulk.', 2);

  -- Milestone 6: Brand Development
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Brand Development', 6, 'develop', 'text-accent-green')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Brand Assets', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Logo & Packaging Design', 'text', 'Create brand assets that stand out on Amazon.', 1),
    (v_module_id, 'Listing Copywriting', 'text', 'Write titles, bullets, and A+ content that convert.', 2);

  -- Milestone 7: Launch
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Launch', 7, 'launch', 'text-accent-blue')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Go Live', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'FBA Shipment Creation', 'text', 'Send inventory to Amazon fulfillment centers.', 1),
    (v_module_id, 'Launch PPC Strategy', 'text', 'Run your first campaigns to gain traction.', 2);

  -- Milestone 8: Scaling
  INSERT INTO milestones (course_id, title, order_index, icon, color)
  VALUES (v_course_id, 'Scaling', 8, 'scale', 'text-accent-gold')
  RETURNING id INTO v_milestone_id;
  INSERT INTO modules (milestone_id, title, order_index) VALUES (v_milestone_id, 'Growth Strategy', 1) RETURNING id INTO v_module_id;
  INSERT INTO lessons (module_id, title, content_type, content_text, order_index) VALUES
    (v_module_id, 'Inventory Planning', 'text', 'Forecast demand and avoid stockouts.', 1),
    (v_module_id, 'Product Line Expansion', 'text', 'Add complementary products to grow revenue.', 2);

  -- Sample announcements
  INSERT INTO announcements (title, content) VALUES
    ('Welcome to ScaleX LaunchPad!', 'Your Amazon FBA journey starts here. Complete lessons, track progress, and build your brand.'),
    ('New: Product Hunting Module Live', 'Milestone 4 lessons are now available. Start validating your product ideas today.');
END $$;
