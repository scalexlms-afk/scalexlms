# SCHEMA.md — ScaleX LaunchPad Data Model

> Entity list is derived from the product spec's "Database Entities
> Overview" plus fields implied elsewhere in the spec (Student Management,
> CRM, Finance, Task Management sections). Field lists are a reasonable
> starting shape — extend as real requirements surface, but don't rename or
> remove the core entities without updating this file and `AGENTS.md`.

## Entity Overview

```
User ──┬── Enrollment ── Course ── Milestone ── Module ── Lesson
       │                                │
       │                                └── Task ── Submission ── Review
       │
       ├── Payment ── Invoice
       ├── Lead (if role = student, links back to originating lead)
       ├── CommunityPost ── Comment
       ├── Message (mentor <-> student)
       ├── Certificate
       ├── Badge (earned)
       └── Notification
```

## Core Entities

### `User`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | string | |
| email | string | unique |
| phone / whatsapp | string | used by CRM + notifications |
| role | enum | `super_admin \| instructor \| mentor \| sales \| student` |
| avatar_url | string | nullable |
| plan | enum | `standard \| premium` — students only |
| level | enum | `beginner_seller \| research_expert \| brand_builder \| amazon_launcher` — students only |
| current_stage | string | e.g. "Product Hunting" — students only |
| status | enum | `active \| inactive \| suspended` |
| mentor_id | uuid FK → User | nullable, assigns a mentor to a student |
| created_at / updated_at | timestamp | |

### `Course`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | string | e.g. "Amazon FBA Private Label Mastery" |
| description | text | |
| status | enum | `draft \| published \| archived` |
| created_by | uuid FK → User | instructor/admin |

### `Milestone`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| course_id | uuid FK → Course | |
| title | string | e.g. "Product Hunting" |
| order_index | int | for roadmap ordering |
| icon / color | string | maps to `DESIGN.md` journey-strip styling |

### `Module`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| milestone_id | uuid FK → Milestone | |
| title | string | e.g. "Finding Winning Products" |
| order_index | int | |

### `Lesson`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| module_id | uuid FK → Module | |
| title | string | |
| content_type | enum | `video \| pdf \| text \| link` |
| content_url | string | |
| duration_seconds | int | nullable, for video |
| order_index | int | |

### `Task`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| milestone_id | uuid FK → Milestone | one gating task per milestone |
| title | string | e.g. "Upload Product Sheet" |
| description | text | instructions |
| accepted_formats | string[] | `image \| excel \| pdf \| link \| text` |

### `Submission`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| task_id | uuid FK → Task | |
| student_id | uuid FK → User | |
| content | jsonb | files/links/text payload |
| status | enum | `not_started \| submitted \| under_review \| approved \| revision_required` |
| ai_score | float | nullable, AI pre-evaluation |
| ai_notes | text | nullable |
| submitted_at | timestamp | |

### `Review`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| submission_id | uuid FK → Submission | |
| reviewer_id | uuid FK → User | mentor/instructor |
| decision | enum | `approved \| revision_required` |
| feedback | text | |
| reviewed_at | timestamp | |

### `Enrollment`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid FK → User | |
| course_id | uuid FK → Course | |
| plan | enum | `standard \| premium` |
| enrolled_at | timestamp | |
| completion_percent | float | derived/cached rollup |

### `Payment`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid FK → User | |
| amount | int | minor units (cents) |
| type | enum | `first_payment (70%) \| remaining (30%) \| installment` |
| status | enum | `pending \| paid \| overdue \| refunded` |
| method | string | provider reference (Stripe/PayPal) |
| paid_at | timestamp | nullable |

### `Invoice`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| payment_id | uuid FK → Payment | |
| number | string | |
| issued_at | timestamp | |
| pdf_url | string | |

### `Lead` (CRM)
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | string | |
| whatsapp | string | |
| source | string | e.g. "Meta Ads", "Referral" |
| sales_person_id | uuid FK → User | |
| stage | enum | `new \| contacted \| interested \| demo \| payment_pending \| enrolled` |
| converted_user_id | uuid FK → User | nullable, set once enrolled |

### `CommunityPost`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| channel | enum | `announcements \| product_hunting \| supplier_help \| ppc_discussion \| questions \| student_wins` |
| author_id | uuid FK → User | |
| content | text | |
| status | enum | `pending_approval \| approved \| rejected` |
| like_count | int | |

### `Comment`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| post_id | uuid FK → CommunityPost | |
| author_id | uuid FK → User | |
| content | text | |

### `Message`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| sender_id | uuid FK → User | |
| recipient_id | uuid FK → User | |
| content | text | |
| read_at | timestamp | nullable |

### `LiveSession`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| type | enum | `batch_class \| masterclass \| qa \| case_study` |
| title | string | |
| scheduled_at | timestamp | |
| host_id | uuid FK → User | |
| meeting_url | string | |
| recording_url | string | nullable, post-session |

### `Certificate`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid FK → User | |
| course_id | uuid FK → Course | |
| issued_at | timestamp | |
| pdf_url | string | |

### `Badge`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| key | string | e.g. `product_found`, `supplier_selected`, `first_sale` |
| student_id | uuid FK → User | |
| earned_at | timestamp | |

### `Notification`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid FK → User | |
| type | string | e.g. `lesson_unlock \| task_review \| message \| payment \| enrollment \| follow_up` |
| payload | jsonb | |
| read_at | timestamp | nullable |
| created_at | timestamp | |

### `LessonCompletion` (Phase 1 addition)
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid FK → User | |
| lesson_id | uuid FK → Lesson | |
| completed_at | timestamp | per-lesson mark-complete; drives enrollment rollup via DB trigger |

### `Announcement` (Phase 1 addition)
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | string | |
| content | text | |
| published_at | timestamp | |
| created_at | timestamp | read-only feed on student dashboard |

### Phase 2 tables (implemented in `004_phase2.sql`)

`tasks`, `submissions`, `reviews`, `community_posts`, `comments`, `post_likes`,
`messages`, `live_sessions`, `session_registrations`, `badges`, `notifications`,
`audit_log`, `ai_chats`, `ai_chat_messages` — see migration for full field lists.
`lessons.search_vector` (tsvector) + `search_lessons_context()` RPC power AI
Mentor grounding (Postgres FTS, not vector embeddings).

### `AuditLog`
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| actor_id | uuid FK → User | who performed the action |
| action | string | e.g. `submission.approve`, `student.update` |
| target_type / target_id | string / uuid | polymorphic reference |
| metadata | jsonb | before/after diff if useful |
| created_at | timestamp | |

## Notes

- `completion_percent` on `Enrollment` and any dashboard rollups should be
  **derived/cached**, not the source of truth — recompute from
  `Submission.status` counts to avoid drift.
- `AI` fields (`ai_score`, `ai_notes`) are advisory data attached to
  `Submission`, never a replacement for the `Review` record — approval
  always requires a `Review` row from a human reviewer.
- Keep `Lead` and `User` separate tables linked by `converted_user_id`
  rather than merging them — pre-enrollment leads shouldn't carry
  student-only fields (level, current_stage, mentor_id, etc.).
