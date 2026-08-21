-- Baseline table-level privileges for `authenticated`, matching exactly what
-- each table's RLS design (0001/0003) already intends per operation. Needed
-- because this project is created with "Automatically expose new tables"
-- OFF (Supabase's own recommended, more secure default) -- without these,
-- Postgres rejects a query before RLS even runs, regardless of policy.
--
-- This is intentionally NOT a blanket `GRANT ALL` per table: granting only
-- the operations each table's policies actually cover is a second, redundant
-- layer -- if a future RLS policy is ever added too permissively by mistake,
-- a missing table-level grant here still blocks it. `anon` gets nothing
-- anywhere, same as always -- there is no public/unauthenticated data path
-- in this app.
--
-- rate_limits gets no grants at all here, on purpose -- it's reachable only
-- via service_role (see 0003_rate_limits_rls.sql), which already has full
-- access to every table by default as part of Supabase's own role setup,
-- independent of this "expose new tables" toggle.

GRANT SELECT, UPDATE ON "profiles" TO authenticated; -- no INSERT/DELETE -- see 0001's policy comments
GRANT SELECT, INSERT, UPDATE, DELETE ON "projects" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "project_stages" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "project_assets" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "renders" TO authenticated; -- no DELETE -- billing/audit records, never client-deletable
GRANT SELECT ON "credits_ledger" TO authenticated; -- SELECT only -- append-only, server-written only
