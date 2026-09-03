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
        <h1 className="text-center font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">
          Create your account
        </h1>
        <p className="mt-2 text-center text-[13.5px] text-[#16181d]/50">Free to start — no card required</p>
      </div>

      <form action={signInWithGoogleAction}>
        <SecondaryButton type="submit">Continue with Google</SecondaryButton>
      </form>

      <div className="flex items-center gap-2.5 font-ui text-[11px] tracking-[0.06em] text-[#16181d]/35 uppercase">
        <div className="h-px flex-1 bg-[#16181d]/12" />
        or
        <div className="h-px flex-1 bg-[#16181d]/12" />
      </div>

      {state?.success ? (
        <FormMessage success={state.success} />
      ) : (
        <form action={action} className="flex flex-col gap-3.5">
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
            <p className="mt-1.5 text-xs text-[#16181d]/40">At least 8 characters, with a letter and a number.</p>
          </div>

          <FormMessage error={state?.error} />

          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create Account"}
          </PrimaryButton>
        </form>
      )}

      <p className="text-center text-sm text-[#16181d]/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#7c6ff0] hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-[11.5px] leading-relaxed text-[#16181d]/35">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
