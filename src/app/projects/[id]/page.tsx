import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projectAssets, projectStages, projects } from "@/db/schema";
import { StatusBadge } from "@/components/StatusBadge";
import { StageSection } from "@/components/StageSection";
import { AssetSheet } from "@/components/AssetSheet";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  const stages = await db
    .select()
    .from(projectStages)
    .where(eq(projectStages.projectId, id))
    .orderBy(asc(projectStages.stageOrder));

  const assets = await db.select().from(projectAssets).where(eq(projectAssets.projectId, id));

  const isLive = project.status === "in_progress";

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-lime-dim">
        ← Dashboard
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <div className="relative aspect-9/16 w-full max-w-70 shrink-0 overflow-hidden rounded-2xl border border-border bg-black">
          {project.thumbnailUrl ? (
            <Image src={project.thumbnailUrl} alt={project.name} fill sizes="280px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No preview</div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <StatusBadge status={project.status} />
            <h1 className="mt-3 font-display text-2xl tracking-tight">{project.name}</h1>
            {project.description && <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>}
          </div>

          {isLive ? (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4 sm:max-w-sm">
              <p className="font-display text-[10px] uppercase tracking-wide text-lime-dim">
                {project.currentStage ?? "Working"}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-lime transition-[width] duration-500"
                  style={{ width: `${project.progressPercent ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-muted">{project.progressPercent ?? 0}% complete</p>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-panel p-4 text-sm sm:max-w-sm">
              <div>
                <dt className="font-display text-[10px] uppercase tracking-wide text-faint">Created</dt>
                <dd className="mt-1">{new Date(project.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-display text-[10px] uppercase tracking-wide text-faint">Duration</dt>
                <dd className="mt-1">{project.durationSeconds ? `${project.durationSeconds}s` : "—"}</dd>
              </div>
            </dl>
          )}

          {project.status === "needs_review" && project.reviewNote && (
            <p className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
              {project.reviewNote}
            </p>
          )}
        </div>
      </div>

      {/* Pipeline history — real production order, one collapsible section per
          stage that actually happened (01-pipeline-transparency-prompt.md §3).
          An in-progress project only shows what's already finished; nothing
          here is presented as final while still rendering. */}
      {stages.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg tracking-tight">Production Pipeline</h2>
          <div className="flex flex-col gap-3">
            {stages.map((stage) => (
              <StageSection key={stage.id} stage={stage} />
            ))}
          </div>
        </section>
      )}

      {assets.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg tracking-tight">Asset Sheet</h2>
          <AssetSheet assets={assets} />
        </section>
      )}

      {stages.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          No pipeline history recorded for this project yet.
        </div>
      )}
    </div>
  );
}
