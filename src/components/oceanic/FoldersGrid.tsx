import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/ui/reveal";
import type { Project } from "@/db/schema";

function badge(status: Project["status"]): { label: string; className: string; icon?: boolean } {
  if (status === "completed") return { label: "Shipped", className: "bg-white/85 text-[#16181d]", icon: true };
  if (status === "cancelled") return { label: "Cancelled", className: "bg-white/60 text-[#16181d]/50" };
  return { label: "In progress", className: "oceanic-accent-gradient text-white" };
}

function meta(project: Project): string {
  if (project.status === "completed" && project.stageCount != null && project.frameCount != null) {
    return `${project.stageCount} stages · ${project.frameCount} frames`;
  }
  if (project.status === "in_progress") return `${project.progressPercent ?? 0}% complete`;
  if (project.status === "needs_review") return project.reviewNote ?? "Review requested";
  return project.description ?? "";
}

/** "Folders" grid below the Latest Project bento -- other projects, per
 * DESIGN-SYSTEM.md's Signed-In Home spec. */
export function FoldersGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <div>
      <p className="mb-3.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Folders</p>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const b = badge(project.status);
          return (
            <Reveal key={project.id} delay={i * 60}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="group glass block overflow-hidden rounded-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1"
              >
                <div className="relative h-32.5 bg-gradient-to-br from-[#1a1220] to-[#2a1a30]">
                  {project.thumbnailUrl && (
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.name}
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                    />
                  )}
                  <span
                    className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.25 py-1 font-ui text-[10px] font-bold ${b.className}`}
                  >
                    {b.icon && <CheckCircle weight="fill" size={11} aria-hidden />}
                    {b.label}
                  </span>
                </div>
                <div className="p-3.5 px-4">
                  <p className="truncate font-ui text-[13.5px] font-semibold text-[#16181d]">{project.name}</p>
                  <p className="mt-1 truncate text-[11.5px] text-[#16181d]/45">{meta(project)}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
