# Oceanic/Glass Design System + Public Site — Design Spec

Date: 2026-08-21
Status: Approved (visual direction validated via brainstorming visual companion, see mockups in `.superpowers/brainstorm/526-1787308310/content/signedout-flow-v7.html` for the closest reference — not committed, local only)

## 1. Scope

This is sub-project 1 of a larger platform redesign the user requested (see conversation history — the full brief covered public site, auth, authenticated home, and a complete project workspace with script/storyboard/beat-sheet/assets/animation/sound/export). That request was explicitly decomposed into independent sub-projects because it bundled multiple unrelated subsystems and assumed AI/backend capability (script generation, asset generation, render pipeline) that does not exist in this repo yet (confirmed via README: "no render pipeline yet," "no click-to-render button").

**In scope for this spec:**
- New visual design system (fonts, color, glassmorphism) for the **public-facing surfaces only**
- Public marketing hero (signed-out) with prompt box, video showcase, How It Works, parallax CTA
- The same hero shell reused for the **signed-in creative home**, with Latest Project + Folders replacing the video showcase (uses the *existing* `projects`/`project_stages` schema — no new data model needed for this)
- Auth pages (login/register/reset-password) restyled to match — not yet mocked in detail through the visual companion; needs a design pass during implementation following the same tokens/components established here
- New shared components: `GlassCard`, `Floating`/`FloatingElement` (parallax), plus shadcn scaffolding they depend on

**Explicitly out of scope** (later sub-projects, not started):
- `/dashboard` sub-pages (billing, account, notifications) — keep existing "Camera Report" identity for now
- The full project workspace (script editor, storyboard, beat sheet, asset collection, beat animation/Remotion, sound, export)
- New `Script`/`Storyboard`/`Beat`/`Asset`/`Animation`/`AudioTrack` data model
- `/app` routing restructure
- Real AI generation of any kind (script, storyboard, assets, animation, sound) — UI should route sensibly toward where that would live, but the pipeline itself is not built

## 2. Current State (what exists today)

- Next.js 16 App Router, Tailwind v4, TypeScript, Supabase Auth + Postgres/RLS, Drizzle (schema/migrations only)
- Existing visual identity ("Camera Report"): Big Shoulders (display) + IBM Plex Sans/Mono, lime accent, flat hairline-bordered panels, `GridBackground` component rendered once in root `layout.tsx` (applies to every route today, including `/dashboard`)
- Existing landing page (`src/app/page.tsx`, `LandingHeader`, `LandingHero`) and dashboard overview (`src/app/dashboard/page.tsx`) both already have a working prompt-bar pattern: submitting the idea routes an unauthenticated visitor to `/register?idea=...&style=...` (no generation pipeline exists yet, so this handoff is the correct/only honest behavior to preserve)
- `projects` / `project_stages` / `project_assets` tables already exist in `src/db/schema.ts` — sufficient to back "Latest Project" and "Folders" without new schema work
- Repo is **not** a shadcn project: no `components.json`, no `lib/utils.ts` (`cn` helper), missing `clsx`/`tailwind-merge`/`class-variance-authority`/`@radix-ui/react-slot`/`@radix-ui/react-label`/`motion`

## 3. Visual Direction (validated)

