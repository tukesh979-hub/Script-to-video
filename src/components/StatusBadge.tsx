import type { ProjectStatus } from "@/db/schema";

const STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-panel-2 text-muted border-border" },
  building: { label: "Building", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  rendering: { label: "Rendering", className: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  ready: { label: "Ready", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  failed: { label: "Failed", className: "bg-red-500/15 text-red-300 border-red-500/30" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status as ProjectStatus] ?? STYLES.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.className}`}
    >
      {(status === "building" || status === "rendering") && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {s.label}
    </span>
  );
}
