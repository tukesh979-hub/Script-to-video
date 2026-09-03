import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";
import { GridBackground } from "@/components/GridBackground";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  // One-time -- once done, this route just forwards to the dashboard instead
  // of showing the form again.
  if (profile?.onboarding_completed_at) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <GridBackground />
      <div className="w-full max-w-md border border-border bg-panel p-8 sm:p-10">
        <h1 className="font-display text-2xl text-foreground">Welcome</h1>
        <p className="mt-2 mb-6 text-base text-foreground/70">One quick thing before your dashboard.</p>
        <OnboardingForm />
      </div>
    </div>
  );
}
