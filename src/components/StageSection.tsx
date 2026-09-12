import type { ProjectStage } from "@/db/schema";
import { STAGE_ICON } from "@/lib/icons";
import { CaretRight, Play } from "@phosphor-icons/react/ssr";
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

// Alternating section-band backgrounds so adjacent stages (and the Asset
// Sheet, see page.tsx) read as distinct rows instead of one undifferentiated
// wall of content -- "dark" is a subtle dark tint layered over the glass
// panel's own translucent white, not a real dark-mode background.
export const TONE_BG: Record<"light" | "dark", string> = {
  light: "",
  dark: "bg-[#16181d]/[0.035]",
};

// Each field gets its own bordered cell so a 2-up dl reads as a small grid
// table, not just loose label/value pairs floating in whitespace.
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#16181d]/8 p-3">
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

// A real isolated preview render, by exact stage title, only where one
// actually exists on disk (copied from the source remotion-engine project's
// generation-output/ -- most beats were only ever rendered as part of the
// full concat, not in isolation, so this stays partial rather than faking
// coverage for beats that were never rendered alone).
const SCENE_VIDEO: Record<string, string> = {
  "Beat 5 — HUD Card Stack": "/asset-previews/beat5-preview.mp4",
};

// Shared by both the per-stage switch below (defensive fallback) and
// SceneGroupSection, which renders every "scene" stage stacked inside one
// retractable rather than routing each through StageBody individually.
function SceneBody({ stageTitle, data }: { stageTitle: string; data: SceneData }) {
  const video = SCENE_VIDEO[stageTitle];
  return (
    <div className="flex flex-col gap-3">
      {video && (
        <video
          src={video}
          controls
          loop
          muted
          playsInline
          className="aspect-9/16 w-full max-w-50 rounded-xl border border-[#16181d]/10"
        />
      )}
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="Technique" value={data.technique} />
        <Field label="Transition in" value={data.transitionIn} />
        <Field label="SFX" value={data.sfx} />
      </dl>
      {data.assets.length > 0 && (
        <div>
          <p className="mb-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Assets</p>
          <div className="flex flex-wrap gap-1.5">
            {data.assets.map((a) => (
              <Pill key={a.name}>
                {a.name} <span className="text-[#16181d]/40">· {a.type.replace("_", " ")}</span>
              </Pill>
            ))}
          </div>
        </div>
      )}
      {data.overlays.length > 0 && (
        <div>
          <p className="mb-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Overlays</p>
          <div className="flex flex-wrap gap-1.5">
            {data.overlays.map((o) => (
              <Pill key={o}>{o}</Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StageBody({ stageType, stageTitle, data }: { stageType: string; stageTitle: string; data: unknown }) {
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
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
        <div className="flex min-w-0 flex-col gap-3">
          <div className="min-w-0 overflow-x-auto rounded-xl border border-white/50">
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
    case "storyboard":
    case "beat_sheet": {
      const d = data as BeatSheetData;
      return (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#16181d]/10 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
              <th className="w-12 py-2 pr-3 font-normal">#</th>
              <th className="w-20 py-2 pr-3 font-normal">Time</th>
              <th className="py-2 font-normal">Line</th>
            </tr>
          </thead>
          <tbody>
            {d.beats.map((b) => (
              <tr key={b.num} className="border-b border-[#16181d]/8 last:border-0">
                <td className="py-2 pr-3 font-ui text-xs font-bold text-[#7c6ff0]">{b.num}</td>
                <td className="py-2 pr-3 font-ui text-xs text-[#16181d]/40">{b.time}</td>
                <td className="py-2 text-[#16181d]/70 italic">&ldquo;{b.vo}&rdquo;</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "scene": {
      return <SceneBody stageTitle={stageTitle} data={data as SceneData} />;
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
 * breakdown presents its numbered scene phases. Stages are NOT individual
 * floating cards: they're segments inside one larger glass surface (the
 * project detail page's "complete project" box), separated from each other
 * only by a hairline divider. Every stage is expanded by default
 * (defaultOpen defaults to true) since this is meant to read like a
 * document, not a stack of accordions you have to open one by one -- the
 * native <details> disclosure still lets you collapse an individual one if
 * you want.
 */
export function StageSection({
  stage,
  index,
  defaultOpen = true,
  tone = "light",
}: {
  stage: ProjectStage;
  index: number;
  defaultOpen?: boolean;
  /** Alternating band color so this stage reads as a distinct row -- see TONE_BG. */
  tone?: "light" | "dark";
}) {
  const data = parseStageData(stage.stageType, stage.dataJson);
  const num = String(index + 1).padStart(2, "0");
  const StageIcon = STAGE_ICON[stage.stageType] ?? Play;
  return (
    <details
      open={defaultOpen}
      className={`group -mx-4 border-b border-[#16181d]/8 px-4 py-5 last:border-b-0 sm:-mx-5 sm:px-5 ${TONE_BG[tone]}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3.5">
        <span aria-hidden className="oceanic-accent-text shrink-0 font-heading text-3xl font-bold">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
            <StageIcon weight="light" size={12} aria-hidden />
            {STAGE_TYPE_LABEL[stage.stageType as keyof typeof STAGE_TYPE_LABEL] ?? stage.stageType}
          </p>
          <p className="truncate font-heading text-lg font-semibold text-[#16181d]">{stage.title}</p>
        </div>
        <CaretRight
          weight="bold"
          size={14}
          aria-hidden
          className="shrink-0 text-[#16181d]/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-90"
        />
      </summary>
      <div className="mt-3 pl-[3.25rem]">
        <p className="mb-3 text-sm text-[#16181d]/55">{stage.summary}</p>
        <StageBody stageType={stage.stageType} stageTitle={stage.title} data={data} />
      </div>
    </details>
  );
}

/**
 * Every "scene" stage (Beat 1, Beat 2, ... End Frame) is one beat of the
 * same video, not a separate pipeline phase -- so instead of each beat
 * getting its own top-level numbered accordion, this rolls the whole run
 * into ONE retractable. Beats inside are separated only by a thin divider
 * (border-t between them), each keeping its own sub-heading + body (video
 * where one actually exists on disk, technique/transition/SFX fields,
 * asset/overlay pills).
 */
export function SceneGroupSection({
  scenes,
  index,
  defaultOpen = true,
  tone = "light",
}: {
  scenes: ProjectStage[];
  index: number;
  defaultOpen?: boolean;
  tone?: "light" | "dark";
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <details
      open={defaultOpen}
      className={`group -mx-4 border-b border-[#16181d]/8 px-4 py-5 last:border-b-0 sm:-mx-5 sm:px-5 ${TONE_BG[tone]}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3.5">
        <span aria-hidden className="oceanic-accent-text shrink-0 font-heading text-3xl font-bold">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
            <Play weight="light" size={12} aria-hidden />
            Scenes
          </p>
          <p className="truncate font-heading text-lg font-semibold text-[#16181d]">
            Beat-by-beat breakdown · {scenes.length} beats
          </p>
        </div>
        <CaretRight
          weight="bold"
          size={14}
          aria-hidden
          className="shrink-0 text-[#16181d]/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-90"
        />
      </summary>
      <div className="mt-3 flex flex-col pl-[3.25rem]">
        {scenes.map((stage, i) => {
          const data = parseStageData(stage.stageType, stage.dataJson) as SceneData | null;
          return (
            <div key={stage.id} className={`py-4 first:pt-0 ${i > 0 ? "border-t border-[#16181d]/8" : ""}`}>
              <p className="font-heading text-base font-semibold text-[#16181d]">{stage.title}</p>
              <p className="mt-1 mb-3 text-sm text-[#16181d]/55">{stage.summary}</p>
              {data ? (
                <SceneBody stageTitle={stage.title} data={data} />
              ) : (
                <p className="text-sm text-[#16181d]/40">No detail recorded for this stage.</p>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}
