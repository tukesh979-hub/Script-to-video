import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side client -- Client Components only. Uses the public URL + anon
 * key (safe to ship; the anon key can only do what RLS allows an
 * authenticated/anon request to do). Every query issued through this client
 * is subject to RLS as the signed-in user, same as the server client below.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
