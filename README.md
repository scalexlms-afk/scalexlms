# ScaleX LaunchPad

Monorepo for the ScaleX learning platform.

## Apps

- **Student portal** — `apps/student-portal` (port 3000 locally)
- **Admin portal** — `apps/admin-portal` (port 3001 locally)

## Packages

- `@scalex/ui` — shared UI components
- `@scalex/db` — Supabase client, types, helpers
- `@scalex/ai` — LongCat AI integration
- `@scalex/config` — shared TypeScript/ESLint config

## Local development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `apps/student-portal/.env.local` and `apps/admin-portal/.env.local`, then fill in your keys.

## Vercel deployment

Deploy each app as a separate Vercel project from this repo:

| Project | Root directory |
|---------|----------------|
| Student portal | `apps/student-portal` |
| Admin portal | `apps/admin-portal` |

Both apps share workspace packages from the monorepo root.
