import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { StatusBadge } from "@/components/StatusBadge";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-accent">
        ← Dashboard
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <div className="relative aspect-9/16 w-full max-w-70 shrink-0 overflow-hidden rounded-2xl border border-border bg-black">
          {project.thumbnailUrl ? (
            <Image src={project.thumbnailUrl} alt={project.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No preview</div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <StatusBadge status={project.status} />
            <h1 className="mt-3 text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description && <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>}
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-panel p-4 text-sm sm:max-w-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Created</dt>
              <dd className="mt-1">{new Date(project.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Duration</dt>
              <dd className="mt-1">{project.durationSeconds ? `${project.durationSeconds}s` : "—"}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
            Video playback / re-render controls land here once the script-to-video pipeline is wired up —
            that&apos;s a separate piece, built next.
          </div>
        </div>
      </div>
    </div>
  );
}
