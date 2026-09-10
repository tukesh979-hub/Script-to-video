import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Reveal } from "@/components/ui/reveal";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { rowToProject, rowToProjectStage, rowToProjectAsset } from "@/lib/db-rows";
import { StatusBadge } from "@/components/StatusBadge";
import { StageSection } from "@/components/StageSection";
import { AssetSheet } from "@/components/AssetSheet";
import { PointerBar } from "@/components/PointerBar";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const supabase = await createClient();

  // No manual ownership check here beyond what RLS already does: if this id
  // belongs to another user, projects_select_own filters the row out of the
  // result set entirely -- this returns the exact same "not found" a client
  // gets for an id that doesn't exist at all. That's deliberate: a 404
  // doesn't tell an attacker whether the project exists and isn't theirs, or
  // never existed (see README's security section, "reading another user's
  // project" attack test).
  const { data: projectRow } = await supabase.from("projects").select("*").eq("id", id).is("deleted_at", null).single();
  if (!projectRow) notFound();
  const project = rowToProject(projectRow);

  const [{ data: stageRows }, { data: assetRows }] = await Promise.all([
    supabase.from("project_stages").select("*").eq("project_id", id).order("stage_order", { ascending: true }),
    supabase.from("project_assets").select("*").eq("project_id", id),
  ]);
  const stages = (stageRows ?? []).map(rowToProjectStage);
  const assets = (assetRows ?? []).map(rowToProjectAsset);

  const isLive = project.status === "in_progress";

  // Asset Sheet sits right after the storyboard/beat-sheet stage and before
  // the individual scene-by-scene stages -- the same document order the
  // reference reel breakdown uses (storyboard -> asset sheet -> Scene 1,
  // Scene 2, ...), not tacked on at the very end after everything else.
  const splitIndex = stages.reduce(
    (found, stage, i) => (stage.stageType === "storyboard" || stage.stageType === "beat_sheet" ? i : found),
    -1,
  );
  const stagesBeforeAssets = splitIndex >= 0 ? stages.slice(0, splitIndex + 1) : stages;
  const stagesAfterAssets = splitIndex >= 0 ? stages.slice(splitIndex + 1) : [];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 font-ui text-sm text-[#16181d]/60 transition-colors hover:text-[#7c6ff0]"
      >
        <ArrowLeft weight="bold" size={13} aria-hidden />
        Projects
      </Link>

      {/* One glass surface for the whole project header -- thumbnail, title,
          status, and stats/progress all inside it, separated only by a
          hairline divider, not stacked as separate floating panels. */}
      <Reveal>
        <GlassPanel className="mt-6" innerClassName="flex flex-col gap-8 p-4 sm:p-5 sm:flex-row">
          <div className="relative aspect-9/16 w-full max-w-70 shrink-0 overflow-hidden rounded-xl">
            {project.thumbnailUrl ? (
              <Image src={project.thumbnailUrl} alt={project.name} fill sizes="280px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#16181d]/40">No preview</div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <StatusBadge status={project.status} />
              <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-[#16181d]">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-base leading-relaxed text-[#16181d]/60">{project.description}</p>
              )}
            </div>

            {isLive ? (
              <div className="flex max-w-sm flex-col gap-2 border-t border-[#16181d]/10 pt-4">
                <p className="font-ui text-xs font-bold tracking-[0.06em] text-[#7c6ff0] uppercase">
                  {project.currentStage ?? "Working"}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#16181d]/10">
                  <div
                    className="oceanic-accent-gradient h-full transition-[width] duration-500"
                    style={{ width: `${project.progressPercent ?? 0}%` }}
                  />
                </div>
                <p className="text-sm text-[#16181d]/60">{project.progressPercent ?? 0}% complete</p>
              </div>
            ) : (
              <dl className="grid max-w-sm grid-cols-2 gap-4 border-t border-[#16181d]/10 pt-4 text-base">
                <div>
                  <dt className="font-ui text-xs font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Created</dt>
                  <dd className="mt-1 text-[#16181d]">{project.createdAt.toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="font-ui text-xs font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Duration</dt>
                  <dd className="mt-1 text-[#16181d]">{project.durationSeconds ? `${project.durationSeconds}s` : "—"}</dd>
                </div>
              </dl>
            )}

            {project.status === "needs_review" && project.reviewNote && (
              <p className="border-l-2 border-[#a4650f]/50 pl-3 text-sm text-[#a4650f]">{project.reviewNote}</p>
            )}
          </div>
        </GlassPanel>
      </Reveal>

      {/* One glass surface for the complete project build: pipeline progress,
          every stage in production order, and the Asset Sheet interleaved
          right after the storyboard/beat-sheet stage -- all one continuous
          surface, segments separated only by hairline dividers, not by
          separate boxes. Every stage is expanded by default (the native
          <details> disclosure still lets you collapse one if you want, it
          just doesn't start that way). An in-progress project only shows
          what's already finished; nothing here is presented as final while
          still rendering. */}
      {stages.length > 0 ? (
        <Reveal delay={100}>
          <GlassPanel className="mt-8" innerClassName="p-4 sm:p-5">
            <h2 className="mb-4 font-heading text-xl font-semibold tracking-tight text-[#16181d]">Production Pipeline</h2>
            <PointerBar stages={stages} status={project.status} currentLabel={isLive ? project.currentStage : null} />
            <div className="flex flex-col">
              {stagesBeforeAssets.map((stage, i) => (
                <StageSection key={stage.id} stage={stage} index={i} />
              ))}
            </div>

            {assets.length > 0 && (
              <div className="border-b border-[#16181d]/8 py-5">
                <p className="mb-4 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Asset Sheet</p>
                <AssetSheet assets={assets} bare />
              </div>
            )}

            <div className="flex flex-col">
              {stagesAfterAssets.map((stage, i) => (
                <StageSection key={stage.id} stage={stage} index={stagesBeforeAssets.length + i} />
              ))}
            </div>
          </GlassPanel>
        </Reveal>
      ) : (
        <GlassPanel className="mt-8" innerClassName="p-4 sm:p-5 text-base text-[#16181d]/60">
          No pipeline history recorded for this project yet.
        </GlassPanel>
      )}
    </div>
  );
}
