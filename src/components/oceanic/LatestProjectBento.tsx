import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectStage } from "@/db/schema";

type RenderSummary = { status: string } | null;

const SCRIPT_STAGE_TYPES = new Set(["raw_footage", "captions"]);
const STORYBOARD_STAGE_TYPES = new Set(["storyboard", "beat_sheet"]);

function findStageSummary(stages: ProjectStage[], types: Set<string>): string | null {
  const stage = stages.find((s) => types.has(s.stageType));
  return stage?.summary ?? null;
}

function finalOutputLabel(render: RenderSummary): string {
  if (!render) return "Pending render";
  if (render.status === "ready") return "Ready to watch";
  if (render.status === "failed") return "Render failed";
  return "Rendering…";
}

/**
 * "Latest Project" bento -- large preview + Script/Storyboard/Assets/Final
 * Output mini-cards, progress bar, "Watch progress" CTA, per
 * DESIGN-SYSTEM.md's Signed-In Home spec. Backed entirely by the existing
 * projects/project_stages/project_assets/renders schema -- the four mini-
 * cells map onto real data (a stage's own summary, a real asset count, the
 * latest render's real status) rather than fabricated stats, following the
 * same "don't invent content the schema doesn't produce" principle the
 * pre-Oceanic ProjectSpotlight used.
 */
export function LatestProjectBento({
  project,
  stages,
  assetCount,
  latestRender,
}: {
  project: Project;
  stages: ProjectStage[];
  assetCount: number;
  latestRender: RenderSummary;
}) {
  const finished = project.status === "completed";
  const cancelled = project.status === "cancelled";
  const pct = finished ? 100 : (project.progressPercent ?? 0);
  const nowLabel = finished
    ? "Shipped — every stage complete"
    : cancelled
      ? "Stopped — rendering was cancelled"
      : `Working on ${project.currentStage ?? "next stage"} · ${pct}%`;

  const cells = [
    { tag: "Script", val: findStageSummary(stages, SCRIPT_STAGE_TYPES) ?? "Not started" },
    { tag: "Storyboard", val: findStageSummary(stages, STORYBOARD_STAGE_TYPES) ?? "Not started" },
    { tag: "Assets", val: assetCount > 0 ? `${assetCount} collected` : "None yet" },
    { tag: "Final Output", val: finalOutputLabel(latestRender) },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:grid-rows-2">
      <div className="glass row-span-2 rounded-[18px] p-5 sm:col-span-1">
        <div className="relative mb-3.5 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1220] to-[#2a1a30]">
          {project.thumbnailUrl ? (
            <Image src={project.thumbnailUrl} alt={project.name} fill sizes="320px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-white/60">▶</div>
          )}
        </div>
        <p className="font-ui text-[15px] font-semibold text-[#16181d]">{project.name}</p>
        <p className="mt-1 text-xs text-[#16181d]/45">{nowLabel}</p>
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-[#16181d]/10">
          <div className="oceanic-accent-gradient h-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="mt-4 inline-block rounded-full bg-[#14171c] px-4 py-2 font-ui text-[12.5px] font-semibold text-white"
        >
          Watch progress →
        </Link>
      </div>

      {cells.map((cell) => (
        <div key={cell.tag} className="glass flex min-h-21 flex-col justify-end rounded-[14px] p-3.5">
          <p className="font-ui text-[10.5px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">{cell.tag}</p>
          <p className="mt-0.5 truncate font-ui text-[13px] font-semibold text-[#16181d]">{cell.val}</p>
        </div>
      ))}
    </div>
  );
}
