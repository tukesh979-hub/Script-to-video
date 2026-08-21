-- RLS, the profiles<->auth.users link, and the on-signup trigger.
-- Hand-written (not generated) -- none of this is expressible from schema.ts,
-- since auth.users belongs to Supabase Auth's own schema, not Drizzle's.
--
-- Every policy below is scoped `TO authenticated` only. `anon` gets nothing
-- on any of these tables -- there is no public read path anywhere in this
-- app, on purpose (see brief: "not a public URL anyone can guess").

-- ============================================================================
-- profiles <-> auth.users
-- ============================================================================

-- The one FK in this schema (see schema.ts's comment on `profiles` for why):
-- if a user is ever hard-deleted from auth.users, their profile shouldn't
-- outlive them as an orphaned row.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- SELECT: read your own profile only.
CREATE POLICY "profiles_select_own" ON "profiles"
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- INSERT: intentionally NO policy for `authenticated`. Profile rows are only
-- ever created by handle_new_user() below, which runs SECURITY DEFINER and
-- so bypasses RLS entirely. A client can never INSERT its own profiles row --
-- this closes off "sign up, then INSERT a profile with someone else's id."

-- UPDATE: your own row, and the WITH CHECK mirrors USING so you can't
-- rewrite `id` to someone else's during the update. Column-level GRANT/
-- REVOKE below (not RLS -- RLS is row-level, not column-level) stops
-- `credits_balance` from being touched directly even on your own row --
-- that must only change via the atomic ledger function in lib/credits.ts,
-- never a raw client UPDATE. This is the "forge a billing update" case.
CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON "profiles" FROM authenticated;
GRANT UPDATE (display_name, avatar_url, onboarding_completed_at, updated_at) ON "profiles" TO authenticated;

-- DELETE: intentionally NO policy. Account deletion goes through the
-- Supabase Admin API (deletes the auth.users row, which cascades here) --
-- never a raw client DELETE on profiles.

-- Auto-create a profile (and grant a starting credit balance) whenever a new
-- auth.users row appears -- the standard Supabase pattern, and the only
-- writer profiles.INSERT will ever have.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  starting_credits integer := 20; -- signup grant; see lib/credits.ts SIGNUP_GRANT_CREDITS
BEGIN
  INSERT INTO public.profiles (id, email, credits_balance)
  VALUES (new.id, new.email, starting_credits);

  INSERT INTO public.credits_ledger (user_id, delta, reason, balance_after)
  VALUES (new.id, starting_credits, 'signup_grant', starting_credits);

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- projects
-- ============================================================================

ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON "projects"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_own" ON "projects"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own" ON "projects"
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_delete_own" ON "projects"
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- project_stages / project_assets -- no user_id column, ownership via join
-- ============================================================================

ALTER TABLE "project_stages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_stages_select_own" ON "project_stages"
  FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_stages_insert_own" ON "project_stages"
  FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_stages_update_own" ON "project_stages"
  FOR UPDATE TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_stages_delete_own" ON "project_stages"
  FOR DELETE TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

ALTER TABLE "project_assets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_assets_select_own" ON "project_assets"
  FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_assets_insert_own" ON "project_assets"
  FOR INSERT TO authenticated
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_assets_update_own" ON "project_assets"
  FOR UPDATE TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "project_assets_delete_own" ON "project_assets"
  FOR DELETE TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ============================================================================
-- renders
-- ============================================================================

ALTER TABLE "renders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "renders_select_own" ON "renders"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: triggering a render on your own project only, and it must start
-- queued (can't be inserted pre-marked ready/processing to skip the queue or
-- fake a completed render without ever being charged/processed). Checking
-- BOTH user_id and project_id's real owner closes the case where user_id is
-- forged to your own id but project_id points at someone else's project.
CREATE POLICY "renders_insert_own" ON "renders"
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'queued'
    AND project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- UPDATE: your own row only, and (via column GRANT/REVOKE below) limited to
-- acknowledging a notification. status/credits_charged/output_url/
-- error_message/progress_percent are only ever written by the render worker,
-- which uses the service_role key (bypasses RLS) -- never by the client
-- directly. This is the "trigger/tamper with someone else's render, or forge
-- your own render's outcome" case.
CREATE POLICY "renders_update_own" ON "renders"
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

REVOKE UPDATE ON "renders" FROM authenticated;
GRANT UPDATE (acknowledged_at) ON "renders" TO authenticated;

-- DELETE: intentionally NO policy. Renders are billing/audit records --
-- never client-deletable, soft or hard.

-- ============================================================================
-- credits_ledger -- append-only, server-written only
-- ============================================================================

ALTER TABLE "credits_ledger" ENABLE ROW LEVEL SECURITY;

-- SELECT only: users can see their own transaction history for billing
-- transparency. No INSERT/UPDATE/DELETE policy exists for `authenticated` at
-- all -- every write to this table goes through lib/credits.ts's
-- service_role-backed function. There is no path, RLS or otherwise, for a
-- client to write here directly. This is the strongest form of "forge a
-- billing update is blocked."
CREATE POLICY "credits_ledger_select_own" ON "credits_ledger"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
