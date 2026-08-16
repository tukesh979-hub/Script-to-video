/**
 * The site's icon language — geometric/symbol glyphs, not an icon font or
 * emoji. Reuse these exact glyphs for these exact meanings (per
 * 03-brand-style.md); don't substitute or add new ones ad hoc.
 */
export const GLYPH = {
  brief: "✦", // primary action / brief / new run
  research: "◈",
  script: "✎", // script / editing
  storyboard: "▣", // storyboard / frames
  voiceover: "♪", // voiceover / audio
  animate: "▶", // animate / video / play
  assemble: "⧉",
  repurpose: "⇲", // repurpose / export
  inProgress: "◐",
  done: "✓",
  cancelled: "✕",
} as const;

export type GlyphKey = keyof typeof GLYPH;

/** Maps a pipeline stage type to its glyph — used by the stage list on the
 * project detail page so every stage carries the right established icon. */
export const STAGE_GLYPH: Record<string, string> = {
  raw_footage: GLYPH.animate,
  captions: GLYPH.script,
  voiceover: GLYPH.voiceover,
  sfx: GLYPH.voiceover,
  storyboard: GLYPH.storyboard,
  beat_sheet: GLYPH.storyboard,
  scene: GLYPH.animate,
  assembly: GLYPH.assemble,
};
