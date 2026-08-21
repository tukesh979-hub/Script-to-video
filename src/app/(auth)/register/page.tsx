"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, signInWithGoogleAction, type ActionState } from "../actions";
import { FieldLabel, TextInput, PrimaryButton, SecondaryButton, FormMessage } from "@/components/auth/ui";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(registerAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Create an account</h1>
        <p className="mt-2 text-base text-foreground/70">Start turning scripts into video.</p>
      </div>

      <form action={signInWithGoogleAction}>
        <SecondaryButton type="submit">Continue with Google</SecondaryButton>
      </form>

      <div className="flex items-center gap-3 text-xs text-faint">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      {state?.success ? (
        <FormMessage success={state.success} />
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <TextInput id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
          </div>
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
            />
            <p className="mt-2 text-sm text-foreground/60">At least 8 characters, with a letter and a number.</p>
          </div>

          <FormMessage error={state?.error} />

          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </PrimaryButton>
        </form>
      )}

      <p className="text-center text-sm text-foreground/70">
        Already have an account?{" "}
        <Link href="/login" className="text-lime-dim hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
