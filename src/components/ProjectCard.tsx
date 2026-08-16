import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/db/schema";
import { StatusBadge } from "./StatusBadge";

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Two visual states per 02-dashboard-redesign-context.md: in-progress cards
 * are deliberately compact and show no unfinished media; completed cards are
 * rich, with a real thumbnail and quick stats. Cancelled is dimmed/minimal.
 * Needs-review surfaces its warning note directly on the card since it's
 * actionable and blocking.
 */
export function ProjectCard({ project }: { project: Project }) {
  if (project.status === "in_progress") {
    return (
      <Link
        href={`/projects/${project.id}`}
        className="group flex flex-col gap-3 rounded-2xl border border-border bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-[#3a3942] hover:shadow-[0_16px_34px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
        {project.currentStage && (
          <p className="font-display text-[11px] uppercase tracking-wide text-lime-dim">{project.currentStage}</p>
        )}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-lime transition-[width] duration-500"
            style={{ width: `${project.progressPercent ?? 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{project.progressPercent ?? 0}%</span>
          <span className="text-faint">Watch progress →</span>
        </div>
      </Link>
    );
  }

  if (project.status === "cancelled") {
    return (
      <Link
        href={`/projects/${project.id}`}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-panel/50 p-4 opacity-60 transition-opacity hover:opacity-80"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-faint">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
        {project.description && <p className="line-clamp-1 text-xs text-faint">{project.description}</p>}
      </Link>
    );
  }

  // completed + needs_review share the rich card; needs_review adds a warning note.
  const duration = formatDuration(project.durationSeconds);
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-panel transition-all hover:-translate-y-0.5 hover:border-[#3a3942] hover:shadow-[0_16px_34px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-9/16 max-h-70 w-full overflow-hidden bg-black">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No preview</div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={project.status} />
        </div>
        {duration && (
          <span className="absolute right-3 bottom-3 rounded-md bg-black/65 px-2 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
        {project.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{project.description}</p>
        )}
        {project.status === "needs_review" && project.reviewNote && (
          <p className="rounded-lg border border-red/30 bg-red/10 px-2.5 py-1.5 text-[11px] leading-snug text-red">
            {project.reviewNote}
          </p>
        )}
        {(project.stageCount || project.frameCount || project.voTakes !== null) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-faint">
            {project.stageCount != null && <span>{project.stageCount} stages</span>}
            {project.frameCount != null && <span>{project.frameCount} frames</span>}
            {project.voTakes != null && <span>{project.voTakes} VO takes</span>}
          </div>
        )}
        <p className="mt-auto flex items-center justify-between pt-2 text-[11px] text-faint">
          <span className="uppercase tracking-wide">Updated {formatDate(project.updatedAt ?? project.createdAt)}</span>
          <span className="text-lime-dim opacity-0 transition-opacity group-hover:opacity-100">View build →</span>
        </p>
      </div>
    </Link>
  );
}
