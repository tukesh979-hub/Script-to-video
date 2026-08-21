import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { rowToProject } from "@/lib/db-rows";
import type { Project, ProjectStatus } from "@/db/schema";
import { ProjectCard } from "@/components/ProjectCard";
import { GLYPH } from "@/lib/icons";

const GROUPS: { status: ProjectStatus; label: string; glyph: string }[] = [
  { status: "in_progress", label: "In Progress", glyph: GLYPH.inProgress },
  { status: "needs_review", label: "Needs Review", glyph: "!" },
  { status: "completed", label: "Completed", glyph: GLYPH.done },
  { status: "cancelled", label: "Cancelled", glyph: GLYPH.cancelled },
];

export default async function ProjectsPage() {
  await requireUser();
  const supabase = await createClient();

  // No .eq("user_id", ...) needed -- RLS already scopes this to the caller;
  // see drizzle/0001_rls_and_auth_fk.sql's projects_select_own policy.
  const { data } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const allProjects: Project[] = (data ?? []).map(rowToProject);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: allProjects.filter((p) => p.status === g.status),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Projects</h1>
          <p className="mt-2 text-base text-foreground/70">
            {allProjects.length} project{allProjects.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="shrink-0 border border-foreground bg-lime px-5 py-3 font-display text-xs font-bold tracking-wide text-on-accent uppercase transition-colors hover:bg-lime-dim"
        >
          + New project
        </Link>
      </header>

      {allProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border bg-panel py-24 text-center">
          <p className="text-base text-foreground/70">No projects yet.</p>
          <Link href="/dashboard/projects/new" className="mt-3 text-base text-lime-dim hover:underline">
            Create your first one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {grouped.map((g) => (
            <section key={g.status}>
              <h2 className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-foreground/70">
                <span aria-hidden className="text-lime-dim">
                  {g.glyph}
                </span>
                {g.label}
                <span className="text-faint">({g.items.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
