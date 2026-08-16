import type { ProjectStatus } from "@/db/schema";
import { GLYPH } from "@/lib/icons";

// Semantic mapping per 03-brand-style.md: lime = done/active, red = error/cancelled,
// muted = neutral. No other accent colors.
const STYLES: Record<ProjectStatus, { label: string; glyph: string; className: string; pulse?: boolean }> = {
  completed: { label: "Shipped", glyph: GLYPH.done, className: "border-lime/40 bg-lime/10 text-lime" },
  in_progress: { label: "In Progress", glyph: GLYPH.inProgress, className: "border-lime-dim/40 bg-lime-dim/10 text-lime-dim", pulse: true },
  needs_review: { label: "Needs Review", glyph: "!", className: "border-red/40 bg-red/10 text-red" },
  cancelled: { label: "Cancelled", glyph: GLYPH.cancelled, className: "border-faint/40 bg-panel-2 text-faint" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status as ProjectStatus] ?? STYLES.in_progress;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[11px] uppercase tracking-wide ${s.className}`}
    >
      {s.pulse ? <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" /> : <span aria-hidden>{s.glyph}</span>}
      {s.label}
    </span>
  );
}
