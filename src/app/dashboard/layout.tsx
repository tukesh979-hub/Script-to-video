import Link from "next/link";
import { requireUser, getProfile } from "@/lib/dal";
import { logoutAction } from "@/app/(auth)/actions";
import { GLYPH } from "@/lib/icons";

const NAV = [
  { href: "/dashboard", label: "Overview", glyph: GLYPH.brief },
  { href: "/dashboard/projects", label: "Projects", glyph: GLYPH.storyboard },
  { href: "/dashboard/notifications", label: "Notifications", glyph: GLYPH.inProgress },
  { href: "/dashboard/billing", label: "Billing & Usage", glyph: GLYPH.assemble },
  { href: "/dashboard/account", label: "Account", glyph: GLYPH.script },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Re-verified here too (not just in proxy.ts) -- every page under this
  // layout inherits the check since Next always runs the layout tree.
  const user = await requireUser();
  const profile = await getProfile();

  return (
    <div className="flex min-h-full w-full flex-1 flex-col sm:flex-row">
      {/* Flush against the true left edge -- sticky + full viewport height,
          not floating inside a centered/padded container like the rest of
          the shell. Only a right border + shadow separate it from content;
          no rounded corners since it's an edge panel, not a card. */}
      <aside className="flex shrink-0 flex-col gap-1 border-border bg-panel p-4 sm:sticky sm:top-0 sm:h-screen sm:w-64 sm:gap-2 sm:border-r sm:p-5">
        <Link
          href="/dashboard"
          className="mb-4 block font-display text-base font-bold tracking-tight text-foreground uppercase"
        >
          Script <span className="text-faint">to</span> Video
        </Link>

        <nav className="flex flex-row gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-lime hover:bg-lime-soft hover:text-lime-dim"
            >
              <span aria-hidden className="text-base text-lime-dim">
                {item.glyph}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 hidden flex-col gap-2 border-t border-border pt-4 sm:flex">
          <p className="truncate text-sm text-foreground/80">{profile?.displayName ?? user.email}</p>
          <form action={logoutAction}>
            <button type="submit" className="text-left text-xs text-faint hover:text-red">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
