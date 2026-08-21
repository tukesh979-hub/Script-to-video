-- uuid_generate_v4() (this project's uuid convention, see schema.ts) needs
-- uuid-ossp -- Supabase has it available but doesn't enable it by default.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--> statement-breakpoint
CREATE TABLE "credits_ledger" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"render_id" uuid,
	"balance_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"credits_balance" integer DEFAULT 0 NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_assets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"asset_type" text NOT NULL,
	"used_in_scenes" text NOT NULL,
	"prompt" text,
	"source_path" text
);
--> statement-breakpoint
CREATE TABLE "project_stages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage_type" text NOT NULL,
	"stage_order" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"data_json" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"thumbnail_url" text,
	"video_url" text,
	"duration_seconds" integer,
	"progress_percent" integer,
	"current_stage" text,
	"stage_count" integer,
	"frame_count" integer,
	"vo_takes" integer,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "renders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"output_url" text,
	"error_message" text,
	"credits_charged" integer DEFAULT 0 NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
