"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { createProjectSchema } from "@/lib/validation/project";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { ActionState } from "@/app/(auth)/actions";

export async function createProjectAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const rl = await checkRateLimit(`project-create:${user.id}`, RATE_LIMITS.projectCreate);
  if (!rl.allowed) {
    return { error: "You've hit the project creation limit for now. Try again later." };
  }

  const validated = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  // user_id is set from the verified session, never trusted from the form --
  // and projects_insert_own's WITH CHECK would reject a mismatched value
  // even if it were.
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: validated.data.name, description: validated.data.description, status: "in_progress" })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not create the project. Try again." };
  }

  redirect(`/dashboard/projects/${data.id}`);
}
