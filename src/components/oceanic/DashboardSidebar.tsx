"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";

type NavItem = { label: string; glyph: string; href?: string };

// Per DESIGN-SYSTEM.md §2: "Sidebar nav (per original brief, unchanged)".
// Most of these items (Assets/Storyboards/Beat Sheets/Animations/Sound/
// Exports/Templates/Community) have no real route yet -- the project
// workspace and Templates/Community are explicitly out of scope (see
// "Known Gaps & Deferred Decisions"). They render as static, non-navigating
// labels (dimmed) rather than dead links. "Settings"/"Profile" map onto the
// real Billing/Account routes -- the mockup itself marks "Settings" active
// on the Billing screen and "Profile" active on the Account screen, so that
// pairing is carried over rather than invented.
const PRIMARY: NavItem[] = [
  { label: "Create", glyph: "✦", href: "/dashboard" },
  { label: "Projects", glyph: "▦", href: "/dashboard/projects" },
  { label: "Assets", glyph: "🖼" },
  { label: "Storyboards", glyph: "🎬" },
  { label: "Beat Sheets", glyph: "🎵" },
  { label: "Animations", glyph: "✨" },
  { label: "Sound", glyph: "🔊" },
  { label: "Exports", glyph: "⬇" },
];

const SECONDARY: NavItem[] = [
  { label: "Templates", glyph: "▢" },
  { label: "Community", glyph: "◔" },
];

const TERTIARY: NavItem[] = [
  { label: "Settings", glyph: "⚙", href: "/dashboard/billing" },
  { label: "Profile", glyph: "◐", href: "/dashboard/account" },
];

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const className = active
    ? "flex items-center gap-2.5 rounded-[10px] bg-white/55 px-2.5 py-2.5 font-ui text-[13.5px] font-medium text-[#16181d]"
    : "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 font-ui text-[13.5px] font-medium text-[#16181d]/60 transition-colors hover:bg-white/30 hover:text-[#16181d]";

  if (!item.href) {
    return (
      <div className={`${className} cursor-default opacity-60 hover:bg-transparent hover:text-[#16181d]/60`}>
        <span aria-hidden>{item.glyph}</span>
        {item.label}
      </div>
    );
  }

  return (
    <Link href={item.href} className={className}>
      <span aria-hidden>{item.glyph}</span>
      {item.label}
    </Link>
  );
}

export function DashboardSidebar({
  displayName,
  email,
  creditsBalance,
}: {
  displayName: string;
  email: string;
  creditsBalance: number;
}) {
  const pathname = usePathname();
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="glass sticky top-5 ml-5 flex h-[calc(100vh-40px)] w-60 shrink-0 flex-col self-start rounded-[22px] p-4">
      <Link href="/dashboard" className="block px-2.5 pt-1 pb-5 font-ui text-base font-semibold tracking-tight text-[#16181d]">
        Script <span className="text-[#c94fd6]">to</span> Video
      </Link>

      <nav className="flex flex-col gap-0.5">
        {PRIMARY.map((item) => (
          <NavRow key={item.label} item={item} active={item.href ? pathname === item.href : false} />
        ))}
      </nav>
      <div className="my-3.5 h-px bg-[#16181d]/8" />
      <nav className="flex flex-col gap-0.5">
        {SECONDARY.map((item) => (
          <NavRow key={item.label} item={item} active={false} />
        ))}
      </nav>
      <div className="my-3.5 h-px bg-[#16181d]/8" />
      <nav className="flex flex-col gap-0.5">
        {TERTIARY.map((item) => (
          <NavRow key={item.label} item={item} active={pathname.startsWith(item.href!)} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-[10px] p-2.5">
        <div className="oceanic-accent-gradient flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full font-ui text-[13px] font-semibold text-white">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-ui text-[12.5px] font-semibold text-[#16181d]">{displayName}</p>
          <p className="truncate text-[11px] text-[#16181d]/45">
            {email} · {creditsBalance} credits
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="shrink-0 rounded-md px-1.5 py-1 text-[11px] text-[#16181d]/40 hover:text-[#16181d]"
          >
            ⏻
          </button>
        </form>
      </div>
    </aside>
  );
}
