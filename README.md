# Video Dashboard

Authenticated project library / home base for the script-to-video system — auth, onboarding, per-user project ownership, a dashboard shell (overview, projects, billing/usage, account, notifications), and the existing per-project detail pages, all gated behind Supabase Auth + Postgres Row Level Security. Companion to the `remotion-engine` repo, which does the actual video generation.

**Scope note:** the actual script → EDL → render pipeline, triggered from the browser, is a separate sub-project. This repo has the credit-charging primitive (`src/lib/credits.ts`) and the RLS policies a render-trigger endpoint would use ready to go, but no "click to render" button yet — see **What's stubbed** below.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase: Auth (email/password + Google OAuth, email verification required) + Postgres + Row Level Security
- Drizzle ORM — **schema and migrations only**. All runtime reads/writes go through the Supabase client instead (see **Why two DB tools** below)
- Zod for server-side validation on every form/Server Action
- Vitest (unit + a live-DB RLS integration test) + Playwright (E2E)

## Getting started

You need a Supabase project (free tier is fine). At creation time, under **Security**: leave **"Enable Data API"** checked (required — this is what lets the app query anything), **uncheck "Automatically expose new tables"** (Supabase's own recommended, more secure default — `drizzle/0005_explicit_grants.sql` grants exactly what each table's RLS design needs, so this doesn't break anything), and check **"Enable automatic RLS"** if offered (a free safety net for any future table). See the prompt above for where to find each credential afterward. Then:

```bash
npm install
cp .env.local.example .env.local   # fill in the 4 Supabase values + NEXT_PUBLIC_SITE_URL

npm run db:migrate                 # applies every file in drizzle/ IN ORDER — tables, RLS
                                    # policies, the signup trigger, rate-limit and
                                    # credit-charging functions, explicit grants, all of it

npm run dev                        # http://localhost:3000
```

**`db:migrate` vs `db:push` — use `db:migrate` for setup.** `drizzle-kit push` only diffs `schema.ts` against the live database and syncs table/column shape — it silently ignores every hand-written SQL file in `drizzle/` (RLS policies, the signup trigger, `charge_credits`/`refund_credits`, the explicit grants), since those aren't expressible in `schema.ts` at all. `drizzle-kit migrate` walks every numbered file in `drizzle/` in order and actually runs all of it. Only reach for `push` later for a quick throwaway sync of a `schema.ts`-only change during local iteration — for anything touching RLS/functions/grants, write a migration (`db:generate` for a schema diff, `db:generate --custom` for hand-written SQL) and `db:migrate` it.

One manual step in the Supabase dashboard: **Authentication → Providers → Email → "Confirm email"** should be ON (it is by default on new projects) — that's what makes email verification actually required before a session exists; nothing in this codebase can enforce that from the outside, it's a Supabase Auth setting.

For Google OAuth: **Authentication → Providers → Google**, plug in a Google Cloud OAuth client's id/secret and set the redirect URI to `<your-supabase-url>/auth/v1/callback`. The sign-in button already works once that's configured — no code changes needed.

Once you've signed up once through the UI, you can seed the three real demo projects (Navneet/Porsche 911, Porsche Taste Test, Testimonial Ad) against your own account:

```bash
# Get your user id from Supabase's Authentication -> Users table
SEED_USER_ID=<your-uuid> npm run db:seed
```

`npm run db:studio` opens Drizzle Studio against your Supabase Postgres.

### Running tests

```bash
npm run typecheck   # next typegen + tsc --noEmit
npm run lint
npm test            # unit tests (always run) + the RLS integration test
                     # (auto-skips unless NEXT_PUBLIC_SUPABASE_URL / ANON_KEY /
                     # SUPABASE_SERVICE_ROLE_KEY are set in the test environment)
npm run test:e2e     # Playwright critical path — needs the same live credentials
                     # plus `npx playwright install` once
```

## Why two DB tools

Drizzle (`src/db/schema.ts`, `drizzle-kit`) defines the schema and generates migrations — it's a good, typed way to author `CREATE TABLE`/`ALTER TABLE` SQL. But RLS policies check `auth.uid()`, which Postgres only populates when the connection goes through Supabase's auth-aware path. Drizzle talking to Postgres directly (`postgres-js`) doesn't do that automatically — getting RLS to work through it means manually forwarding the user's JWT into every DB session, a well-known footgun (get it wrong once and a query either silently bypasses RLS or fails confusingly). The Supabase client (`@supabase/ssr` + `@supabase/supabase-js`) does this correctly by design, so it's what every page/action/route actually queries through. Drizzle never runs at request time — only `db:generate`/`db:migrate`/`db:push`/`db:seed`, all local/CI-time commands.

One practical consequence: the Supabase client (PostgREST) returns timestamp columns as ISO strings, not the `Date` objects Drizzle would give you. `src/lib/case-convert.ts` + `src/lib/db-rows.ts` convert Supabase's snake_case/string rows into the same camelCase/`Date` shape the (pre-existing) `ProjectCard`/`StatusBadge` components expect, so those components didn't need to change.

## RLS structure

Every table has RLS **enabled**, and every table has an **explicit policy for every operation it should support** — a table with a SELECT policy and no others isn't "read-only by default," it's often silently writable, since RLS-enabled-with-no-policy only denies the operations nobody thought to write a policy for. Full policies: `drizzle/0001_rls_and_auth_fk.sql` (profiles/projects/project_stages/project_assets/renders/credits_ledger) and `drizzle/0003_rate_limits_rls.sql` (rate_limits).

| Table | Ownership check | Notable restriction |
|---|---|---|
| `profiles` | `id = auth.uid()` | INSERT has **no policy at all** — rows are only created by a `SECURITY DEFINER` trigger on `auth.users` signup. `credits_balance` is column-`REVOKE`d from `authenticated` even on your own row (see below) |
| `projects` | `user_id = auth.uid()` | INSERT/UPDATE use `WITH CHECK`, not just `USING` — stops a client from writing a *different* `user_id` into a row it's allowed to touch |
| `project_stages` / `project_assets` | no `user_id` column — ownership via `project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())` | same reasoning as above; these are read rarely (one project page load) vs. `renders`, so a join beats denormalizing `user_id` onto every child table |
| `renders` | `user_id = auth.uid()` (denormalized — read/rate-limited per-user directly, not through a join) | INSERT requires `status = 'queued'` (can't insert a pre-marked-complete render) **and** that `project_id` really belongs to you. UPDATE is column-`REVOKE`d down to `acknowledged_at` only — status/credits/output are worker-only (service_role) |
| `credits_ledger` | `user_id = auth.uid()`, **SELECT only** | no INSERT/UPDATE/DELETE policy for `authenticated` exists, period. Every write goes through `charge_credits`/`refund_credits`, two `SECURITY DEFINER` SQL functions grantable only to `service_role` |
| `rate_limits` | none | RLS enabled, zero policies for `anon`/`authenticated` — reachable only via `service_role` from `src/lib/rate-limit.ts` |

The one place this schema uses a real foreign key (against this project's usual no-FK-constraints convention): `profiles.id → auth.users(id) ON DELETE CASCADE`. `auth.users` is owned by Supabase Auth, outside the app entirely — if an account is ever hard-deleted there, the profile shouldn't silently outlive it as an orphan the app can't reach through a normal query. Every other relationship (`projects.user_id`, `project_id` on child tables) stays a plain column, no constraint, enforced by RLS instead — consistent with the rest of the schema.

**Column-level locks, not just row-level:** RLS is row-level by nature — it can't say "you may update this row, but only these columns." Two places needed that guarantee anyway, so they use plain Postgres `REVOKE`/`GRANT` alongside the RLS policy: `profiles.credits_balance` (must only change via the ledger functions, never a raw client `UPDATE`) and everything on `renders` except `acknowledged_at` (status/output/credits are worker-only). This is what actually makes "forge a billing update" impossible, not just discouraged.

## Self-attack review (Part 2's explicit ask)

| Attack | Result |
|---|---|
| Read another user's project via its id | RLS filters the row out entirely — a cross-user fetch and a nonexistent id return the identical "not found," so a 404 never confirms a project exists and isn't yours |
| Insert/update a project claiming someone else's `user_id` | Rejected — every INSERT/UPDATE policy has a `WITH CHECK`, not just `USING` |
| Trigger a render on someone else's project | RLS policy is written and ready (`renders_insert_own` checks both `user_id` and the project's real owner) — there's no render-trigger UI/action yet to attack live, since that pipeline isn't built (see **What's stubbed**) |
| Forge a billing update (edit your own `credits_balance`, or insert into `credits_ledger`) | Blocked at the schema layer, not just app code — no policy grants either operation to `authenticated`, and `credits_balance` is column-`REVOKE`d even where a row-level policy would otherwise allow the write |

`src/lib/rls.integration.test.ts` automates the first, second, and fourth of these against a real Supabase project (two real test users, real RLS, real assertions) — see **Known gaps** for why it hasn't actually been run yet.

## Security/scaling trade-offs

- **Rate limiting is Postgres-backed (`src/lib/rate-limit.ts`), not Upstash/Redis.** One fewer external service/account needed at this stage; the honest cost is every check is a DB round-trip and it doesn't shard across regions. Revisit with Upstash if auth endpoints see real abuse volume — the call sites (`checkRateLimit(key, limits)`) wouldn't need to change, just the implementation behind them.
- **No Supabase-generated TypeScript types** (`supabase gen types typescript` needs a live project to introspect, which didn't exist during this build). Runtime code accepts this via the `case-convert`/`db-rows` mapping layer; `src/lib/rls.integration.test.ts` opts out of strict typing explicitly (documented inline) rather than fighting it. Generate real types once the project exists and this can tighten up.
- **`profiles.id → auth.users` is the only real foreign key in the schema**, against this project's normal no-FK convention — see the RLS section above for why that specific relationship is the exception.
- **Flat render cost, no tiering.** `RENDER_COST_CREDITS = 5` regardless of video length/resolution (`src/lib/credits-core.ts`) — fine for a placeholder, wrong for real usage-based billing once the render pipeline exists.
- **Payments are entirely unbuilt.** The billing page shows real balance + real transaction history from `credits_ledger`, but "Buy more credits" is a disabled button. No Stripe/payment provider integration exists.

## What's stubbed

- **Payments** — billing page is real (balance, ledger), purchasing more credits is not.
- **The actual render pipeline** — no "trigger a render" action exists yet. The credit-charging primitive and its RLS policy are ready for whenever that's built (`src/lib/credits.ts`'s `chargeForRender`/`refundRender`).
- **Notifications** are derived from `renders` (`status IN (ready, failed) AND acknowledged_at IS NULL`), not a separate table — there's nothing to populate them with yet, same reason as above.
- **Project status taxonomy mismatch, flagged rather than silently resolved:** the brief describes project status as `draft/queued/rendering/done/failed`; this schema already had (and keeps) a richer, pre-existing convention — `projects.status` is pipeline status (`in_progress/completed/needs_review/cancelled`, matching the existing `StatusBadge`/`ProjectCard` components), while `renders.status` is per-render-attempt status (`queued/processing/ready/failed`, closer to what the brief meant). A new project starts `in_progress`; there's no `draft` value in the existing taxonomy, and none was added rather than guessing at a redesign of an already-working component contract.

## Known gaps

Everything above was written and passes what can be checked without a live Supabase project (`npm run typecheck`, `npm run lint`, `npm test`'s unit suite — 22/22 passing). What has **not** been run, because no credentials were available during this build:

- `src/lib/rls.integration.test.ts` — writes real cross-user RLS attacks against a live project; currently auto-skips.
- `e2e/critical-path.spec.ts` — the full signup → verify → onboarding → dashboard → create project flow via Playwright; currently auto-skips.
- The manual error-path check (invalid input, expired session, duplicate signup all render real inline error UI, not a blank screen) was done by code review — every form routes errors through the same `FormMessage` component and every Server Action returns `{error}` rather than throwing — but not by actually clicking through a running app.

Once `.env.local` is filled in: `npm run db:migrate`, sign up once through the UI, then `npm test && npm run test:e2e` should turn all of the above from "written" into "verified." That's the concrete next step.

**One more real setup gotcha, hit and fixed during this build:** Supabase's *direct* database connection (`db.<ref>.supabase.co:5432`) is IPv6-only unless you pay for the IPv4 add-on — if your network/CI has no outbound IPv6 route, `drizzle-kit` will hang indefinitely trying to connect, not error. Use the **pooled** connection string (`Transaction pooler`, port 6543, hostname like `aws-*.pooler.supabase.com`) for `DATABASE_URL` instead — it's IPv4-reachable. This overrides an earlier, wrong instinct that the direct connection was preferable for migrations specifically; in practice, basic connectivity trumps that.
