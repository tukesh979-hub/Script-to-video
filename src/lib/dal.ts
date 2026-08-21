import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rowToProfile } from "@/lib/db-rows";

/**
 * Data Access Layer, per Next's own auth guide (guides/authentication.md,
 * "Creating a Data Access Layer"). proxy.ts already keeps logged-out users
 * off protected routes, but that's an optimistic, cookie-only check -- this
 * is the real one, re-verified against Supabase Auth on every call, and it's
 * what every dashboard page/action actually calls before touching data.
 * `cache()` means multiple calls within one render pass only hit Supabase
 * Auth once.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

export const getProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data ? rowToProfile(data) : null;
});
