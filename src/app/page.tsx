import { desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { ProjectCard } from "@/components/ProjectCard";

export default async function DashboardPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.createdAt));

  const readyCount = allProjects.filter((p) => p.status === "ready").length;
  const inProgressCount = allProjects.filter((p) => p.status === "building" || p.status === "rendering").length;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Video Dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            {allProjects.length} project{allProjects.length === 1 ? "" : "s"}
            {readyCount > 0 && <> &middot; {readyCount} ready</>}
            {inProgressCount > 0 && <> &middot; {inProgressCount} in progress</>}
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Coming soon — script-to-video pipeline is a separate in-progress piece"
          className="inline-flex items-center gap-2 self-start rounded-full bg-accent-2 px-5 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed sm:self-auto"
        >
          + New Video
        </button>
      </header>

      {allProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <p className="text-sm text-muted">No projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
