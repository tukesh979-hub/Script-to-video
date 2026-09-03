import Link from "next/link";

const LINKS = ["Platform", "Features ↓", "Projects", "Community"];

type Props =
  | { variant: "signed-out" }
  | { variant: "signed-in"; creditsBalance: number; creditsLimit: number; initials: string };

/** Shared glass nav for the hero-shell pages (signed-out marketing home and
 * the Signed-In Home) -- same logo/link structure, only the right side
 * swaps between Sign Up/Log In and a credits pill + avatar. Per
 * DESIGN-SYSTEM.md §2, "Platform"/"Features ↓"/"Projects"/"Community" have
 * no destination designed yet (Community is explicitly out of scope, the
 * rest are marketing-site sections that don't exist as real routes) -- kept
 * as static labels rather than dead links, matching the mockup's own plain
 * `<span>` markup for these. */
export function OceanicNav(props: Props) {
  return (
    <div className="glass mx-auto flex w-full max-w-275 items-center justify-between rounded-2xl px-5 py-3">
      <Link href="/" className="font-ui text-lg font-semibold tracking-tight text-[#16181d]">
        Script <span className="text-[#c94fd6]">to</span> Video
      </Link>
      <div className="hidden items-center gap-5.5 font-ui text-sm font-medium text-[#16181d]/65 md:flex">
        {LINKS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      {props.variant === "signed-out" ? (
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="rounded-[10px] border border-white/50 bg-white/35 px-4 py-2 font-ui text-[13px] font-medium text-[#16181d]"
          >
            Sign Up
          </Link>
          <Link href="/login" className="rounded-[10px] bg-[#14171c] px-4 py-2 font-ui text-[13px] font-medium text-white">
            Log In
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/billing"
            className="rounded-full border border-white/60 bg-white/50 px-3 py-1.5 font-ui text-xs font-medium text-[#16181d]"
          >
            {props.creditsBalance}/{props.creditsLimit} credits
          </Link>
          <Link
            href="/dashboard/account"
            className="oceanic-accent-gradient flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full font-ui text-[13px] font-semibold text-white"
          >
            {props.initials}
          </Link>
        </div>
      )}
    </div>
  );
}
