"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/db/schema";
import { OceanicStatusBadge } from "./OceanicStatusBadge";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "In progress" },
  { key: "done", label: "Completed" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(project: Project, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "done") return project.status === "completed";
  return project.status !== "completed" && project.status !== "cancelled";
}

function cardMeta(project: Project): string {
  if (project.status === "in_progress") {
    return `Working on ${project.currentStage ?? "next stage"} · ${project.progressPercent ?? 0}%`;
  }
  if (project.status === "needs_review") return project.reviewNote ?? "Review requested";
  if (project.stageCount != null && project.frameCount != null) {
    return `${project.stageCount} stages · ${project.frameCount} frames`;
  }
  return project.description ?? "";
}

function cardProgress(project: Project): number {
  if (project.status === "completed") return 100;
  return project.progressPercent ?? 0;
}

/** Filter pills + 3-column card grid, per DESIGN-SYSTEM.md's Projects screen
 * (`#projects`). Filtering is client-side over the server-fetched list,
 * mirroring the pre-Oceanic ProjectGrid's own semantics for "In progress"
 * (everything still moving -- not completed, not cancelled). */
export function OceanicProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = projects.filter((p) => matchesFilter(p, filter));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 font-ui text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-[#14171c] text-white"
                  : "border border-white/50 bg-white/40 text-[#16181d]/60 hover:text-[#16181d]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          href="/dashboard/projects/new"
          className="oceanic-accent-gradient rounded-[10px] px-4 py-2.5 font-ui text-[13px] font-semibold text-white"
        >
          + New Project
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-[18px] py-24 text-center">
          <p className="font-oceanic-body text-sm text-[#16181d]/60">
            {projects.length === 0 ? "No projects yet." : "Nothing here for this filter."}
          </p>
          {projects.length === 0 && (
            <Link href="/dashboard/projects/new" className="mt-3 font-ui text-sm font-semibold text-[#7c6ff0] hover:underline">
              Create your first one
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="glass group overflow-hidden rounded-2xl">
              <div className="relative h-35 overflow-hidden bg-gradient-to-br from-[#1a1220] to-[#2a1a30]">
                {project.thumbnailUrl && (
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <OceanicStatusBadge status={project.status} />
              </div>
              <div className="p-4">
                <p className="truncate font-ui text-[13.5px] font-semibold text-[#16181d]">{project.name}</p>
                <p className="mt-1 truncate text-[11.5px] text-[#16181d]/45">{cardMeta(project)}</p>
                <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[#16181d]/8">
                  <div
                    className="oceanic-accent-gradient h-full transition-[width] duration-500"
                    style={{ width: `${cardProgress(project)}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
