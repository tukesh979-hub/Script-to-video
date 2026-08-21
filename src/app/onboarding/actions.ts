"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/onboarding";
import type { ActionState } from "@/app/(auth)/actions";

export async function completeOnboardingAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  // Defense in depth -- proxy.ts already keeps logged-out users off this
  // route, but this action re-verifies rather than trusting that alone (see
  // Next's auth guide: proxy is not the only line of defense).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const validated = onboardingSchema.safeParse({ displayName: formData.get("displayName") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  // Only display_name/onboarding_completed_at are actually grantable to
  // `authenticated` on this table (see drizzle/0001_rls_and_auth_fk.sql) --
  // credits_balance and everything else stays out of reach even if this
  // update object grew by mistake later.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: validated.data.displayName, onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not save your profile. Try again." };
  }

  redirect("/dashboard");
}
