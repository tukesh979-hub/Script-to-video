"use client";

import { useActionState } from "react";
import { confirmPasswordResetAction, type ActionState } from "../../actions";
import { FieldLabel, TextInput, PrimaryButton, FormMessage } from "@/components/auth/ui";

export default function ConfirmResetPasswordPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(confirmPasswordResetAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-center font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">
          Set a new password
        </h1>
        <p className="mt-2 text-center text-[13.5px] text-[#16181d]/50">This link only works once.</p>
      </div>

      <form action={action} className="flex flex-col gap-3.5">
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
          <p className="mt-1.5 text-xs text-[#16181d]/40">At least 8 characters, with a letter and a number.</p>
        </div>

        <FormMessage error={state?.error} />

        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </PrimaryButton>
      </form>
    </div>
  );
}
