import { requireUser } from "@/lib/dal";

/**
 * Thin auth guard only -- no visual chrome. Every /dashboard/* route needs
 * the same re-verified-against-Supabase auth check (proxy.ts's own check is
 * optimistic/cookie-only), but the two page families under this route need
 * two different shells: the Signed-In Home (dashboard/page.tsx) is a
 * hero-shell page with no sidebar, while Projects/Billing/Account/
 * Notifications (dashboard/(shell)/*) share the Oceanic glass sidebar via
 * their own dashboard/(shell)/layout.tsx. See DESIGN-SYSTEM.md's page
 * inventory (§2) -- "Signed-In Home" and the sidebar-shell pages are
 * structurally different layout families, so one shared layout can't serve
 * both without either stretching to fit both or applying the wrong chrome
 * to one of them.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
