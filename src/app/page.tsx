import { desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { projects, type Project, type ProjectStatus } from "@/db/schema";
import { ProjectCard } from "@/components/ProjectCard";
import { GLYPH } from "@/lib/icons";

const GROUPS: { status: ProjectStatus; label: string; glyph: string }[] = [
  { status: "in_progress", label: "In Progress", glyph: GLYPH.inProgress },
  { status: "needs_review", label: "Needs Review", glyph: "!" },
  { status: "completed", label: "Completed", glyph: GLYPH.done },
  { status: "cancelled", label: "Cancelled", glyph: GLYPH.cancelled },
];

const STYLE_PILLS = ["Documentary", "Motion Design", "Talking Head", "Product Reel", "Testimonial"];

export default async function DashboardPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.createdAt));

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: allProjects.filter((p) => p.status === g.status) as Project[],
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">Video Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          {allProjects.length} project{allProjects.length === 1 ? "" : "s"} — the full pipeline history for every
          build.
        </p>
      </header>

      {/* Prompt bar — visual language matches the reference site's "new run" input;
          triggering an actual pipeline run is a separate piece, not built yet. */}
      <div className="mb-4 rounded-full border border-border bg-panel-2 px-4 py-3 opacity-60">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-muted">
            ⌕
          </span>
          <input
            type="text"
            disabled
            placeholder="Describe the video you want to make…"
            title="Coming soon — script-to-video pipeline is a separate in-progress piece"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-faint outline-none disabled:cursor-not-allowed"
          />
          <span aria-hidden className="text-muted">
            ⇲
          </span>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-lime/40 text-background"
          >
            {GLYPH.brief}
          </button>
        </div>
      </div>
      <div className="mb-10 flex flex-wrap gap-2">
        {STYLE_PILLS.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-faint opacity-60"
          >
            {pill}
          </span>
        ))}
      </div>

      {allProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <p className="text-sm text-muted">No projects yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {grouped.map((g) => (
            <section key={g.status}>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xs uppercase tracking-wide text-muted">
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
