"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/db/schema";
import { ProjectCard } from "./ProjectCard";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "In progress" },
  { key: "done", label: "Completed" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(project: Project, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "done") return project.status === "completed";
  // "active": everything still moving through the pipeline, same as the
  // reference site's filter -- excludes both finished and cancelled runs.
  return project.status !== "completed" && project.status !== "cancelled";
}

/** Filterable "All projects" grid -- reference site's .rungrid + .filterbar.
 * Filtering is client-side over a list the server already fetched, so no
 * page reads through you'll notice a delay: the project count here is
 * capped by the caller's query limit, not paginated in this component. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = projects.filter((p) => matchesFilter(p, filter));

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm tracking-wide text-foreground/70 uppercase">All projects</h2>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`border px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wide uppercase transition-colors ${
                filter === f.key
                  ? "border-lime bg-lime-soft text-lime-dim"
                  : "border-border bg-panel text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border bg-panel py-24 text-center">
          <p className="text-base text-foreground/70">
            {projects.length === 0 ? "No projects yet." : "Nothing here for this filter."}
          </p>
          {projects.length === 0 && (
            <Link href="/dashboard/projects/new" className="mt-3 text-base text-lime-dim hover:underline">
              Create your first one
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
