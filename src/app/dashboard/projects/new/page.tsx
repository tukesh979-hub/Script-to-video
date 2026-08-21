import { requireUser } from "@/lib/dal";
import { NewProjectForm } from "./NewProjectForm";

export default async function NewProjectPage() {
  await requireUser();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">New project</h1>
        <p className="mt-2 max-w-lg text-base text-foreground/70">
          This creates the project record. The actual script-to-video pipeline run is a separate piece, not wired up
          yet.
        </p>
      </header>
      <div className="max-w-md border border-border bg-panel p-6">
        <NewProjectForm />
      </div>
    </div>
  );
}
