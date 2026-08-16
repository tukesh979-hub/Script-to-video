import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Local dev uses SQLite (zero setup); the shape here follows this project's
 * usual Postgres conventions so moving to Postgres later is a straight port,
 * not a redesign: TEXT everywhere (no VARCHAR), no foreign keys (relationships
 * handled at the application level), soft delete via deletedAt rather than
 * hard deletes, uuid primary keys (generated app-side via crypto.randomUUID()
 * since SQLite has no uuid_generate_v4()).
 */

// Matches the Idea-to-Video dashboard's own status taxonomy (02-dashboard-
// redesign-context.md) -- folder-style grouping on the dashboard reads off
// this exact set.
export const projectStatusValues = ["in_progress", "completed", "needs_review", "cancelled"] as const;
export type ProjectStatus = (typeof projectStatusValues)[number];

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
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
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
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

export const projectStages = sqliteTable("project_stages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  stageType: text("stage_type").notNull(),
  stageOrder: integer("stage_order").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(), // one-line "what happened", shown collapsed
  dataJson: text("data_json").notNull(), // stage-specific detail, JSON.stringify'd
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text("deleted_at"),
});
export type ProjectStage = typeof projectStages.$inferSelect;
export type NewProjectStage = typeof projectStages.$inferInsert;

/**
 * One row per asset used anywhere in a project -- the consolidated asset
 * sheet (spec section 4), separate from the per-scene breakdown so it can be
 * browsed as one table rather than re-derived from stage JSON on every page
 * load.
 */
export const assetTypeValues = ["code_drawn", "ai_generated", "user_supplied"] as const;
export type AssetType = (typeof assetTypeValues)[number];

export const projectAssets = sqliteTable("project_assets", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  usedInScenes: text("used_in_scenes").notNull(), // comma-separated scene labels, e.g. "Beat 3, Beat 6"
  prompt: text("prompt"), // full prompt, only set for ai_generated assets
  sourcePath: text("source_path"), // repo-relative path, for code_drawn/user_supplied
});
export type ProjectAsset = typeof projectAssets.$inferSelect;
export type NewProjectAsset = typeof projectAssets.$inferInsert;
