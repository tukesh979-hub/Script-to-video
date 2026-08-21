import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingHero } from "@/components/LandingHero";

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
    <div className="flex w-full flex-1 flex-col">
      <LandingHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
        <LandingHero />
      </main>
    </div>
  );
}
