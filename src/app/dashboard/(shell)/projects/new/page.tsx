import { requireUser } from "@/lib/dal";
import { NewProjectForm } from "./NewProjectForm";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  await requireUser();
  const { idea } = await searchParams;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#16181d] sm:text-4xl">New project</h1>
        <p className="mt-2 max-w-lg text-base text-[#16181d]/60">
          This creates the project record. The actual script-to-video pipeline run is a separate piece, not wired up
          yet.
        </p>
      </header>
      <div className="glass max-w-md rounded-2xl p-6">
        <NewProjectForm initialDescription={idea} />
      </div>
    </div>
  );
}
