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

export function ProjectCard({ project }: { project: Project }) {
  const duration = formatDuration(project.durationSeconds);
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-panel transition-colors hover:border-accent/50"
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
          <span className="absolute bottom-3 right-3 rounded-md bg-black/65 px-2 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
        {project.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{project.description}</p>
        )}
        <p className="mt-auto pt-2 text-[11px] uppercase tracking-wide text-muted/70">
          Updated {formatDate(project.updatedAt ?? project.createdAt)}
        </p>
      </div>
    </Link>
  );
}
