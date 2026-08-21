"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { resetPasswordConfirmSchema } from "@/lib/validation/auth";
import type { ActionState } from "@/app/(auth)/actions";

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const validated = onboardingSchema.safeParse({ displayName: formData.get("displayName") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: validated.data.displayName })
    .eq("id", user.id);

  if (error) return { error: "Could not save changes." };

  revalidatePath("/dashboard/account");
  revalidatePath("/dashboard", "layout");
  return { success: "Saved." };
}

export async function changePasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const validated = resetPasswordConfirmSchema.safeParse({ password: formData.get("password") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: validated.data.password });
  if (error) return { error: error.message };

  return { success: "Password updated." };
}
