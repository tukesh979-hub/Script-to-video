import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { rowToRender } from "@/lib/db-rows";
import { NotificationItem } from "./NotificationItem";

export default async function NotificationsPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: renderRows } = await supabase
    .from("renders")
    .select("*")
    .in("status", ["ready", "failed"])
    .is("acknowledged_at", null)
    .order("completed_at", { ascending: false });
  const renders = (renderRows ?? []).map(rowToRender);

  // No FK from renders.project_id -> projects.id (this project's no-FK
  // convention -- see db/schema.ts), so Supabase's embedded-select join
  // syntax isn't available here; fetch names separately instead.
  const projectIds = [...new Set(renders.map((r) => r.projectId))];
  const { data: projectRows } = projectIds.length
    ? await supabase.from("projects").select("id, name").in("id", projectIds)
    : { data: [] };
  const nameById = new Map((projectRows ?? []).map((p) => [p.id as string, p.name as string]));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Notifications</h1>
        <p className="mt-2 text-base text-foreground/70">Render outcomes you haven&apos;t seen yet.</p>
      </header>

      {renders.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border bg-panel py-24 text-center">
          <p className="text-base text-foreground/70">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {renders.map((render) => (
            <NotificationItem key={render.id} render={render} projectName={nameById.get(render.projectId) ?? "Untitled project"} />
          ))}
        </div>
      )}
    </div>
  );
}
