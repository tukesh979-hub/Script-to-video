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
      <dt className="font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-[#16181d]">{value}</dd>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/70 bg-white/60 px-2.5 py-1 font-ui text-xs text-[#16181d]/60">
      {children}
    </span>
  );
}

function StageBody({ stageType, data }: { stageType: string; data: unknown }) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-[#16181d]/40">No detail recorded for this stage.</p>;
  }

  switch (stageType) {
    case "raw_footage": {
      const d = data as RawFootageData;
      return (
        <ul className="flex flex-col gap-2">
          {d.clips.map((c) => (
            <li key={c.name} className="rounded-xl bg-white/40 p-3">
              <p className="font-ui text-xs font-semibold text-[#7c6ff0]">{c.name}</p>
              <p className="mt-1 text-sm text-[#16181d]/60">Used in: {c.usedIn}</p>
              {c.note && <p className="mt-1 text-xs text-[#16181d]/40">{c.note}</p>}
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
          <ul className="list-disc pl-4 text-sm text-[#16181d]/60">
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
          <div className="overflow-x-auto rounded-xl border border-white/50">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/50 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
                  <th className="px-3 py-2 font-normal">Cue</th>
                  <th className="px-3 py-2 font-normal">Category</th>
                  <th className="px-3 py-2 font-normal">Volume</th>
                  <th className="px-3 py-2 font-normal">Used for</th>
                </tr>
              </thead>
              <tbody>
                {d.cues.map((c) => (
                  <tr key={c.name} className="border-b border-white/30 last:border-0">
                    <td className="px-3 py-2 font-ui text-xs font-semibold text-[#7c6ff0]">{c.name}</td>
                    <td className="px-3 py-2 text-[#16181d]/60">{c.category}</td>
                    <td className="px-3 py-2 text-[#16181d]/60">{c.volume}</td>
                    <td className="px-3 py-2 text-[#16181d]/60">{c.usedFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc pl-4 text-sm text-[#16181d]/60">
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
            <li key={b.num} className="flex gap-3 rounded-xl bg-white/40 p-3 text-sm">
              <span className="shrink-0 font-ui text-xs font-bold text-[#7c6ff0]">#{b.num}</span>
              <span className="shrink-0 font-ui text-xs text-[#16181d]/40">{b.time}</span>
              <span className="text-[#16181d]/60 italic">&ldquo;{b.vo}&rdquo;</span>
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
              <p className="mb-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Assets</p>
              <div className="flex flex-wrap gap-1.5">
                {d.assets.map((a) => (
                  <Pill key={a.name}>
                    {a.name} <span className="text-[#16181d]/40">· {a.type.replace("_", " ")}</span>
                  </Pill>
                ))}
              </div>
            </div>
          )}
          {d.overlays.length > 0 && (
            <div>
              <p className="mb-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Overlays</p>
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
              <div key={k} className="rounded-xl bg-white/40 p-3">
                <p className="font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">{k}</p>
                <dl className="mt-1.5 flex flex-col gap-1">
                  {Object.entries(d[k] ?? {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2 text-xs">
                      <dt className="text-[#16181d]/40">{key}</dt>
                      <dd className="text-right text-[#16181d]/60">{String(value)}</dd>
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
      return <pre className="overflow-x-auto text-xs text-[#16181d]/40">{JSON.stringify(data, null, 2)}</pre>;
  }
}

/**
 * Each stage gets a big numbered phase badge (01, 02, 03...) as the primary
 * visual identifier -- borrowed from how the Netflix Vox reference reel
 * breakdown presents its numbered scene phases. Unlike that first pass,
 * stages are NOT individual floating cards: they flow directly on the
 * page's own background, one after another, separated by a hairline
 * divider -- a single continuous page, not a stack of boxed widgets. Every
 * stage is expanded by default (defaultOpen defaults to true) since this
 * is meant to read like a document, not a stack of accordions you have to
 * open one by one -- the native <details> disclosure still lets you
 * collapse an individual one if you want.
 */
export function StageSection({
  stage,
  index,
  defaultOpen = true,
}: {
  stage: ProjectStage;
  index: number;
  defaultOpen?: boolean;
}) {
  const data = parseStageData(stage.stageType, stage.dataJson);
  const num = String(index + 1).padStart(2, "0");
  return (
    <details open={defaultOpen} className="group border-b border-[#16181d]/8 py-5 first:pt-0 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3.5">
        <span aria-hidden className="oceanic-accent-text shrink-0 font-heading text-3xl font-bold">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
            <span aria-hidden>{STAGE_GLYPH[stage.stageType] ?? "▶"}</span>
            {STAGE_TYPE_LABEL[stage.stageType as keyof typeof STAGE_TYPE_LABEL] ?? stage.stageType}
          </p>
          <p className="truncate font-heading text-lg font-semibold text-[#16181d]">{stage.title}</p>
        </div>
        <span aria-hidden className="shrink-0 text-[#16181d]/40 transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="mt-3 pl-[3.25rem]">
        <p className="mb-3 text-sm text-[#16181d]/55">{stage.summary}</p>
        <StageBody stageType={stage.stageType} data={data} />
      </div>
    </details>
  );
}
