import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OceanicNav } from "@/components/oceanic/OceanicNav";
import { OceanicTypeBar } from "@/components/oceanic/OceanicTypeBar";
import { VideoReel } from "@/components/oceanic/VideoReel";
import { HowItWorks } from "@/components/oceanic/HowItWorks";
import { ParallaxCTA } from "@/components/oceanic/ParallaxCTA";

// Placeholder plan ceiling shown next to the live credits balance -- the
// schema only tracks the running balance (profiles.creditsBalance), not a
// per-cycle plan limit, so this is a fixed display constant matching the
// validated mockup ("60/450 credits") rather than a fabricated DB field.
const CREDITS_PLAN_LIMIT = 450;

/** Oceanic Design's "Main — Signed Out" page (`#main-logout`). */
export default async function LandingPage() {
  // Optimistic redirect already happens in proxy.ts for logged-in users
  // hitting /login, but / itself isn't an auth page in that list -- a
  // signed-in visitor landing here should still skip straight to their
  // dashboard rather than see marketing copy again.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="w-full">
      <div className="oceanic-hero-wash relative overflow-hidden px-6 pt-7 pb-40 sm:px-10 sm:pb-62.5">
        <OceanicNav variant="signed-out" />
        <div className="flex flex-col items-center pt-14 text-center sm:pt-22.5">
          <h1 className="font-heading text-[34px] font-semibold tracking-tight text-[#16181d]/85">
            What are we <span className="oceanic-accent-text">making</span> today?
          </h1>
          <p className="mt-2.5 text-sm text-[#16181d]/50 sm:text-[14px]">
            One agent runs the whole pipeline — research, script, storyboard, film &amp; more
          </p>
          <OceanicTypeBar variant="signed-out" creditsBalance={60} creditsLimit={CREDITS_PLAN_LIMIT} />
        </div>
        <VideoReel />
      </div>

      <HowItWorks />
      <ParallaxCTA />
    </div>
  );
}
