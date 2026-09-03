"use client";

import { useActionState } from "react";
import { completeOnboardingAction } from "./actions";
import type { ActionState } from "@/app/(auth)/actions";
import { FieldLabel, TextInput, PrimaryButton, FormMessage } from "@/components/auth/ui";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(completeOnboardingAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <FieldLabel htmlFor="displayName">What should we call you?</FieldLabel>
        <TextInput id="displayName" name="displayName" autoComplete="name" required disabled={pending} />
      </div>

      <FormMessage error={state?.error} />

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue to dashboard"}
      </PrimaryButton>
    </form>
  );
}
