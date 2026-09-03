"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";
import type { ActionState } from "@/app/(auth)/actions";
import { FieldLabel, TextInput, PrimaryButton, FormMessage } from "@/components/auth/ui";

export function NewProjectForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createProjectAction, undefined);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div>
        <FieldLabel htmlFor="name">Project name</FieldLabel>
        <TextInput id="name" name="name" required disabled={pending} placeholder="e.g. Q3 Launch Reel" />
      </div>
      <div>
        <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={pending}
          placeholder="What's this video for?"
          className="w-full resize-none border border-border bg-panel-2 px-3 py-2.5 text-sm text-foreground placeholder:text-faint outline-none transition-colors focus:border-lime disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <FormMessage error={state?.error} />

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </PrimaryButton>
    </form>
  );
}
