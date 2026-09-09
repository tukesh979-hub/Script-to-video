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
    <div className="mb-2 border-b border-[#16181d]/8 pb-5">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-ui text-[11px] font-bold tracking-[0.06em] text-[#16181d]/45 uppercase">
          Pipeline progress
        </span>
        <span className="oceanic-accent-text text-[13px] font-bold">{headline}</span>
      </div>
      <div className="relative mx-1.5 mb-3.5 h-1 overflow-visible rounded-full bg-[#16181d]/10">
        <div
          className="oceanic-accent-gradient absolute top-0 left-0 h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
        {STAGE_ORDER.map((type, i) => {
          const left = (i / (STAGE_ORDER.length - 1)) * 100;
          const isDone = finished || done.has(type);
          return (
            <div
              key={type}
              title={STAGE_TYPE_LABEL[type]}
              className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                isDone ? "oceanic-accent-gradient" : "bg-[#16181d]/20"
              }`}
              style={{ left: `${left}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between px-0.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
        <span>{STAGE_TYPE_LABEL[STAGE_ORDER[0]]}</span>
        <span>{STAGE_TYPE_LABEL[STAGE_ORDER[STAGE_ORDER.length - 1]]}</span>
      </div>
    </div>
  );
}
