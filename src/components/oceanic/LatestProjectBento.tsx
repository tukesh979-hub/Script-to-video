import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight } from "@phosphor-icons/react/ssr";
import { GlassPanel } from "@/components/ui/glass-panel";
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
    <GlassPanel innerClassName="p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <div className="sm:col-span-1 sm:pr-6">
          <div className="relative mb-3.5 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1220] to-[#2a1a30]">
            {project.thumbnailUrl ? (
              <Image src={project.thumbnailUrl} alt={project.name} fill sizes="320px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                <Play weight="fill" size={28} aria-hidden />
              </div>
            )}
          </div>
          <p className="font-ui text-[15px] font-semibold text-[#16181d]">{project.name}</p>
          <p className="mt-1 text-xs text-[#16181d]/45">{nowLabel}</p>
          <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-[#16181d]/10">
            <div className="oceanic-accent-gradient h-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="group mt-4 inline-flex items-center gap-2 rounded-full bg-[#14171c] py-2 pr-2 pl-4 font-ui text-[12.5px] font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-[0.98]"
          >
            Watch progress
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight weight="bold" size={12} aria-hidden />
            </span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 border-t border-[#16181d]/8 sm:col-span-2 sm:mt-0 sm:grid-cols-2 sm:border-t-0 sm:border-l sm:border-[#16181d]/8 sm:pl-6">
          {cells.map((cell, i) => (
            <div
              key={cell.tag}
              className={`flex flex-col justify-center gap-0.5 px-4 py-4 sm:px-5 ${i > 0 ? "border-t border-[#16181d]/8" : ""} ${
                i === 1 ? "sm:border-t-0 sm:border-l sm:border-[#16181d]/8" : i === 3 ? "sm:border-l sm:border-[#16181d]/8" : ""
              }`}
            >
              <p className="font-ui text-[10.5px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">{cell.tag}</p>
              <p className="truncate font-ui text-[13px] font-semibold text-[#16181d]">{cell.val}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
