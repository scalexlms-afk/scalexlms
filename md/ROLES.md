# ROLES.md — Role Permission Matrix

> Access control across the ScaleX platform. Five roles: **Super Admin,
> Instructor, Mentor, Sales, Student.** This matrix is reconstructed from
> the documented per-role capabilities in the product spec — validate exact
> cell-level behavior with the team before treating it as final, especially
> for the "Partial Access" cells, which should be broken into specific
> permitted actions during implementation.

## Legend

| Symbol | Meaning |
|---|---|
| ✅ Full | Can view, create, edit & delete |
| 🟠 Partial | Limited access to specific actions only |
| ❌ None | No permission |
| 👤 Own/Assigned | Access restricted to own data or assigned students only |

## Matrix

| Module / Feature | Super Admin | Instructor | Mentor | Sales | Student |
|---|---|---|---|---|---|
| Dashboard & Analytics | ✅ Full | ✅ Full | 👤 Assigned students only | 👤 Own pipeline only | 👤 Own progress only |
| Student Management | ✅ Full | 🟠 Partial | 👤 Assigned students only | 🟠 Leads only, no course data | ❌ None |
| Course & Content Management | ✅ Full | ✅ Full | 🟠 View only | ❌ None | 🟠 Join & view only |
| Live Sessions Management | ✅ Full | ✅ Full | 🟠 View / host assigned sessions | ❌ None | 🟠 Join & view only |
| Task & Assignment Review | ✅ Full | 🟠 Partial (own course tasks) | ✅ Full (review & approve) | ❌ None | 🟠 Submit & view own only |
| Community Management | ✅ Full | 🟠 Partial (moderate) | 🟠 Partial (participate + guide) | ❌ None | 🟠 Participate only |
| AI Mentor & Knowledge Base | ✅ Full (configure) | 🟠 Partial (contribute content) | 🟠 Partial (view transcripts) | ❌ None | 🟠 Ask & learn only |
| CRM & Lead Management | ✅ Full | ❌ None | ❌ None | ✅ Full | ❌ None |
| Finance & Payments | ✅ Full | ❌ None | ❌ None | 🟠 View related leads' payment status | 👤 Own payments/invoices only |
| Reports & Intelligence | ✅ Full | 🟠 Basic view | 👤 Student insights (assigned) | 🟠 Lead reports only | ❌ None |
| System Settings & Roles | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |

## Role Summaries

### Super Admin
Complete system control: finance, analytics, user management, all content,
all settings. The only role that can manage other admins' roles.

### Instructor
Owns course, lesson, and live-session content end-to-end. Can see student
progress at a course level but doesn't get the full CRM/finance picture.

### Mentor
Works one-to-one with an **assigned** subset of students: reviews their
task submissions, tracks their progress, gives feedback, hosts calls.
Never sees students outside their assignment without an explicit
reassignment.

### Sales Team
Owns the CRM pipeline (`New Lead → Contacted → Interested → Demo →
Payment Pending → Enrolled`) and enrollment. No visibility into course
content, task reviews, or the AI Mentor/Community systems.

### Student
Learning-access only: their own course, AI Mentor, community
participation, and their own tasks/submissions/payments. Never sees another
student's data, admin tooling, or system settings.

## Implementation Rules

1. **Every API route and server action must resolve the caller's role and
   check it against this matrix before executing** — do this centrally
   (middleware/guard), not ad hoc per-handler.
2. **"Own/Assigned" is not the same as "Full."** Even where a role has full
   CRUD on an entity type, always scope the query to the caller's own
   records or their assigned students — a Mentor with "Full" task-review
   access still only sees tasks belonging to their assigned students.
3. **Partial Access must be enumerated, not assumed.** When implementing a
   🟠 cell, write down exactly which actions are allowed (e.g., Instructor +
   Task & Assignment Review = "can view submissions for their own courses
   and leave comments, but cannot issue final approval unless also
   assigned as Mentor").
4. **Log everything Super Admin and Instructor/Mentor do that mutates
   student-facing data** — required by the Audit Logs & Activity Tracking
   service (see `AGENTS.md §3`).
5. **Changes to this matrix require updating both this file and any
   route-guard configuration in the same change** — they must never drift
   apart.
