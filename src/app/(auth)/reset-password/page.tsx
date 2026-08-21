"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type ActionState } from "../actions";
import { FieldLabel, TextInput, PrimaryButton, FormMessage } from "@/components/auth/ui";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestPasswordResetAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Reset password</h1>
        <p className="mt-2 text-base text-foreground/70">We&apos;ll email you a link to set a new one.</p>
      </div>

      {state?.success ? (
        <FormMessage success={state.success} />
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <TextInput id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
          </div>

          <FormMessage error={state?.error} />

          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </PrimaryButton>
        </form>
      )}

      <p className="text-center text-sm text-foreground/70">
        <Link href="/login" className="text-lime-dim hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
