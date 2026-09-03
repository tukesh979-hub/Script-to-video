"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, signInWithGoogleAction, type ActionState } from "../actions";
import { FieldLabel, TextInput, PrimaryButton, SecondaryButton, FormMessage } from "@/components/auth/ui";

// useSearchParams() opts a component out of static rendering unless it's
// wrapped in Suspense -- found via `next build`, which fails outright
// without this (dev mode doesn't catch it). Split into its own component so
// only this part (not the whole page) needs the boundary.
function OAuthError() {
  const error = useSearchParams().get("error");
  if (!error) return null;
  return <FormMessage error={error} />;
}

export default function LoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-center font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">Welcome back</h1>
        <p className="mt-2 text-center text-[13.5px] text-[#16181d]/50">Sign in to continue to Script to Video</p>
      </div>

      <form action={signInWithGoogleAction}>
        <SecondaryButton type="submit">Continue with Google</SecondaryButton>
      </form>

      {/* signInWithGoogleAction redirects back here with ?error=... on
          failure -- found via manual testing that this was silently
          dropped: the page only ever read the form's own action state,
          never the URL, so a failed Google sign-in showed nothing at all
          instead of an error. */}
      <Suspense fallback={null}>
        <OAuthError />
      </Suspense>

      <div className="flex items-center gap-2.5 font-ui text-[11px] tracking-[0.06em] text-[#16181d]/35 uppercase">
        <div className="h-px flex-1 bg-[#16181d]/12" />
        or
        <div className="h-px flex-1 bg-[#16181d]/12" />
      </div>

      <form action={action} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextInput id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/reset-password" className="font-ui text-xs font-medium text-[#7c6ff0] hover:underline">
              Forgot password?
            </Link>
          </div>
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
        </div>

        <FormMessage error={state?.error} success={state?.success} />

        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign In"}
        </PrimaryButton>
      </form>

      <p className="text-center text-sm text-[#16181d]/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#7c6ff0] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
