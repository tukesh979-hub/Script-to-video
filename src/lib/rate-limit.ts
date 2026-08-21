import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

/**
 * Fixed-window rate limiter, backed by the rate_limits table (RLS-locked,
 * service_role-only -- see drizzle/0003_rate_limits_rls.sql). Postgres, not
 * Upstash/Redis: one fewer external service/account to set up at this stage.
 * Trade-off: every check is a DB round-trip, and this doesn't shard well
 * across regions -- fine for current traffic, revisit with Upstash if auth
 * endpoints ever see real abuse volume (see README).
 *
 * Fails OPEN on a DB error (logs, allows the request) rather than locking
 * everyone out because Postgres hiccuped -- a rate limiter being briefly
 * unavailable should never become its own outage.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<{ allowed: boolean; remaining: number }> {
  const admin = createAdminSupabaseClient();
  const now = new Date();
  const windowStartFloor = new Date(Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000);

  const { data, error } = await admin.rpc("increment_rate_limit", {
    p_key: key,
    p_window_start: windowStartFloor.toISOString(),
  });

  if (error) {
    console.error("rate limit check failed, failing open", error);
    return { allowed: true, remaining: limit };
  }

  const count = data as number;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

// Shared limits, named by what they protect. Numbers are deliberately
// generous starting points, not load-tested -- tune once real usage exists.
export const RATE_LIMITS = {
  login: { limit: 10, windowSeconds: 60 },
  register: { limit: 5, windowSeconds: 60 * 10 },
  resetPassword: { limit: 3, windowSeconds: 60 * 10 },
  projectCreate: { limit: 20, windowSeconds: 60 * 60 },
  renderTrigger: { limit: 10, windowSeconds: 60 * 60 },
} as const;