The original brief asked for a dark, deep-navy "oceanic" theme. After showing mockups, the user redirected to a **light** theme based on a reference screenshot: soft pastel gradient wash (pink/lavender, not blue — confirmed explicitly over the brief's "blue-dominant" instruction) fading to white, dark text, glass cards. The dark/moody treatment survives only in the **lower** sections (How It Works, CTA), not the whole page — this is the approved direction, overriding the original text brief where the two conflict.

### Fonts
- **Fustat** (600 weight) — headline ("What are we **making** today?"), ~32-34px, tight tracking (-0.01 to -0.02em)
- **Schibsted Grotesk** — nav, buttons, labels, UI chrome, step-card titles
- **Inter** — body/supporting text, subtitles, descriptions
- **Noto Sans** — reserved for dense interface text per original brief; not yet exercised in any mockup, apply where interface text density calls for it during implementation

### Color / background system
- Hero: soft diagonal radial-gradient wash — pink (`rgba(255,175,205,...)`) top-left, lavender/violet (`rgba(170,150,255,...)`) top-right, blending to near-white (`#efeaff`/`#f6f2ff`) by mid-page
- Headline keyword ("making") uses a pink→purple gradient text treatment (`linear-gradient(90deg,#c94fd6,#7c6ff0)`) — this directly matches the user's own reference screenshot, confirmed exception to any "no decorative gradient text" default
- How It Works: dark (`#08080b`) with ambient purple/pink radial glows (top **and** bottom — the bottom glow exists specifically to bridge into the CTA section, see §6)
- CTA: near-black but **not** flat `#000` (`radial-gradient(65% 40% at 50% 0%, rgba(147,51,234,0.20), transparent 60%), #030105`) — must read as a continuation of How It Works' glow, not an abrupt seam

### Glassmorphism system
Base tokens (validated against the user-supplied `GlassCard` component spec — `bg-primary-foreground/30` + `backdrop-blur-md`):
```
background: rgba(255,255,255,0.28)      /* ~30%, matches spec */
border: 1px solid rgba(255,255,255,0.5)
backdrop-filter: blur(22px)
box-shadow: inset 0 1px 0 rgba(255,255,255,0.6)   /* top highlight sells the "edge" */
```
Dark variant (How It Works step cards): `rgba(255,255,255,0.07)` bg, `rgba(255,255,255,0.12)` border, `blur(18px)`, subtle inset highlight.

**Critical learning from mockup iteration:** backdrop-blur only reads as "glass" when there is *detailed, saturated content behind the panel* to distort — over a flat/smooth gradient it just looks like a slightly-transparent solid box. Every glass surface needs a genuinely busy backdrop (bigger/more saturated gradient blobs, ambient glow) behind it, not just the blur value. This must carry into implementation: don't place glass panels over flat single-color backgrounds.

Applies to: nav, type bar, How It Works step cards, CTA buttons. The CTA's central heading/button group is **plain** (no glass card wrapper) — this matches the user's explicit "Fancy Components" reference, which has no panel around its centered text.

### Motion
- **Real** mouse-reactive parallax on the CTA floating cards, using the same math as the user-supplied `Floating`/`FloatingElement` + `useMousePositionRef` code: `strength = (depth * sensitivity) / 20`, `sensitivity = -1`, `easingFactor = 0.05`, position tracked relative to the CTA container's top-left corner, updated via `requestAnimationFrame` (not React state per frame — avoids re-render cost). In the real build this is the actual `motion` package (`useAnimationFrame`), not a hand-rolled RAF loop (that was only necessary for the static-HTML mockup).
- Scroll-triggered reveal on How It Works cards: `IntersectionObserver` (threshold 0.25) adds a `visible` class, cards fade + slide in from their alternating side.
- General UI transitions: 200-500ms, no bounce/overshoot.

## 4. Hero (shared shell — signed-out and signed-in)

One component, one visual shell, conditional content below the type bar.

**Structure (top to bottom):**
1. Glass nav — logo, `Platform / Features ↓ / Projects / Community` links, right side: `Sign Up` (ghost glass) + `Log In` (dark) when signed out, or an avatar when signed in
2. Compact headline + subtitle (kept restrained in size — the type bar and reel are the dominant visual weight, not the headline)
3. Large centered glass type bar (max-width ~700px): credits/GPT-4o row, textarea placeholder ("Paste a full script, or just describe your idea…"), bottom row (Attach/Voice pills + gradient circular submit button)
4. **Full-bleed** content directly below the type bar (breaks out of the hero's own horizontal padding via negative margins so it touches the left/right viewport edges) — ~48px gap from the type bar, not a large dead gap:
   - **Signed-out:** continuous horizontal auto-scrolling reel, **vertical 9:16 cards only** (not mixed aspect ratios), sized so ~5-6 are visible at once on a typical desktop viewport (~280×498px cards, 18px gap), real `<video>` elements (muted/loop/autoplay) with a poster-image fallback so nothing ever renders as a blank/black box, pauses on hover, edge-fade mask
   - **Signed-in:** "Latest Project" bento (large preview + progress/storyboard/assets/final-output mini-cards, matching the bento layout the user referenced) + "Folders" grid below it (existing user's projects, reusing `projects`/`project_stages` — no new schema)

**Spacing:** generous — ~90px before the headline, ~250px of bottom padding transitioning into How It Works (this number came from direct iteration with the user: started smaller, doubled, then +120px more — treat as validated, not a placeholder).

**Prompt submit behavior:** signed-out preserves the existing `/register?idea=...&style=...` handoff (matches current `LandingHero`, still correct since no generation pipeline exists). Signed-in behavior (creating an actual project) is not fully specified — the pipeline to actually process an idea doesn't exist yet; the plan should route the signed-in submit toward wherever the project record gets created today (`src/app/dashboard/projects/new/actions.ts` already exists) rather than inventing new generation behavior.

## 5. How It Works (signed-out only)

Dark section. Eyebrow label ("HOW IT WORKS") + heading ("From script to final cut") + one-line subtitle.

**Layout:** vertical zigzag timeline — alternating left/right glass-dark cards connected by a central vertical line (gradient purple→pink, `linear-gradient(180deg, #8b5cf6 0%, #c94fd6 55%, #ec4899 100%)`), with numbered glowing node circles at each card's midpoint on the line.

**Seven steps** (each card = icon-visual panel over tag/title/description text panel):
1. Script — "The script is written first — everything else follows it."
2. Storyboard — "The script becomes a shot-by-shot storyboarding plan."
3. Beat Sheet — "The storyboard becomes a beat sheet — timing for every beat."
4. Asset Library — "Every asset needed for every beat, collected in one place."
5. Per-Beat Animation — "Each beat is created one by one, beat by beat."
6. Sound — "Music, VO and SFX are mixed to the timeline."
7. Final Delivery — "Everything comes together as the final video."

Cards fade+slide in on scroll (IntersectionObserver). This mirrors the eventual project-workspace pipeline (script → storyboard → beat sheet → assets → animation → sound → final), which is useful continuity even though that workspace itself is a later sub-project.

## 6. Parallax CTA (signed-out only)

Full-bleed, tall (~100vh). Background must visually continue from How It Works' glow (not an abrupt flat-black seam — this was a real bug caught during review, not a taste preference: two adjacent near-identical flat blacks with nothing distinguishing them read as one blended void).

**Composition:** floating vertical (9:16) video cards scattered organically across the **entire** canvas edge-to-edge (not clustered in corners — matches the "Fancy Components" reference the user provided), varied sizes, real mouse-reactive parallax (see §3 Motion). A subset of floats sit closer to/behind the centered text (lower z-index, dimmed via `filter: brightness(0.6)`) for a layered depth feel — this was an explicit ask ("it's in 3D space so we can have video under the CTA as well").

**Center:** plain (no glass card) heading "Create your next project." + `Sign Up` (light glass pill) / `Log In` (dark glass pill) buttons.

## 7. Component / dependency setup

Not a shadcn project today — set up the **minimal** compatible structure rather than running the full `shadcn init` CLI (which would risk clobbering the existing Tailwind v4 config and `globals.css` CSS-variable tokens).

- Install: `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-label`, `motion`
- Add `src/lib/utils.ts` (`cn` helper — new pattern for this repo, scoped to the new `components/ui/*` only; existing components keep their current raw-template-string classnames)
- Add `components.json`
- Add `src/components/ui/glass-card.tsx`, `button.tsx`, `label.tsx`, `input.tsx`, `parallax-floating.tsx` — copied from the exact source the user supplied, adapted only where needed to fit this repo's conventions
- Add `src/hooks/use-mouse-position-ref.ts` — copied from the exact source supplied

### Video showcase data structure
```ts
interface ShowcaseVideo {
  id: string
  src: string
  poster?: string
  title?: string
  aspect: "portrait"   // 9:16 only, per this spec
}
```
Static array now (sourced as free stock cinematic clips, per earlier agreement), swappable for real rendered project output later without touching the component.

### Background/layout scoping
`GridBackground` currently renders once in root `layout.tsx`, applying to every route. To avoid changing the untouched `/dashboard` surface:
- Root `layout.tsx` becomes a thin shell (fonts + `<body>`) — no background rendering itself
- The new gradient/glass backgrounds are applied directly within the marketing page and `(auth)/layout.tsx` (per the mockups, backgrounds ended up baked per-section rather than one reusable global component — the plan should decide whether to extract a shared background component or keep per-section gradients, both are consistent with what was validated)
- `dashboard/layout.tsx` gets one added line to keep rendering `GridBackground`, preserving today's look exactly

## 8. Known open items for the implementation plan

- **Video playback never worked in the static-HTML mockup.** Root cause undiagnosed — a DOM-attachment-timing bug was found and fixed (`.play()` was being called before elements were in the DOM) but videos still didn't play after the fix, suggesting a network/CDN issue specific to the mockup's sandboxed browser environment (possibly `commondatastorage.googleapis.com` being blocked) rather than a code bug. **Do not assume the fix above is sufficient** — this needs real diagnosis (browser console/network tab) in the actual Next.js dev server, where the environment will differ. User explicitly deferred this: "let's skip the video part right now so that we can add it afterwards."
- **Auth pages (login/register/reset-password) were not mocked in the visual companion** — only described at the level of "match the same oceanic/glass system." Needs a quick design pass during implementation using the tokens/components established here, following the existing `components/auth/ui.tsx` structure.
- **Signed-in prompt submit → project creation** is not fully specified (see §4) — the actual generation pipeline doesn't exist; implementation should route toward the existing project-creation action rather than inventing new pipeline behavior.
