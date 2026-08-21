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
        <h1 className="font-display text-2xl text-foreground">Sign in</h1>
        <p className="mt-2 text-base text-foreground/70">Welcome back to your project library.</p>
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

      <div className="flex items-center gap-3 text-xs text-faint">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={action} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextInput id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/reset-password" className="text-sm text-foreground/60 hover:text-foreground">
              Forgot?
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
          {pending ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>

      <p className="text-center text-sm text-foreground/70">
        No account?{" "}
        <Link href="/register" className="text-lime-dim hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
