import type { ProjectStatus } from "@/db/schema";
import { GLYPH } from "@/lib/icons";

// Semantic color is separate from the brand accent: shipped = stamp green
// (a rubber "approved" stamp), in-progress = accent red (a REC/tally
// light), needs-review = warn amber (a safety light), cancelled = neutral.
const STYLES: Record<ProjectStatus, { label: string; glyph: string; className: string; pulse?: boolean }> = {
  completed: { label: "Shipped", glyph: GLYPH.done, className: "border-stamp/50 bg-stamp-soft text-stamp" },
  in_progress: {
    label: "In Progress",
    glyph: GLYPH.inProgress,
    className: "border-lime/50 bg-lime-soft text-lime-dim",
    pulse: true,
  },
  needs_review: { label: "Needs Review", glyph: "!", className: "border-warn/50 bg-warn-soft text-warn" },
  cancelled: { label: "Cancelled", glyph: GLYPH.cancelled, className: "border-faint/40 bg-panel-2 text-faint" },
};

/** A stamped corner tab, not a floating pill -- flat rectangle, hairline
 * border, mono-ish uppercase label. */
export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status as ProjectStatus] ?? STYLES.in_progress;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-display text-[11px] font-bold tracking-wide uppercase ${s.className}`}
    >
      {s.pulse ? <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" /> : <span aria-hidden>{s.glyph}</span>}
      {s.label}
    </span>
  );
}
