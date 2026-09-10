import type { ProjectStatus } from "@/db/schema";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

// Visuals per DESIGN-SYSTEM.md's Projects screen: only "Shipped" gets a
// tinted (green) badge in the mockup, everything else is the plain glass
// pill. Needs-review gets its own amber tint here (not shown in the mockup's
// Projects grid, but the status exists in the real schema and needed some
// treatment) -- a small, low-risk addition, not a redesign of the badge.
const STYLES: Record<ProjectStatus, { label: string; className: string; icon?: Icon }> = {
  completed: { label: "Shipped", className: "bg-[rgba(26,156,91,0.15)] text-[#1a9c5b]", icon: CheckCircle },
  in_progress: { label: "In progress", className: "bg-white/85 text-[#16181d]" },
  needs_review: { label: "Needs review", className: "bg-[rgba(164,101,15,0.15)] text-[#a4650f]" },
  cancelled: { label: "Cancelled", className: "bg-white/60 text-[#16181d]/50" },
};

export function OceanicStatusBadge({ status }: { status: string }) {
  const s = STYLES[status as ProjectStatus] ?? STYLES.in_progress;
  const Icon = s.icon;
  return (
    <span
      className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-ui text-[10px] font-bold ${s.className}`}
    >
      {Icon && <Icon weight="fill" size={11} aria-hidden />}
      {s.label}
    </span>
  );
}
