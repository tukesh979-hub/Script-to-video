import Link from "next/link";
import type { Project, ProjectStage } from "@/db/schema";
import { PIPELINE_STAGE_ORDER, STAGE_TYPE_LABEL } from "@/lib/stages";
import { STAGE_GLYPH } from "@/lib/icons";

/** "Latest project" spotlight -- flat report card, not a floating glass
 * bento. Its cells are real Script/Storyboard/VoiceOver/Animate/Final
 * tiles on the reference site, which don't map onto this app's actual
 * pipeline (a real footage-based edit has no "script" or "storyboard"
 * stage at all -- see lib/stages.ts). Rather than fabricate content for
 * stage types this project never produces, each cell here is just the
 * project's own next-5 real stages (first 2 + last 3, so the wide first
 * cell is early work and the last cell is always Final Assembly when it
 * exists), labeled with their real STAGE_TYPE_LABEL and real summary. */
export function ProjectSpotlight({ project, stages }: { project: Project; stages: ProjectStage[] }) {
  const finished = project.status === "completed";
  const cancelled = project.status === "cancelled";
  const done = new Set(stages.map((s) => s.stageType));
  const pct = finished ? 100 : Math.round((done.size / PIPELINE_STAGE_ORDER.length) * 100);

  const cells = stages.length <= 5 ? stages : [...stages.slice(0, 2), ...stages.slice(-3)];

  const actionLabel = finished ? "View build →" : cancelled ? "View →" : "Watch progress →";
  const nowLabel = finished
    ? "Shipped — every stage complete"
    : cancelled
      ? "Stopped — rendering was cancelled"
      : `Working on ${project.currentStage ?? "next stage"} · ${pct}%`;

  return (
    <div className="border border-border bg-panel p-6 sm:p-7 md:grid md:grid-cols-[1.05fr_1.5fr] md:gap-7">
      <div className="flex flex-col gap-3">
        <div className="flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-lime-dim uppercase">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-lime" />
          Latest project
        </div>
        <h3 className="font-display text-xl leading-tight font-bold tracking-tight text-foreground uppercase">
          {project.name}
        </h3>
        <p className="text-xs text-faint">{project.description}</p>

        <div className="mt-1.5">
          <div
            className="relative mx-1 mb-2.5 h-0.5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, var(--line-strong) 0, var(--line-strong) 3px, transparent 3px, transparent 8px)",
            }}
          >
            <div
              className="absolute top-[-0.5px] left-0 h-[3px] bg-lime transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
            {PIPELINE_STAGE_ORDER.map((type, i) => {
              const left = (i / (PIPELINE_STAGE_ORDER.length - 1)) * 100;
              const isDone = finished || done.has(type);
              return (
                <div
                  key={type}
                  title={STAGE_TYPE_LABEL[type]}
                  className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                    isDone ? "border-lime bg-lime" : "border-border bg-background"
                  }`}
                  style={{ left: `${left}%` }}
                />
              );
            })}
            <div
              className="absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-background bg-lime font-mono text-[9px] text-on-accent transition-[left] duration-500"
              style={{ left: `${pct}%` }}
            >
              {finished ? "✓" : "●"}
            </div>
          </div>
          <div className="flex justify-between px-0.5 font-mono text-[9.5px] font-bold tracking-wide text-faint uppercase">
            <span>{STAGE_TYPE_LABEL[PIPELINE_STAGE_ORDER[0]]}</span>
            <span>{STAGE_TYPE_LABEL[PIPELINE_STAGE_ORDER[PIPELINE_STAGE_ORDER.length - 1]]}</span>
          </div>
          <p className="mt-3 text-[13px] text-foreground">{nowLabel}</p>
        </div>

        <Link
          href={`/dashboard/projects/${project.id}`}
          className="mt-1.5 w-fit border border-foreground bg-lime px-4 py-2.5 font-display text-xs font-bold tracking-wide text-on-accent uppercase transition-colors hover:bg-lime-dim"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 grid-rows-2 gap-3 md:mt-0">
        {cells.map((stage, i) => (
          <div
            key={stage.id}
            className={`relative flex min-h-[150px] flex-col overflow-hidden border border-border bg-panel-2 ${
              i === 0 ? "col-span-2" : ""
            }`}
          >
            <div className="relative flex h-[110px] shrink-0 items-center justify-center border-b border-border bg-[radial-gradient(circle_at_50%_40%,var(--accent-soft),transparent_70%)]">
              <span className="text-3xl text-lime-dim">{STAGE_GLYPH[stage.stageType] ?? "▶"}</span>
            </div>
            <div className="flex flex-1 flex-col justify-center px-3.5 py-2.5">
              <p className="font-mono text-[9.5px] font-bold tracking-wide text-foreground/55 uppercase">
                {STAGE_TYPE_LABEL[stage.stageType as keyof typeof STAGE_TYPE_LABEL] ?? stage.stageType}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-foreground/70">{stage.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
