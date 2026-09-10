"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkle,
  SquaresFour,
  Image as ImageIcon,
  FilmSlate,
  MusicNotes,
  Lightning,
  SpeakerHigh,
  DownloadSimple,
  Stack,
  UsersThree,
  Gear,
  UserCircle,
  SignOut,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { logoutAction } from "@/app/(auth)/actions";

type NavItem = { label: string; icon: Icon; href?: string };

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
  { label: "Create", icon: Sparkle, href: "/dashboard" },
  { label: "Projects", icon: SquaresFour, href: "/dashboard/projects" },
  { label: "Assets", icon: ImageIcon },
  { label: "Storyboards", icon: FilmSlate },
  { label: "Beat Sheets", icon: MusicNotes },
  { label: "Animations", icon: Lightning },
  { label: "Sound", icon: SpeakerHigh },
  { label: "Exports", icon: DownloadSimple },
];

const SECONDARY: NavItem[] = [
  { label: "Templates", icon: Stack },
  { label: "Community", icon: UsersThree },
];

const TERTIARY: NavItem[] = [
  { label: "Settings", icon: Gear, href: "/dashboard/billing" },
  { label: "Profile", icon: UserCircle, href: "/dashboard/account" },
];

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const className = active
    ? "flex items-center gap-2.5 rounded-[10px] bg-white/55 px-2.5 py-2.5 font-ui text-[13.5px] font-medium text-[#16181d]"
    : "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 font-ui text-[13.5px] font-medium text-[#16181d]/60 transition-colors hover:bg-white/30 hover:text-[#16181d]";
  const Icon = item.icon;

  if (!item.href) {
    return (
      <div className={`${className} cursor-default opacity-60 hover:bg-transparent hover:text-[#16181d]/60`}>
        <Icon weight="light" size={17} aria-hidden />
        {item.label}
      </div>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      <Icon weight="light" size={17} aria-hidden />
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
            className="shrink-0 rounded-md p-1.5 text-[#16181d]/40 transition-colors hover:text-[#16181d]"
          >
            <SignOut weight="light" size={15} aria-hidden />
          </button>
        </form>
      </div>
    </>
  );
}

/** Two stacked bars that fluidly rotate/translate into a perfect X instead
 * of the icon just swapping instantly. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-3.5 w-4 flex-col justify-between">
      <span
        className={`h-[1.5px] w-full origin-center rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-y-[6.5px] rotate-45" : ""
        }`}
      />
      <span
        className={`h-[1.5px] w-full origin-center rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "-translate-y-[6.5px] -rotate-45" : ""
        }`}
      />
    </span>
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
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#16181d]/70 transition-colors hover:bg-white/40"
        >
          <MenuGlyph open={open} />
        </button>
      </div>

      {/* Backdrop + drawer stay mounted so both fade/slide out, rather than
          vanishing instantly when `open` flips false. */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#0a0d16]/30 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <GlassPanel
          as="aside"
          className={`absolute top-3 bottom-3 left-3 w-64 max-w-[80vw] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
          }`}
          innerClassName="flex h-full flex-col p-4"
        >
          <SidebarContent
            displayName={displayName}
            email={email}
            creditsBalance={creditsBalance}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </GlassPanel>
      </div>

      {/* Desktop sidebar */}
      <GlassPanel
        as="aside"
        className="sticky top-5 ml-5 hidden h-[calc(100vh-40px)] w-60 shrink-0 self-start lg:block"
        innerClassName="flex h-full flex-col p-4"
      >
        <SidebarContent displayName={displayName} email={email} creditsBalance={creditsBalance} pathname={pathname} />
      </GlassPanel>
    </>
  );
}
