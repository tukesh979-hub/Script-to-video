import { createClient } from "@/lib/supabase/server";
import { requireUser, getProfile } from "@/lib/dal";
import { rowToProject, rowToProjectStage } from "@/lib/db-rows";
import { OceanicNav } from "@/components/oceanic/OceanicNav";
import { OceanicTypeBar } from "@/components/oceanic/OceanicTypeBar";
import { LatestProjectBento } from "@/components/oceanic/LatestProjectBento";
import { FoldersGrid } from "@/components/oceanic/FoldersGrid";

// Same reasoning as the signed-out landing page: the schema tracks only a
// running balance, not a per-cycle plan ceiling, so this stays a display
// constant matching the validated mockup.
const CREDITS_PLAN_LIMIT = 450;
const PROJECT_LIST_LIMIT = 30;

/**
 * Oceanic Design's "Signed-In Home" (`#signedin-home`) -- the hero shell
 * (nav/headline/type-bar) plus the Latest Project bento + Folders grid,
 * replacing the video reel entirely. This is the page a signed-in user
 * lands on at /dashboard; see the final report for why it's *not* wrapped
 * by the sidebar shell used by Projects/Billing/Account/Notifications.
 */
export default async function DashboardHomePage() {
  const user = await requireUser();
  const [profile, supabase] = await Promise.all([getProfile(), createClient()]);

  const { data } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(PROJECT_LIST_LIMIT);
  const projects = (data ?? []).map(rowToProject);
  const latest = projects[0] ?? null;
  const folders = projects.slice(1, 7);

  const [{ data: latestStageRows }, { count: assetCount }, { data: latestRenderRows }] = latest
    ? await Promise.all([
        supabase.from("project_stages").select("*").eq("project_id", latest.id).order("stage_order", { ascending: true }),
        supabase.from("project_assets").select("*", { count: "exact", head: true }).eq("project_id", latest.id),
        supabase.from("renders").select("status").eq("project_id", latest.id).order("created_at", { ascending: false }).limit(1),
      ])
    : [{ data: null }, { count: 0 }, { data: null }];
  const latestStages = (latestStageRows ?? []).map(rowToProjectStage);
  const latestRender = latestRenderRows?.[0] ?? null;

  const initials = (profile?.displayName ?? user.email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="oceanic-wash w-full">
      <div className="px-6 pt-7 pb-10 sm:px-10">
        <OceanicNav
          variant="signed-in"
          creditsBalance={profile?.creditsBalance ?? 0}
          creditsLimit={CREDITS_PLAN_LIMIT}
          initials={initials}
        />
        <div className="flex flex-col items-center pt-14 text-center sm:pt-14">
          <h1 className="font-heading text-[32px] font-semibold tracking-tight text-[#16181d]">
            What do we <span className="oceanic-accent-text">create</span> today?
          </h1>
          <p className="mt-2 text-[13.5px] text-[#16181d]/50">Turn an idea into a complete production</p>
          <OceanicTypeBar variant="signed-in" creditsBalance={profile?.creditsBalance ?? 0} creditsLimit={CREDITS_PLAN_LIMIT} />
        </div>
      </div>

      <div className="mx-auto max-w-275 px-6 pb-16 sm:px-10">
        {latest ? (
          <>
            <p className="mb-3.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Latest Project</p>
            <LatestProjectBento project={latest} stages={latestStages} assetCount={assetCount ?? 0} latestRender={latestRender} />
            <div className="mt-10">
              <FoldersGrid projects={folders} />
            </div>
          </>
        ) : (
          <div className="glass rounded-[18px] py-24 text-center">
            <p className="text-sm text-[#16181d]/60">No projects yet — describe an idea above to start your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
