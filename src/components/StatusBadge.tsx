import type { ProjectStatus } from "@/db/schema";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

// Same semantic palette as OceanicStatusBadge (used on the Folders/Projects
// grids) -- this is the standalone, non-absolute variant for a page header
// rather than a thumbnail overlay.
const STYLES: Record<ProjectStatus, { label: string; className: string; icon?: Icon; pulse?: boolean }> = {
  completed: { label: "Shipped", className: "bg-[rgba(26,156,91,0.15)] text-[#1a9c5b]", icon: CheckCircle },
  in_progress: { label: "In progress", className: "bg-[rgba(124,111,240,0.15)] text-[#7c6ff0]", pulse: true },
  needs_review: { label: "Needs review", className: "bg-[rgba(164,101,15,0.15)] text-[#a4650f]" },
  cancelled: { label: "Cancelled", className: "bg-[#16181d]/8 text-[#16181d]/50" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status as ProjectStatus] ?? STYLES.in_progress;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[11px] font-bold ${s.className}`}>
      {s.pulse && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon weight="fill" size={12} aria-hidden />}
      {s.label}
    </span>
  );
}
