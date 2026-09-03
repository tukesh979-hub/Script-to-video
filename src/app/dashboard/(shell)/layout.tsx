import { getProfile, requireUser } from "@/lib/dal";
import { DashboardSidebar } from "@/components/oceanic/DashboardSidebar";

/**
 * Oceanic glass sidebar shell for Projects / Billing / Account /
 * Notifications (and, by inheriting this same route-group layout, the
 * project workspace routes nested under Projects -- new-project and
 * project-detail -- which keep their own unmodified content/logic but now
 * share the same chrome rather than being left with none; see the final
 * report for why). Route-grouped as `(shell)` specifically so the
 * Signed-In Home at /dashboard itself is NOT wrapped by this -- it's a
 * hero-shell page, not a sidebar-shell page (DESIGN-SYSTEM.md §2).
 */
export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([requireUser(), getProfile()]);
  const displayName = profile?.displayName ?? user.email?.split("@")[0] ?? "there";

  return (
    <div className="oceanic-wash flex min-h-screen w-full items-start">
      <DashboardSidebar displayName={displayName} email={user.email ?? ""} creditsBalance={profile?.creditsBalance ?? 0} />
      <main className="min-w-0 flex-1 px-10 py-8 pb-12">{children}</main>
    </div>
  );
}
