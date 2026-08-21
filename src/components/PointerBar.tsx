import type { ProjectStage } from "@/db/schema";
import { PIPELINE_STAGE_ORDER as STAGE_ORDER, STAGE_TYPE_LABEL } from "@/lib/stages";

export function PointerBar({
  stages,
  status,
  currentLabel,
}: {
  stages: ProjectStage[];
  status: string;
  currentLabel: string | null;
}) {
  const done = new Set(stages.map((s) => s.stageType));
  const finished = status === "completed";
  const pct = finished ? 100 : Math.round((done.size / STAGE_ORDER.length) * 100);
  const headline = finished ? "100% shipped" : currentLabel ? `${currentLabel} · ${pct}%` : `${pct}%`;

  return (
    <div className="my-7">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-display text-[11px] font-bold tracking-wide text-muted uppercase">
          Pipeline progress
        </span>
        <span className="text-[13px] font-bold text-lime-dim">{headline}</span>
      </div>
      <div
        className="relative mx-1.5 mb-3.5 h-0.5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--line-strong) 0, var(--line-strong) 3px, transparent 3px, transparent 8px)",
        }}
      >
        <div
          className="absolute top-[-0.5px] left-0 h-[3px] bg-lime transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
        {STAGE_ORDER.map((type, i) => {
          const left = (i / (STAGE_ORDER.length - 1)) * 100;
          const isDone = finished || done.has(type);
          return (
            <div
              key={type}
              title={STAGE_TYPE_LABEL[type]}
              className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] ${
                isDone ? "border-lime bg-lime" : "border-border bg-background"
              }`}
              style={{ left: `${left}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between px-0.5 text-[10px] font-bold tracking-wide text-faint uppercase">
        <span>{STAGE_TYPE_LABEL[STAGE_ORDER[0]]}</span>
        <span>{STAGE_TYPE_LABEL[STAGE_ORDER[STAGE_ORDER.length - 1]]}</span>
      </div>
    </div>
  );
}
