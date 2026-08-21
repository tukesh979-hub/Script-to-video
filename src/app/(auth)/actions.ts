"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
} from "@/lib/validation/auth";

export type ActionState = { error?: string; success?: string } | undefined;

async function clientIp(): Promise<string> {
  const h = await headers();
  // Vercel sets x-forwarded-for; falls back to a shared bucket locally where
  // there's no proxy in front of the dev server.
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local-dev";
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const rl = await checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
  if (!rl.allowed) {
    return { error: "Too many login attempts. Wait a minute and try again." };
  }

  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    // Supabase's own message ("Invalid login credentials") is already
    // user-safe and deliberately vague about which field was wrong -- don't
    // leak "no account with that email" separately, that's an enumeration
    // vector.
    return { error: error.message };
  }

  // Found via manual E2E testing: only /auth/callback (the email-link/OAuth
  // path) checked onboarding status -- a returning user logging in through
  // this plain email/password form skipped the onboarding gate entirely,
  // even on their very first login. Both paths need the same check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", data.user.id)
    .single();

  redirect(profile && !profile.onboarding_completed_at ? "/onboarding" : "/dashboard");
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const rl = await checkRateLimit(`register:${ip}`, RATE_LIMITS.register);
  if (!rl.allowed) {
    return { error: "Too many signup attempts. Wait a while and try again." };
  }

  const validated = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...validated.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    // Supabase returns a generic-enough message for "email already
    // registered" in most configurations; if it ever doesn't, do NOT surface
    // the raw message here without checking for account enumeration risk.
    return { error: error.message };
  }

  return { success: "Check your email for a verification link before signing in." };
}

export async function requestPasswordResetAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const rl = await checkRateLimit(`reset-password:${ip}`, RATE_LIMITS.resetPassword);
  if (!rl.allowed) {
    return { error: "Too many reset attempts. Wait a while and try again." };
  }

  const validated = resetPasswordRequestSchema.safeParse({ email: formData.get("email") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/confirm`,
  });

  // Always the same response whether or not the email exists -- distinguishing
  // the two is a textbook account-enumeration leak on a password-reset form.
  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function confirmPasswordResetAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validated = resetPasswordConfirmSchema.safeParse({ password: formData.get("password") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  // Requires the short-lived recovery session set by /auth/callback after the
  // reset-password email link was clicked -- getUser() here confirms it's
  // actually present, not just trusting the form was reached.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: validated.data.password });
  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

export async function signInWithGoogleAction() {
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    // Log the real reason server-side (e.g. Supabase's "provider is not
    // enabled" when Google OAuth hasn't been configured in the dashboard
    // yet) -- the user-facing message stays generic on purpose, this is for
    // whoever's running the app to debug from the server log.
    console.error("Google sign-in failed:", error?.message ?? "no URL returned");
    redirect("/login?error=Could not start Google sign-in. Try email instead.");
  }

  redirect(data.url);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
