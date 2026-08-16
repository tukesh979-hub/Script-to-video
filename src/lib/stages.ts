import type { StageType } from "@/db/schema";

/**
 * Per-stageType dataJson shapes. Loose by design (see schema.ts comment) —
 * these types document what THIS project's seed data actually writes, not a
 * DB-enforced contract. StageSection falls back to a raw JSON dump for any
 * shape it doesn't recognize, so a stage never renders blank.
 */

export type RawFootageData = {
  clips: { name: string; usedIn: string; note?: string }[];
};

export type CaptionsData = {
  source: string;
  timingSource: string;
  rendering: string;
  style: string;
  details: string[];
};

export type SfxData = {
  cues: { name: string; category: string; volume: string; usedFor: string }[];
  conventions: string[];
};

export type BeatSheetData = {
  beats: { num: string; time: string; vo: string }[];
};

export type SceneData = {
  technique: string;
  transitionIn: string;
  assets: { name: string; type: string }[];
  overlays: string[];
  sfx: string;
  notes?: string;
};

export type AssemblyData = {
  renderPipeline: string;
  music: Record<string, unknown>;
  voice: Record<string, unknown>;
  output: Record<string, unknown>;
};

export function parseStageData(stageType: string, dataJson: string): unknown {
  try {
    return JSON.parse(dataJson);
  } catch {
    return null;
  }
}

export const STAGE_TYPE_LABEL: Record<StageType, string> = {
  raw_footage: "Raw Footage",
  captions: "Captions",
  voiceover: "Voiceover",
  sfx: "SFX Generation",
  storyboard: "Storyboard",
  beat_sheet: "Beat Sheet",
  scene: "Scene",
  assembly: "Final Assembly",
};
