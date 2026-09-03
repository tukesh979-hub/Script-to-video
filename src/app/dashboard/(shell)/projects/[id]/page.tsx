import Image from "next/image";
import Link from "next/link";
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

  return (
    <div className="mx-auto w-full max-w-4xl flex-1">
      <Link href="/dashboard/projects" className="font-ui text-sm text-[#16181d]/60 transition-colors hover:text-[#7c6ff0]">
        ← Projects
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <div className="glass relative aspect-9/16 w-full max-w-70 shrink-0 overflow-hidden rounded-2xl">
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
            <div className="glass flex flex-col gap-2 rounded-2xl p-5 sm:max-w-sm">
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
            <dl className="glass grid grid-cols-2 gap-4 rounded-2xl p-5 text-base sm:max-w-sm">
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
            <p className="rounded-xl bg-[#a4650f]/10 px-3 py-2 text-sm text-[#a4650f]">{project.reviewNote}</p>
          )}
        </div>
      </div>

      {/* Full pipeline timeline -- dotted road ahead, solid gradient fill for
          what's actually done, one dot per canonical stage. Ported from the
          reference site's .pointer-track; shown regardless of status so a
          finished project's page still reads as a build history, not just a
          live status widget. */}
      <PointerBar stages={stages} status={project.status} currentLabel={isLive ? project.currentStage : null} />

      {/* Pipeline history — real production order, one collapsible section per
          stage that actually happened (01-pipeline-transparency-prompt.md §3).
          An in-progress project only shows what's already finished; nothing
          here is presented as final while still rendering. */}
      {stages.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-semibold tracking-tight text-[#16181d]">Production Pipeline</h2>
          <div className="flex flex-col gap-3">
            {stages.map((stage) => (
              <StageSection key={stage.id} stage={stage} />
            ))}
          </div>
        </section>
      )}

      {assets.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-semibold tracking-tight text-[#16181d]">Asset Sheet</h2>
          <AssetSheet assets={assets} />
        </section>
      )}

      {stages.length === 0 && (
        <div className="glass mt-12 rounded-2xl p-5 text-base text-[#16181d]/60">
          No pipeline history recorded for this project yet.
        </div>
      )}
    </div>
  );
}
