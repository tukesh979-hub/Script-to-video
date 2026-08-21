import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Server-side client (Server Components, Server Actions, Route Handlers).
 * Reads the session from cookies and forwards it to Supabase, so every query
 * through this client runs as the signed-in user -- RLS applies exactly as
 * it would from the browser client. This is the client nearly everything in
 * this app should use.
 *
 * Server Components can't set cookies -- if this is called from one, the
 * `setAll` write is a no-op wrapped in try/catch (matches the official
 * @supabase/ssr guidance). Session refresh still happens correctly because
 * proxy.ts refreshes the token on every request before Server Components run.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component -- proxy.ts already refreshes
            // the session on every request, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * service_role client -- BYPASSES RLS ENTIRELY. Never import this into
 * anything that runs in response to untrusted client input without an
 * explicit, manual ownership check first (this client will not stop you from
 * reading/writing any row). Its only legitimate uses in this app:
 *   - handle_new_user's SECURITY DEFINER trigger runs in Postgres, not here,
 *     so this client isn't involved in signup at all.
 *   - the render worker updating status/credits_charged/output_url on a
 *     render row -- there's no "signed-in user" during background
 *     processing, and the columns it touches are already REVOKEd from
 *     `authenticated` at the RLS layer (see drizzle/0001_rls_and_auth_fk.sql),
 *     so this is the intended, sole writer for those columns.
 *   - lib/credits.ts's atomic ledger insert + balance update, run inside a
 *     transaction after the caller has already verified ownership with the
 *     user-scoped client.
 * Server-only: SUPABASE_SERVICE_ROLE_KEY is never NEXT_PUBLIC_ and this file
 * has no "use client" path into it.
 */
export function createAdminSupabaseClient() {
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
