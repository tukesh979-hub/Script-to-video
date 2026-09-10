import {
  Play,
  PenNib,
  SquaresFour,
  MusicNote,
  Sparkle,
  Stack,
  ArrowsOutSimple,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * The site's icon language — real SVG icons (Phosphor, light weight), not
 * unicode glyphs or emoji. Rendering unicode symbols like "✦"/"▣" depends on
 * the viewer's system font and renders inconsistently across OS/browser;
 * real icon components render identically everywhere. Reuse these exact
 * icons for these exact meanings; don't substitute or add new ones ad hoc.
 */
export const STAGE_ICON: Record<string, Icon> = {
  raw_footage: Play,
  captions: PenNib,
  voiceover: MusicNote,
  sfx: MusicNote,
  storyboard: SquaresFour,
  beat_sheet: SquaresFour,
  scene: Play,
  assembly: ArrowsOutSimple,
};

export const STATUS_ICON = {
  inProgress: Sparkle,
  done: CheckCircle,
  cancelled: XCircle,
  stack: Stack,
} as const;
