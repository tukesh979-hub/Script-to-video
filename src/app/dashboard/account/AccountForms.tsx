"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "./actions";
import type { ActionState } from "@/app/(auth)/actions";
import { FieldLabel, TextInput, PrimaryButton, FormMessage } from "@/components/auth/ui";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfileAction, undefined);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <div>
        <FieldLabel htmlFor="displayName">Display name</FieldLabel>
        <TextInput id="displayName" name="displayName" defaultValue={initialName} required disabled={pending} />
      </div>
      <FormMessage error={state?.error} success={state?.success} />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </PrimaryButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePasswordAction, undefined);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <div>
        <FieldLabel htmlFor="password">New password</FieldLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          disabled={pending}
        />
        <p className="mt-1.5 text-xs text-faint">At least 8 characters, with a letter and a number.</p>
      </div>
      <FormMessage error={state?.error} success={state?.success} />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </PrimaryButton>
    </form>
  );
}
