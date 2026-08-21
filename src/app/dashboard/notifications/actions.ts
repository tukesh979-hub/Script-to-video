"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";

export async function acknowledgeRenderAction(renderId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  // .eq("user_id", ...) here is redundant with RLS but kept explicit --
  // acknowledged_at is the ONE column `authenticated` can write on this
  // table (see the REVOKE/GRANT in drizzle/0001_rls_and_auth_fk.sql), so
  // even a forged renderId for someone else's row is rejected at the DB
  // layer regardless of what this query does.
  await supabase.from("renders").update({ acknowledged_at: new Date().toISOString() }).eq("id", renderId).eq("user_id", user.id);

  revalidatePath("/dashboard/notifications");
}
