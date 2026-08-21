import { randomUUID } from "node:crypto";
import { db } from "./index";
import { projects, projectStages, projectAssets } from "./schema";

/**
 * Seeds with the real projects built this session, so the Dashboard shows
 * something true rather than lorem-ipsum placeholders. The three "completed"
 * projects and all of Navneet's stage/asset detail are real, pulled directly
 * from the actual remotion-engine build. The in_progress/needs_review/
 * cancelled rows are clearly-labeled examples added only so those dashboard
 * states can be seen and verified -- not claimed as real runs.
 *
 * Needs a real auth.users id to attach these to (RLS means unowned rows are
 * invisible to everyone) -- sign up once first, then run:
 *   SEED_USER_ID=<uuid from Supabase Auth users table> npm run db:seed
 */

const SEED_USER_ID = process.env.SEED_USER_ID;
if (!SEED_USER_ID) {
  throw new Error(
    "SEED_USER_ID is not set. Sign up once, grab your user id from Supabase's Auth > Users table, then run: " +
      "SEED_USER_ID=<uuid> npm run db:seed",
  );
}

// tsx compiles this file as CJS (no "type": "module" in package.json, and
// deliberately not adding one -- see the migration to postgres-js's own
// note on why this project stays CJS everywhere else), which doesn't allow
// top-level await. Everything that awaits lives inside main() instead.
// Takes userId as a parameter (rather than closing over the outer
// SEED_USER_ID) so its narrowed `string` type -- not `string | undefined` --
// is what the function body actually sees.
async function main(userId: string) {
  const navneetId = randomUUID();
  const porscheId = randomUUID();
  const testimonialId = randomUUID();

const SEED_PROJECTS = [
  {
    id: navneetId,
    name: "Navneet / Porsche 911 Reel",
    description:
      "Real hackathon talking-head footage + 10 motion-design beats + End Frame CTA, real VO-driven timing.",
    status: "completed" as const,
    thumbnailUrl: "/thumbnails/navneet-porsche-reel.jpg",
    durationSeconds: 48,
    stageCount: 8,
    frameCount: 1434,
    voTakes: 0, // real spoken narration, not synthetic VO takes
  },
  {
    id: porscheId,
    name: "Porsche 911 Taste Test",
    description: "Fully AI-generated motion-design video, synthetic VO + generated illustrations.",
    status: "completed" as const,
    thumbnailUrl: "/thumbnails/porsche-911-taste-test.jpg",
    durationSeconds: 44,
    stageCount: 6,
    frameCount: 1320,
    voTakes: 1,
  },
  {
    id: testimonialId,
    name: "Testimonial Ad",
    description: "Reveal-animation testimonial ad build.",
    status: "completed" as const,
    thumbnailUrl: "/thumbnails/testimonial-ad.jpg",
    durationSeconds: 30,
    stageCount: 5,
    frameCount: 900,
    voTakes: 1,
  },
  {
    id: randomUUID(),
    name: "Example: In-Progress Run",
    description: "Demo row so the in-progress card state can be seen — not a real render.",
    status: "in_progress" as const,
    progressPercent: 62,
    currentStage: "Rendering",
  },
  {
    id: randomUUID(),
    name: "Example: Needs-Review Run",
    description: "Demo row so the needs-review card state can be seen — not a real render.",
    status: "needs_review" as const,
    reviewNote: "Fact-check gate: verify claimed spec numbers before shipping.",
  },
  {
    id: randomUUID(),
    name: "Example: Cancelled Run",
    description: "Demo row so the cancelled card state can be seen — not a real render.",
    status: "cancelled" as const,
  },
];

for (const p of SEED_PROJECTS) {
  await db.insert(projects).values({ ...p, userId });
}

// ---------------------------------------------------------------------------
// Navneet project — full real pipeline, in real production order.
// ---------------------------------------------------------------------------

type StageInput = {
  stageType: (typeof import("./schema").stageTypeValues)[number];
  stageOrder: number;
  title: string;
  summary: string;
  data: unknown;
};

const navneetStages: StageInput[] = [
  {
    stageType: "raw_footage",
    stageOrder: 1,
    title: "Raw Footage",
    summary: "Real hackathon talk recording — 1080x1920, 25fps native, 44.8s.",
    data: {
      clips: [
        {
          name: "navneet-car-reel.mp4",
          usedIn: "Continuous base layer, entire video (beats 4 & 10 shown raw/untouched)",
          note: "Copied from the presenter's own recording; not AI-generated.",
        },
      ],
    },
  },
  {
    stageType: "captions",
    stageOrder: 2,
    title: "Captions",
    summary: "Word-level captions from real speech, whisper.cpp, word-by-word display.",
    data: {
      source: "whisper.cpp transcription of the real audio track (generation/transcribeNavneetReel.mts)",
      timingSource: "Real word-level millisecond timestamps — never eyeballed frame numbers",
      rendering: "@snap-cn/word-captions, house style in src/editor/captionStyle.ts",
      style: "'clean' preset, 39px, white highlight on dimmed-gray body, 3 words / 22 chars max (forces one line)",
      details: [
        "Auto-synced per-group reveal SFX (captionRevealSfxCues) — computed via the same pagination function the caption component uses internally, so it can't drift out of sync",
        "Suppressed during 3 windows where on-screen text already said the same words: the card-grid's own caption, the HUD cards naming brands, and Beat 6's title phrase",
      ],
    },
  },
  {
    stageType: "sfx",
    stageOrder: 3,
    title: "SFX Selection",
    summary: "65 sound cues across the video, tiered by prominence, synced to motion start.",
    data: {
      cues: [
        { name: "text-appear.wav", category: "text", volume: "0.14-0.3", usedFor: "Caption/card reveal pops" },
        { name: "scribble.mp3", category: "text", volume: "0.28-0.3", usedFor: "Underline/circle annotation draws" },
        { name: "whoosh-zoom-in.wav", category: "whoosh", volume: "0.3-0.45", usedFor: "Dropout & flourish launch" },
        { name: "swoosh-1.wav", category: "whoosh", volume: "0.3-0.35", usedFor: "Beat 6/7/8/9/End-Frame transitions" },
        { name: "zoom-in.mp3", category: "camera", volume: "0.3-0.35", usedFor: "Flourish freeze impact, HUD card pop" },
        { name: "win-8bit.mp3", category: "hit", volume: "0.4", usedFor: "The one reserved 'win' stinger — Beat 3 hero reveal only" },
        { name: "hud-pulsed.wav", category: "ui", volume: "0.35", usedFor: "Beat 5 HUD card appear" },
        { name: "article-reveal.mp3", category: "transition", volume: "0.3", usedFor: "Beat 6 title settle" },
      ],
      conventions: [
        "Synced to the START of a motion, not its settle point — corrected mid-project after a settle-synced version read as delayed",
        "Card reveal/flip SFX kept quiet (~0.14-0.16) so 9 repeated cues read as texture, not 9 separate events",
      ],
    },
  },
  {
    stageType: "beat_sheet",
    stageOrder: 4,
    title: "Beat Sheet",
    summary: "11 beats, each anchored to a real transcript word-boundary timestamp.",
    data: {
      beats: [
        { num: "1", time: "0:00-0:02.7", vo: "So there are tons of car brands out there" },
        { num: "2", time: "0:02.7-0:05.17", vo: "(same sentence continues)" },
        { num: "3", time: "0:05.7-0:09.33", vo: "...a true designer will recognize that" },
        { num: "4", time: "0:09.33-0:13.67", vo: "a true designer will recognize that, doesn't mean others..." },
        { num: "5", time: "0:13.67-0:21.4", vo: "...whether it's a Ferrari, a Rolls-Royce, or a Tesla..." },
        { num: "6", time: "0:21.4-0:30.36", vo: "But this model 911 is widely considered as one of the best designed cars. Ever." },
        { num: "7", time: "0:30.36-0:38.43", vo: "...there is something about it in terms of attention to detail..." },
        { num: "8", time: "0:38.43-0:40.37", vo: "...what was really needed, what was not needed..." },
        { num: "9", time: "0:40.37-0:41.73", vo: "...and how the whole thing comes together" },
        { num: "10", time: "0:41.73-0:44.8", vo: "Not just for designers but also for engineers" },
        { num: "End Frame", time: "0:44.8-0:47.8", vo: "(after the real footage ends)" },
      ],
    },
  },
  {
    stageType: "scene",
    stageOrder: 5,
    title: "Beat 1 — Card Grid Populate",
    summary: "9-card grid populates in a staggered pop-in with a tracking caption line.",
    data: {
      technique: "CardFlipGrid (populate phase)",
      transitionIn: "Blur-zoom whip (real footage -> graphic)",
      assets: [{ name: "9 brand logo/photo card pairs", type: "code_drawn" }],
      overlays: ["Underline scribble", "Circle scribble accent"],
      sfx: "Card-reveal pops x9 (quiet, 0.14), scribble sfx on underline/circle",
    },
  },
  {
    stageType: "scene",
    stageOrder: 6,
    title: "Beat 2 — Card Flip Reveal",
    summary: "Each card flips brand logo -> car photo, 5-frame stagger per card.",
    data: {
      technique: "CardFlipGrid (flip phase)",
      transitionIn: "Continuous from Beat 1",
      assets: [{ name: "Same 9 card pairs", type: "code_drawn" }],
      overlays: [],
      sfx: "Flip pop x9, synced to each flip's start",
    },
  },
  {
    stageType: "scene",
    stageOrder: 7,
    title: "Beat 3 — Magician Card Flourish (Hero Reveal)",
    summary: "Porsche 911 hero card: flash -> spin-flight -> freeze -> sheen.",
    data: {
      technique: "MagicianCardFlourish",
      transitionIn: "Overlaps Beat 2's dropout tail",
      assets: [{ name: "Porsche 911 hero card art", type: "ai_generated" }],
      overlays: ["Flash", "Sheen sweep"],
      sfx: "Flash, launch whoosh, freeze impact, WIN stinger, sheen",
    },
  },
  {
    stageType: "scene",
    stageOrder: 8,
    title: "Beat 4 — Raw Talking Head",
    summary: "Raw talking-head footage, untouched.",
    data: {
      technique: "(no graphic — broll only)",
      transitionIn: "Blur-zoom whip (graphic -> real footage)",
      assets: [],
      overlays: [],
      sfx: "—",
    },
  },
  {
    stageType: "scene",
    stageOrder: 9,
    title: "Beat 5 — HUD Card Stack",
    summary: "Ferrari / Rolls-Royce / Tesla cards unfold and accumulate on screen.",
    data: {
      technique: "HudCardStack",
      transitionIn: "Hard cut in — the HUD reveal itself is the entrance",
      assets: [{ name: "Ferrari / Rolls-Royce / Tesla card art", type: "ai_generated" }],
      overlays: ["Line-unfold-panel reveal per card"],
      sfx: "HUD-pulsed appear + pop, per card",
    },
  },
  {
    stageType: "scene",
    stageOrder: 10,
    title: "Beat 6 — 911 Road + 3D Title Sweep",
    summary: "Porsche_911_Road video behind a 3D-extruded title with a one-pass gloss sweep.",
    data: {
      technique: "Title3DLightSweep + VideoTransitionBackground",
      transitionIn: "Blur-zoom + light-leak combined — the single biggest transition in the video",
      assets: [
        { name: "Porsche_911_Road.mp4", type: "user_supplied" },
        { name: "Title3DLightSweep component", type: "code_drawn" },
      ],
      overlays: ["3D extrusion", "One-pass gloss sweep", "Rectangle background box"],
      sfx: "Transition swoosh + article-reveal + title-settle pop",
    },
  },
  {
    stageType: "scene",
    stageOrder: 11,
    title: "Beat 7 — 911 Track + Pixel Impact",
    summary: "911_track video with a frame-aligned pixelated twin flashing in 4 times.",
    data: {
      technique: "PixelImpactVideo",
      transitionIn: "Blur-zoom whip only (no light-leak)",
      assets: [
        { name: "911_track.mp4", type: "user_supplied" },
        { name: "911_pixel_track.mp4 (frame-aligned glitch twin)", type: "user_supplied" },
      ],
      overlays: ["2-frame pixel-glitch flash x4"],
      sfx: "Transition swoosh",
    },
  },
  {
    stageType: "scene",
    stageOrder: 12,
    title: "Beat 8 — Exterior/Interior Detail (Letterboxed)",
    summary: "Horizontal video letterboxed into 9:16 with the same clip blurred as background.",
    data: {
      technique: "LetterboxVideoWithScanlineBg",
      transitionIn: "Hard cut",
      assets: [{ name: "Porsche exterior/interior 1080p source", type: "user_supplied" }],
      overlays: ["objectFit:contain foreground", "Same clip blurred 30% opacity background", "Scanline overlay"],
      sfx: "Transition swoosh",
    },
  },
  {
    stageType: "scene",
    stageOrder: 13,
    title: "Beat 9 — Full Car Reveal (Letterboxed)",
    summary: "Same clip, different trim point — the clip's own clearest full front-on hero shot.",
    data: {
      technique: "LetterboxVideoWithScanlineBg (different trimBefore)",
      transitionIn: "Hard cut",
      assets: [{ name: "Same exterior/interior source, later trim offset", type: "user_supplied" }],
      overlays: ["Same letterbox + scanline treatment as Beat 8"],
      sfx: "Transition swoosh",
    },
  },
  {
    stageType: "scene",
    stageOrder: 14,
    title: "Beat 10 — Raw Talking Head (Closing)",
    summary: "Raw talking-head footage, untouched — the closing line delivered straight to camera.",
    data: {
      technique: "(no graphic — broll only)",
      transitionIn: "—",
      assets: [],
      overlays: [],
      sfx: "—",
    },
  },
  {
    stageType: "scene",
    stageOrder: 15,
    title: "End Frame — Closing CTA Card",
    summary: "Full-bleed desert shot + bold CTA text, no background box.",
    data: {
      technique: "EndFrameCTA",
      transitionIn: "Light-leak only",
      assets: [{ name: "End-frame desert photograph", type: "user_supplied" }],
      overlays: ["Bold CTA text, explicitly no boundary/box"],
      sfx: "Transition swoosh + text pop",
    },
  },
  {
    stageType: "assembly",
    stageOrder: 16,
    title: "Final Assembly",
    summary: "5-chunk render, ffmpeg concat, real-VO + music mix, 47.8s final output.",
    data: {
      renderPipeline:
        "Chunked (~300 frames/chunk, --concurrency=1 --timeout=300000) to work around a font-loading timeout on full-length renders, then ffmpeg -f concat to stitch",
      music: {
        track: "Porsche 911 taste-test's aligned track, looped to fill 47.8s",
        baseVolume: 0.2,
        duckTo: 0.06,
        duckedOn: "the one '911' mention in the whole transcript",
        fadeIn: "30 frames",
        fadeOut: "24 frames — deliberately short so the music stays present through nearly the whole End Frame card",
      },
      voice: { source: "reel-full broll", volume: 0.85 },
      output: { frames: 1434, fps: 30, duration: "47.8s", codec: "h264 / aac mp4" },
    },
  },
];

for (const s of navneetStages) {
  await db.insert(projectStages).values({
    id: randomUUID(),
    projectId: navneetId,
    stageType: s.stageType,
    stageOrder: s.stageOrder,
    title: s.title,
    summary: s.summary,
    dataJson: JSON.stringify(s.data),
  });
}

const navneetAssets: { name: string; assetType: "code_drawn" | "ai_generated" | "user_supplied"; usedInScenes: string; prompt?: string; sourcePath?: string }[] = [
  { name: "CardFlipGrid", assetType: "code_drawn", usedInScenes: "Beat 1, Beat 2", sourcePath: "src/components/motiondesign/CardFlipGrid.tsx" },
  { name: "MagicianCardFlourish", assetType: "code_drawn", usedInScenes: "Beat 3", sourcePath: "src/components/motiondesign/MagicianCardFlourish.tsx" },
  { name: "HudCardStack", assetType: "code_drawn", usedInScenes: "Beat 5", sourcePath: "src/components/motiondesign/HudCardStack.tsx" },
  { name: "Title3DLightSweep", assetType: "code_drawn", usedInScenes: "Beat 6", sourcePath: "src/components/motiondesign/Title3DLightSweep.tsx" },
  { name: "PixelImpactVideo", assetType: "code_drawn", usedInScenes: "Beat 7", sourcePath: "src/components/motiondesign/PixelImpactVideo.tsx" },
  { name: "LetterboxVideoWithScanlineBg", assetType: "code_drawn", usedInScenes: "Beat 8, Beat 9", sourcePath: "src/components/motiondesign/LetterboxVideoWithScanlineBg.tsx" },
  { name: "EndFrameCTA", assetType: "code_drawn", usedInScenes: "End Frame", sourcePath: "src/components/motiondesign/EndFrameCTA.tsx" },
  { name: "Porsche 911 hero card art", assetType: "ai_generated", usedInScenes: "Beat 3", prompt: "Porsche 911, cream studio background, hero product shot (see images/porsche-cream/hero-911-bg.png)" },
  { name: "Ferrari / Rolls-Royce / Tesla card art", assetType: "ai_generated", usedInScenes: "Beat 5", prompt: "Brand hero shots, generated per-brand for the HUD card stack (images/navneet-integration/beat5/)" },
  { name: "navneet-car-reel.mp4", assetType: "user_supplied", usedInScenes: "All beats (base layer)" },
  { name: "Porsche_911_Road.mp4", assetType: "user_supplied", usedInScenes: "Beat 6" },
  { name: "911_track.mp4 + 911_pixel_track.mp4", assetType: "user_supplied", usedInScenes: "Beat 7" },
  { name: "Porsche exterior/interior 1080p source", assetType: "user_supplied", usedInScenes: "Beat 8, Beat 9" },
  { name: "End-frame desert photograph", assetType: "user_supplied", usedInScenes: "End Frame" },
];

for (const a of navneetAssets) {
  await db.insert(projectAssets).values({ id: randomUUID(), projectId: navneetId, ...a });
}

console.log(`Seeded ${SEED_PROJECTS.length} projects, ${navneetStages.length} stages, ${navneetAssets.length} assets.`);
}

main(SEED_USER_ID).catch((e) => {
  console.error(e);
  process.exit(1);
});
