-- Mentor/staff replies on support tickets (visible to the student).
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS staff_reply TEXT,
  ADD COLUMN IF NOT EXISTS staff_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS staff_replied_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS support_tickets_staff_replied_by_idx
  ON support_tickets (staff_replied_by)
  WHERE staff_replied_by IS NOT NULL;
