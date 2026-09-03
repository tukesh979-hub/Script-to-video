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
      <p className="mb-1.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Notifications</p>
      <h1 className="mb-6 font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">Notifications</h1>

      {renders.length === 0 ? (
        <div className="glass flex max-w-xl flex-col items-center justify-center rounded-[18px] py-24 text-center">
          <p className="font-oceanic-body text-sm text-[#16181d]/60">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="flex max-w-xl flex-col gap-2.5">
          {renders.map((render) => (
            <NotificationItem key={render.id} render={render} projectName={nameById.get(render.projectId) ?? "Untitled project"} />
          ))}
        </div>
      )}
    </div>
  );
}
