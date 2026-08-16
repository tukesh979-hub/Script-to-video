import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Local dev uses SQLite (zero setup); the shape here follows this project's
 * usual Postgres conventions so moving to Postgres later is a straight port,
 * not a redesign: TEXT everywhere (no VARCHAR), no foreign keys (relationships
 * handled at the application level), soft delete via deletedAt rather than
 * hard deletes, uuid primary keys (generated app-side via crypto.randomUUID()
 * since SQLite has no uuid_generate_v4()).
 *
 * This is intentionally small — just enough for the Dashboard (list projects,
 * show status). Render-job tracking (chunks, progress, retries) belongs to
 * the pipeline sub-project's own table(s), added when that's designed --
 * not guessed at here.
 */
export const projectStatusValues = [
  "draft", // script/idea only, nothing built yet
  "building", // EDL/assets being generated
  "rendering", // chunked render in progress
  "ready", // final video available
  "failed",
] as const;
export type ProjectStatus = (typeof projectStatusValues)[number];

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
