-- Seed gating tasks for 8 milestones (run after 001_roadmap.sql + 004_phase2.sql)

INSERT INTO tasks (milestone_id, title, description, accepted_formats)
SELECT ms.id,
  CASE ms.order_index
    WHEN 1 THEN 'Submit Business Plan'
    WHEN 2 THEN 'Upload Business Documents'
    WHEN 3 THEN 'Submit Brand Direction'
    WHEN 4 THEN 'Upload Product Hunting Sheet'
    WHEN 5 THEN 'Submit Supplier Finalization'
    WHEN 6 THEN 'Upload Brand Assets'
    WHEN 7 THEN 'Submit Launch Checklist'
    WHEN 8 THEN 'Submit Scale Strategy'
  END,
  CASE ms.order_index
    WHEN 1 THEN 'Upload your Amazon FBA business plan document outlining your goals and strategy.'
    WHEN 2 THEN 'Upload your LLC documents and Seller Central setup confirmation.'
    WHEN 3 THEN 'Submit your brand identity brief including name, positioning, and target customer.'
    WHEN 4 THEN 'Upload your completed product hunting sheet with demand and profit analysis.'
    WHEN 5 THEN 'Submit supplier quotes, sample photos, and your final supplier selection.'
    WHEN 6 THEN 'Upload logo, packaging mockups, and listing copy drafts.'
    WHEN 7 THEN 'Submit your launch checklist with FBA shipment and PPC plan.'
    WHEN 8 THEN 'Upload your scaling strategy including inventory and expansion plans.'
  END,
  '{text,link,pdf,image,excel}'::submission_format[]
FROM milestones ms
JOIN courses c ON c.id = ms.course_id
WHERE c.status = 'published'
ON CONFLICT (milestone_id) DO NOTHING;

-- Badge keys reference (awarded on task approval via app logic):
-- milestone 4 -> product_found, milestone 5 -> supplier_selected, milestone 7 -> first_sale
