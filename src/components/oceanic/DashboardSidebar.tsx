"use client";

import { useState } from "react";
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

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
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
    <Link href={item.href} className={className} onClick={onNavigate}>
      <span aria-hidden>{item.glyph}</span>
      {item.label}
    </Link>
  );
}

function SidebarContent({
  displayName,
  email,
  creditsBalance,
  pathname,
  onNavigate,
}: {
  displayName: string;
  email: string;
  creditsBalance: number;
  pathname: string;
  onNavigate?: () => void;
}) {
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="block px-2.5 pt-1 pb-5 font-ui text-base font-semibold tracking-tight text-[#16181d]"
      >
        Script <span className="text-[#c94fd6]">to</span> Video
      </Link>

      <nav className="flex flex-col gap-0.5">
        {PRIMARY.map((item) => (
          <NavRow key={item.label} item={item} active={item.href ? pathname === item.href : false} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="my-3.5 h-px bg-[#16181d]/8" />
      <nav className="flex flex-col gap-0.5">
        {SECONDARY.map((item) => (
          <NavRow key={item.label} item={item} active={false} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="my-3.5 h-px bg-[#16181d]/8" />
      <nav className="flex flex-col gap-0.5">
        {TERTIARY.map((item) => (
          <NavRow key={item.label} item={item} active={pathname.startsWith(item.href!)} onNavigate={onNavigate} />
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
    </>
  );
}

/**
 * Fixed-width (w-60) sidebar with no responsive collapse used to just sit
 * there on mobile eating most of a 400px viewport (240px sidebar + the
 * shell's own px-10 content padding left ~60px for actual content -- see
 * the QA pass that caught this). Below `lg` it's now a slide-in drawer
 * behind a compact top bar instead, same nav content either way.
 */
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile/tablet top bar */}
      <div className="glass sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="font-ui text-base font-semibold tracking-tight text-[#16181d]">
          Script <span className="text-[#c94fd6]">to</span> Video
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#16181d]/70 hover:bg-white/40"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#0a0d16]/30 backdrop-blur-sm"
          />
          <aside className="glass-strong absolute top-3 bottom-3 left-3 flex w-64 max-w-[80vw] flex-col rounded-[22px] p-4">
            <SidebarContent
              displayName={displayName}
              email={email}
              creditsBalance={creditsBalance}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="glass sticky top-5 ml-5 hidden h-[calc(100vh-40px)] w-60 shrink-0 flex-col self-start rounded-[22px] p-4 lg:flex">
        <SidebarContent displayName={displayName} email={email} creditsBalance={creditsBalance} pathname={pathname} />
      </aside>
    </>
  );
}
