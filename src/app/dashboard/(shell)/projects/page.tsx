import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { rowToProject } from "@/lib/db-rows";
import type { Project } from "@/db/schema";
import { OceanicProjectGrid } from "@/components/oceanic/OceanicProjectGrid";

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

  return (
    <div>
      <p className="mb-1.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Projects</p>
      <h1 className="mb-6 font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">All Projects</h1>
      <OceanicProjectGrid projects={allProjects} />
    </div>
  );
}
