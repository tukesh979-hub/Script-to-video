import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The one redirect target for every Supabase Auth email link (signup
 * verification, password reset) and the Google OAuth callback -- all three
 * arrive here with a `code` query param to exchange for a session (PKCE
 * flow). `next` lets a caller (see requestPasswordResetAction) route
 * post-exchange to somewhere other than the default.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Invalid or expired link.`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("This link is invalid or has expired.")}`);
  }

  // A fresh signup (email/password or first-time Google) has no profile
  // onboarding completed yet -- send them there instead of straight to
  // /dashboard. requestPasswordResetAction's `next` override still wins for
  // the password-reset flow, which doesn't want onboarding at all.
  if (next === "/dashboard") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .single();
      if (profile && !profile.onboarding_completed_at) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
