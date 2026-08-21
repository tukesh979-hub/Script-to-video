-- rate_limits: RLS enabled, deliberately ZERO policies for anon/authenticated.
-- No client, however it tries, gets any access -- reachable only via the
-- service_role client (bypasses RLS by design), which is all
-- lib/rate-limit.ts ever uses. Not user-owned data, so no ownership policy
-- makes sense here; this is the "lock it down completely" case.
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;

-- Atomic increment-and-read: one round trip, no read-then-write race between
-- two concurrent requests from the same key (matches this project's
-- "atomic SQL operations for counters" convention). Resets the count
-- whenever a request lands in a new window instead of the row's current one.
CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_key text, p_window_start timestamptz)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN rate_limits.window_start = p_window_start THEN rate_limits.count + 1
      ELSE 1
    END,
    window_start = p_window_start
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

-- service_role bypasses RLS, but EXECUTE still needs an explicit grant since
-- this function is SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) TO service_role;
