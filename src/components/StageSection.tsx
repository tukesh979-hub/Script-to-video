import type { ProjectStage } from "@/db/schema";
import { STAGE_GLYPH } from "@/lib/icons";
import {
  parseStageData,
  STAGE_TYPE_LABEL,
  type AssemblyData,
  type BeatSheetData,
  type CaptionsData,
  type RawFootageData,
  type SceneData,
  type SfxData,
} from "@/lib/stages";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-display text-[10px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-panel-2 px-2.5 py-1 text-xs text-muted">{children}</span>
  );
}

function StageBody({ stageType, data }: { stageType: string; data: unknown }) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-faint">No detail recorded for this stage.</p>;
  }

  switch (stageType) {
    case "raw_footage": {
      const d = data as RawFootageData;
      return (
        <ul className="flex flex-col gap-2">
          {d.clips.map((c) => (
            <li key={c.name} className="rounded-lg border border-border bg-panel-2 p-3">
              <p className="font-mono text-xs text-lime-dim">{c.name}</p>
              <p className="mt-1 text-sm text-muted">Used in: {c.usedIn}</p>
              {c.note && <p className="mt-1 text-xs text-faint">{c.note}</p>}
            </li>
          ))}
        </ul>
      );
    }
    case "captions": {
      const d = data as CaptionsData;
      return (
        <div className="flex flex-col gap-3">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Source" value={d.source} />
            <Field label="Timing source" value={d.timingSource} />
            <Field label="Rendering" value={d.rendering} />
            <Field label="Style" value={d.style} />
          </dl>
          <ul className="list-disc pl-4 text-sm text-muted">
            {d.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      );
    }
    case "sfx": {
      const d = data as SfxData;
      return (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wide text-faint">
                  <th className="px-3 py-2 font-display font-normal">Cue</th>
                  <th className="px-3 py-2 font-display font-normal">Category</th>
                  <th className="px-3 py-2 font-display font-normal">Volume</th>
                  <th className="px-3 py-2 font-display font-normal">Used for</th>
                </tr>
              </thead>
              <tbody>
                {d.cues.map((c) => (
                  <tr key={c.name} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-lime-dim">{c.name}</td>
                    <td className="px-3 py-2 text-muted">{c.category}</td>
                    <td className="px-3 py-2 text-muted">{c.volume}</td>
                    <td className="px-3 py-2 text-muted">{c.usedFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc pl-4 text-sm text-muted">
            {d.conventions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      );
    }
    case "beat_sheet": {
      const d = data as BeatSheetData;
      return (
        <ol className="flex flex-col gap-2">
          {d.beats.map((b) => (
            <li key={b.num} className="flex gap-3 rounded-lg border border-border bg-panel-2 p-3 text-sm">
              <span className="shrink-0 font-display text-xs text-lime-dim">#{b.num}</span>
              <span className="shrink-0 font-mono text-xs text-faint">{b.time}</span>
              <span className="text-muted italic">&ldquo;{b.vo}&rdquo;</span>
            </li>
          ))}
        </ol>
      );
    }
    case "scene": {
      const d = data as SceneData;
      return (
        <div className="flex flex-col gap-3">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Technique" value={d.technique} />
            <Field label="Transition in" value={d.transitionIn} />
            <Field label="SFX" value={d.sfx} />
          </dl>
          {d.assets.length > 0 && (
            <div>
              <p className="mb-1.5 font-display text-[10px] uppercase tracking-wide text-faint">Assets</p>
              <div className="flex flex-wrap gap-1.5">
                {d.assets.map((a) => (
                  <Pill key={a.name}>
                    {a.name} <span className="text-faint">· {a.type.replace("_", " ")}</span>
                  </Pill>
                ))}
              </div>
            </div>
          )}
          {d.overlays.length > 0 && (
            <div>
              <p className="mb-1.5 font-display text-[10px] uppercase tracking-wide text-faint">Overlays</p>
              <div className="flex flex-wrap gap-1.5">
                {d.overlays.map((o) => (
                  <Pill key={o}>{o}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    case "assembly": {
      const d = data as AssemblyData;
      return (
        <div className="flex flex-col gap-4">
          <Field label="Render pipeline" value={d.renderPipeline} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["music", "voice", "output"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-border bg-panel-2 p-3">
                <p className="font-display text-[10px] uppercase tracking-wide text-faint">{k}</p>
                <dl className="mt-1.5 flex flex-col gap-1">
                  {Object.entries(d[k] ?? {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2 text-xs">
                      <dt className="text-faint">{key}</dt>
                      <dd className="text-right text-muted">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return <pre className="overflow-x-auto text-xs text-faint">{JSON.stringify(data, null, 2)}</pre>;
  }
}

export function StageSection({ stage, defaultOpen = false }: { stage: ProjectStage; defaultOpen?: boolean }) {
  const data = parseStageData(stage.stageType, stage.dataJson);
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-border bg-panel open:pb-4"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
        <span aria-hidden className="font-display text-sm text-lime-dim">
          {STAGE_GLYPH[stage.stageType] ?? "▶"}
        </span>
        <div className="flex-1">
          <p className="font-display text-[10px] uppercase tracking-wide text-faint">
            {STAGE_TYPE_LABEL[stage.stageType as keyof typeof STAGE_TYPE_LABEL] ?? stage.stageType}
          </p>
          <p className="text-sm font-semibold text-foreground">{stage.title}</p>
        </div>
        <span className="hidden text-xs text-muted sm:block">{stage.summary}</span>
        <span aria-hidden className="text-faint transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-border px-4 pt-4">
        <p className="mb-3 text-sm text-muted sm:hidden">{stage.summary}</p>
        <StageBody stageType={stage.stageType} data={data} />
      </div>
    </details>
  );
}
