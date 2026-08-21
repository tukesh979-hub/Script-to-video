import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getProfile } from "@/lib/dal";
import { rowToProject, rowToProjectStage } from "@/lib/db-rows";
import { ProjectSpotlight } from "@/components/ProjectSpotlight";
import { ProjectGrid } from "@/components/ProjectGrid";
import { GLYPH } from "@/lib/icons";
import { STYLE_PILLS } from "@/lib/style-pills";

// Capped, not paginated -- ProjectGrid filters client-side over whatever this
// query returns, so this is the practical ceiling on "All projects" until
// that section gets real pagination.
const PROJECT_LIST_LIMIT = 30;

export default async function OverviewPage() {
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

  const { data: latestStageRows } = latest
    ? await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", latest.id)
        .order("stage_order", { ascending: true })
    : { data: null };
  const latestStages = (latestStageRows ?? []).map(rowToProjectStage);

  const name = profile?.displayName ?? user.email?.split("@")[0] ?? "there";

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Welcome back, {name}</h1>
          <p className="mt-2 text-base text-foreground/70">
            {profile?.creditsBalance ?? 0} render credit{profile?.creditsBalance === 1 ? "" : "s"} available.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="shrink-0 border border-foreground bg-lime px-5 py-3 font-display text-xs font-bold tracking-wide text-on-accent uppercase transition-colors hover:bg-lime-dim"
        >
          + New project
        </Link>
      </header>

      {/* Prompt bar — flat hairline card, same language as the landing
          page's scriptbar. Triggering an actual pipeline run is a separate
          piece, not built yet. */}
      <div className="mb-4 border border-border bg-panel px-5 py-4 transition-[border-color] focus-within:border-lime">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-lg text-faint">
            ⌕
          </span>
          <input
            type="text"
            disabled
            placeholder="Describe the video you want to make…"
            title="Coming soon — script-to-video pipeline is a separate in-progress piece"
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-faint outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center border border-foreground bg-lime text-on-accent disabled:border-border disabled:bg-panel-2 disabled:text-faint"
          >
            {GLYPH.brief}
          </button>
        </div>
      </div>
      <div className="mb-10 flex flex-wrap gap-2">
        {STYLE_PILLS.map((pill) => (
          <span
            key={pill}
            className="border border-border bg-panel px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wide text-foreground/60 uppercase"
          >
            {pill}
          </span>
        ))}
      </div>

      {latest && (
        <div className="mb-10">
          <ProjectSpotlight project={latest} stages={latestStages} />
        </div>
      )}

      <ProjectGrid projects={projects} />
    </div>
  );
}
