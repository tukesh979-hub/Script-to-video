# Video Dashboard

Project library / home base for the script-to-video system — lists projects, their render status, and thumbnails. Companion to the `remotion-engine` repo, which does the actual video generation.

**Scope note:** this is deliberately just the dashboard (list + status + a "New Video" launch point). The actual script → EDL → render pipeline, triggered from the browser, is a separate sub-project — designed and built next. The "New Video" button here is a placeholder until that exists.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Drizzle ORM + SQLite for local dev (`local.db`, gitignored) — schema mirrors the Postgres conventions used elsewhere (TEXT not VARCHAR, no FK, soft delete via `deletedAt`, uuid primary keys), so moving to real Postgres later is a straight port, not a redesign

## Getting started

```bash
npm install
npm run db:push    # create local.db from the schema
npm run db:seed    # seed with the real projects from the remotion-engine session
npm run dev         # http://localhost:3000
```

`npm run db:studio` opens Drizzle Studio to browse/edit the local database directly.

## Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (project grid)
│   └── projects/[id]/page.tsx  # Project detail
├── components/
│   ├── ProjectCard.tsx
│   └── StatusBadge.tsx
└── db/
    ├── schema.ts              # projects table
    ├── index.ts                # Drizzle client
    └── seed.ts
```

## Deploying

Not yet connected to Vercel. Once pushed to a GitHub repo: vercel.com → Add New Project → pick the repo → it auto-detects Next.js. Will need a real Postgres connection string as an env var at that point (local SQLite won't work on Vercel's serverless runtime) — swap `src/db/index.ts`'s driver from `better-sqlite3` to `@vercel/postgres` or similar; the schema itself barely changes.
