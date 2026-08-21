import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Postgres (Supabase). Conventions carried over from the SQLite-era file, now
 * literal instead of aspirational: TEXT everywhere (no VARCHAR), no FK
 * constraints on application relationships (ownership is enforced by RLS
 * policies, not the schema -- see supabase/migrations/0002_rls.sql), soft
 * delete via deletedAt rather than hard deletes, uuid_generate_v4() primary
 * keys (uuid-ossp extension, enabled in 0001_extensions.sql) -- matching this
 * project's established Postgres/Exposed conventions.
 *
 * One deliberate exception to "no FK constraints": profiles.id really does
 * reference auth.users(id) on delete cascade, added via raw SQL in the
 * migration rather than here (Drizzle's pg-core has no clean way to point a
 * column at a schema it doesn't manage). auth.users is owned and maintained
 * by Supabase Auth, outside this app entirely -- if a user is ever hard-
 * deleted from auth (support request, GDPR, etc.), their profile should not
 * silently outlive them as an orphaned row the app has no way to reach
 * through normal query paths. That's the one place a DB-level constraint is
 * doing something app-level cleanup code can't be trusted to always run.
 */

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // = auth.users.id (see migration for the FK)
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  // Cached balance, kept in sync with creditsLedger via an atomic increment in
  // the same transaction as every ledger insert (see lib/credits.ts) --
  // avoids re-summing the whole ledger on every dashboard/billing read.
  creditsBalance: integer("credits_balance").notNull().default(0),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// Matches the Idea-to-Video dashboard's own status taxonomy (02-dashboard-
// redesign-context.md) -- folder-style grouping on the dashboard reads off
// this exact set.
export const projectStatusValues = ["in_progress", "completed", "needs_review", "cancelled"] as const;
export type ProjectStatus = (typeof projectStatusValues)[number];

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in_progress"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  // In-progress-only fields -- null once completed.
  progressPercent: integer("progress_percent"),
  currentStage: text("current_stage"),
  // Quick-stats row on the completed card (02-dashboard-redesign-context.md).
  stageCount: integer("stage_count"),
  frameCount: integer("frame_count"),
  voTakes: integer("vo_takes"),
  reviewNote: text("review_note"), // shown on the card itself when status = needs_review
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

/**
 * One row per pipeline stage that actually happened for a project, in real
 * production order (stageOrder is per-project, pulled from that project's own
 * history -- never a hardcoded universal order across all projects; a project
 * simply has no row for a stage that didn't apply, e.g. no "voiceover" row
 * for a real-footage project).
 *
 * dataJson is intentionally loose (JSON-as-TEXT, this project's usual
 * "flexible data" convention) rather than one rigid column set, because what
 * a stage needs to show varies a lot by stageType -- a caption stage needs
 * word-timing + source; a scene needs technique + assets + overlays; assembly
 * needs mix settings. Each stageType's shape is documented next to where it's
 * rendered (src/lib/stages.ts), not enforced at the DB layer.
 *
 * No userId here -- ownership flows through projectId -> projects.userId.
 * RLS policies join to projects rather than denormalizing userId onto every
 * child table; this table is read rarely (one project page load) compared to
 * renders, so the join cost isn't worth the duplicated column. Revisit if
 * that assumption stops holding at scale.
 */
export const stageTypeValues = [
  "raw_footage",
  "captions",
  "voiceover",
  "sfx",
  "storyboard",
  "beat_sheet",
  "scene",
  "assembly",
] as const;
export type StageType = (typeof stageTypeValues)[number];

export const projectStages = pgTable("project_stages", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull(),
  stageType: text("stage_type").notNull(),
  stageOrder: integer("stage_order").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(), // one-line "what happened", shown collapsed
  dataJson: text("data_json").notNull(), // stage-specific detail, JSON.stringify'd
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
export type ProjectStage = typeof projectStages.$inferSelect;
export type NewProjectStage = typeof projectStages.$inferInsert;

/**
 * One row per asset used anywhere in a project -- the consolidated asset
 * sheet (spec section 4), separate from the per-scene breakdown so it can be
 * browsed as one table rather than re-derived from stage JSON on every page
 * load. Same no-userId-here reasoning as projectStages above.
 */
export const assetTypeValues = ["code_drawn", "ai_generated", "user_supplied"] as const;
export type AssetType = (typeof assetTypeValues)[number];

export const projectAssets = pgTable("project_assets", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  usedInScenes: text("used_in_scenes").notNull(), // comma-separated scene labels, e.g. "Beat 3, Beat 6"
  prompt: text("prompt"), // full prompt, only set for ai_generated assets
  sourcePath: text("source_path"), // repo-relative path, for code_drawn/user_supplied
});
export type ProjectAsset = typeof projectAssets.$inferSelect;
export type NewProjectAsset = typeof projectAssets.$inferInsert;

/**
 * One row per render attempt. userId IS denormalized here (unlike stages/
 * assets above) -- renders are the hot path: polled for status, rate-limited
 * per-user, and joined against on the billing/notifications panels, so a
 * single-column RLS check (userId = auth.uid()) beats a join to projects on
 * every one of those.
 */
export const renderStatusValues = ["queued", "processing", "ready", "failed"] as const;
export type RenderStatus = (typeof renderStatusValues)[number];

export const renders = pgTable("renders", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull(),
  userId: uuid("user_id").notNull(),
  status: text("status").notNull().default("queued"),
  progressPercent: integer("progress_percent").notNull().default(0),
  outputUrl: text("output_url"),
  errorMessage: text("error_message"),
  creditsCharged: integer("credits_charged").notNull().default(0),
  // Notifications ("render complete/failed") are just renders where status is
  // ready/failed and acknowledgedAt is still null -- no separate
  // notifications table to keep in sync; dismissing one sets this.
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
export type Render = typeof renders.$inferSelect;
export type NewRender = typeof renders.$inferInsert;

/**
 * Append-only ledger, never mutated or deleted -- the source of truth for
 * credits. profiles.creditsBalance is a cached sum kept in sync atomically
 * (see lib/credits.ts) so reads don't have to aggregate this table every
 * time, but the ledger is what an audit or a support dispute goes back to.
 */
export const creditTxnReasonValues = ["signup_grant", "render_charge", "render_refund", "manual_adjustment"] as const;
export type CreditTxnReason = (typeof creditTxnReasonValues)[number];

export const creditsLedger = pgTable("credits_ledger", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull(),
  delta: integer("delta").notNull(), // positive = grant/refund, negative = charge
  reason: text("reason").notNull(),
  renderId: uuid("render_id"), // set when reason is render_charge / render_refund
  balanceAfter: integer("balance_after").notNull(), // snapshot at time of this entry
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export type CreditLedgerEntry = typeof creditsLedger.$inferSelect;
export type NewCreditLedgerEntry = typeof creditsLedger.$inferInsert;

/**
 * Fixed-window rate limiting (auth endpoints, render triggers, project
 * creation) -- Postgres-backed rather than Upstash/Redis to avoid adding a
 * second external service at this stage (see README's trade-offs section for
 * when to revisit this). Not user-owned data -- RLS is enabled with zero
 * policies (see migration), so it's reachable only via the service_role
 * client from lib/rate-limit.ts, never from a user-scoped query. `key` is
 * something like "login:1.2.3.4" or "render:create:<userId>".
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});
export type RateLimit = typeof rateLimits.$inferSelect;
