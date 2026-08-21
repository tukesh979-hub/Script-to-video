# Oceanic Design

**Status: Approved.** This is a validated, ready-to-implement design system for the video-dashboard product — not a work-in-progress. When asked to "use Oceanic Design," implement directly from this document and `preview/all-pages.html`; do not re-derive or re-negotiate the direction.

Last updated: 2026-08-21

## What this is

A complete visual design system (fonts, color, glassmorphism, motion) plus every major page of the app, validated through iterative review with the user via a static HTML mockup (`preview/all-pages.html` — open it directly in any browser, no server needed). It supersedes the earlier, narrower spec at `docs/superpowers/specs/2026-08-21-oceanic-glass-public-site-design.md` (hero/How-It-Works/CTA only) — this document covers the full page set.

**Name note:** "Oceanic" is the retained working name from the original brief (which asked for a deep-navy ocean theme). The validated direction pivoted to a light pink/lavender palette after the user provided a reference screenshot — the name stuck, the palette changed. Don't let the name mislead a future implementer into building a dark blue theme.

## How to use this

1. Open `preview/all-pages.html` in a browser — it's the single source of visual truth. Every page below has a jump link at the top.
2. Read the token values below before writing any CSS — don't eyeball them off a screenshot.
3. Component source in `components/` is exact, ready to copy into `src/components/ui/` and `src/hooks/` (see Component Setup).
4. Read "Known Gaps & Deferred Decisions" before starting — some things are deliberately unresolved.

---

## 1. Design Tokens

### Fonts (Google Fonts)
- **Fustat** (weight 600–700) — all page headings ("What are we making today?", "From script to final cut", page titles like "All Projects")
- **Schibsted Grotesk** (weight 500–700) — all UI chrome: nav links, buttons, pills, labels, sidebar nav items, card titles, form labels
- **Inter** (weight 400–500) — body copy, subtitles, descriptions, form input text
- Noto Sans reserved for dense interface text per original brief — not yet exercised in any page; apply if/when a page needs it during implementation

### Color system
Two registers, used deliberately by section:

**Light register** (everything except How It Works / CTA):
```
Hero/page background wash:
  radial-gradient(55% 42% at 12% -4%, rgba(255,175,205,0.75), transparent 60%),
  radial-gradient(48% 38% at 88% -2%, rgba(170,150,255,0.65), transparent 60%),
  linear-gradient(180deg, #fdeef5 0%, #f6f2ff 55%, #efeaff 100%)

Text: #16181d (primary), rgba(20,23,28,0.4–0.65) (secondary/muted)
Accent gradient (headline keyword, primary buttons, progress bars, submit buttons):
  linear-gradient(90deg, #c94fd6, #7c6ff0)
```

**Dark register** (How It Works, Parallax CTA only — these two sections are deliberately dark, everything else is light):
```
How It Works background: linear-gradient(180deg, #08080b 0%, #08080b 70%, #050308 100%)
  + ambient radial glows (purple/pink, top AND bottom — bottom glow exists specifically
    to bridge into the CTA section, don't drop it)
CTA background: radial-gradient(65% 40% at 50% 0%, rgba(147,51,234,0.20), transparent 60%), #030105
  (NOT flat #000 — two adjacent flat blacks read as one blended void, this was a real bug
   caught during review, not a taste call)
Timeline line: linear-gradient(180deg, #8b5cf6 0%, #c94fd6 55%, #ec4899 100%)
```

**Gradient text is an approved exception**, not a default to avoid — the user's own reference screenshot shows the headline keyword rendered exactly this way. Use it only for: the headline accent word, and nowhere else unless it matches a specific approved reference.

### Glassmorphism
Matches the user-supplied `GlassCard` component spec (`bg-primary-foreground/30` + `backdrop-blur-md`), tuned:
```css
/* Light glass (primary — nav, type bar, cards, sidebar, buttons on light backgrounds) */
.glass {
  background: rgba(255,255,255,0.28–0.32);
  border: 1px solid rgba(255,255,255,0.5–0.55);
  backdrop-filter: blur(20–22px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);  /* top highlight sells the edge */
}

/* Stronger variant for auth cards (needs more opacity for text legibility over busier bg) */
.glass-strong {
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.65);
  backdrop-filter: blur(24px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 30px 70px rgba(60,30,90,0.12);
}

/* Dark glass (How It Works step cards, on the dark register) */
.glass-dark {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}
```

**Critical rule, learned the hard way through review:** backdrop-blur only reads as "glass" when there's *detailed, saturated content behind the panel* to distort. Over a flat/smooth gradient it just looks like a slightly-transparent solid box — this was flagged directly by the user ("why doesn't it look glassy") and traced to insufficiently busy backgrounds. **Every glass surface needs a genuinely rich backdrop** — the saturated multi-stop gradient blobs and ambient glows defined above exist specifically for this reason. Don't simplify them to a flat color "for performance" or "for simplicity" — it breaks the entire visual language.

The CTA's central heading/button group is deliberately **not** wrapped in glass — matches the user's "Fancy Components" reference, which has plain text over the scattered images, no card.

### Motion
- **CTA parallax is real mouse-tracking, not decorative.** Math ported directly from the user-supplied `Floating`/`FloatingElement` + `useMousePositionRef`: `strength = (depth * sensitivity) / 20`, `sensitivity = -1`, `easingFactor = 0.05`, position tracked relative to the CTA container's top-left corner, applied via `translate3d` inside `requestAnimationFrame` (not React state per frame — avoids re-render cost on every mouse move). In the real Next.js build, use the actual `motion` package's `useAnimationFrame` (see `components/parallax-floating.tsx`) — the mockup's vanilla-JS RAF loop was only necessary because static HTML has no React.
- **How It Works cards reveal on scroll** — `IntersectionObserver` (threshold 0.25) adds a `visible` class per card, alternating slide direction matching left/right timeline position, 0.7s ease.
- General UI transitions: 200–500ms, no bounce/overshoot, no excessive scaling.

---

## 2. Page Inventory

Every page below is in `preview/all-pages.html`, anchored by id (`#main-logout`, `#signin`, etc.). Structure/copy/composition are all validated — implement as shown, not as a starting point for further redesign.

### Main — Signed Out (`#main-logout`)
The public marketing home. One hero shell shared conceptually with the signed-in home (see below) — same nav/headline/type-bar structure, different content below the fold.
- Glass nav: logo, `Platform / Features ↓ / Projects / Community`, `Sign Up` (ghost) / `Log In` (dark) buttons
- Compact headline ("What are we **making** today?", gradient accent word) + one-line subtitle
- Large centered glass type bar (max-width 700px): credits/GPT-4o row, textarea placeholder, Attach/Voice pills + gradient submit button
- **Full-bleed** (breaks hero's own padding via negative margins, touches viewport edges) continuous auto-scrolling video reel directly below the type bar (~48px gap, not a large dead gap) — **vertical 9:16 cards only**, ~280×498px sized so ~5–6 are visible at once on a normal desktop width, real `<video>` (muted/loop/autoplay) with a poster-image fallback so nothing ever renders as a blank box, pauses on hover
- Hero padding: ~90px above headline, ~250px below transitioning into How It Works (validated through direct iteration — don't shrink this back down)
- **How It Works** (dark register): eyebrow + "From script to final cut" heading + subtitle, then a vertical zigzag timeline — alternating left/right glass-dark cards connected by a central gradient line with glowing numbered nodes, cards fade+slide in on scroll. Seven steps: Script → Storyboard → Beat Sheet → Asset Library → Per-Beat Animation → Sound → Final Delivery (mirrors the eventual project-workspace pipeline)
- **Parallax CTA** (dark register, ~100vh): floating vertical video cards scattered organically across the *entire* canvas edge-to-edge (not corner-clustered), real mouse parallax, a subset positioned close to/behind the centered text (lower z-index, dimmed) for a layered 3D feel. Plain centered heading "Create your next project." + Sign Up/Log In buttons, no glass panel around the text itself

### Sign In / Sign Up (`#signin`, `#signup`)
Light glass card (`.glass-strong`) centered on the same light gradient wash, subtle low-opacity floating photo fragments (decorative, not interactive), Google OAuth button, divider, form fields. Mirrors the existing `components/auth/ui.tsx` structure (email/password + Google + forgot-password link) — restyled only, no new form logic.

### Signed-In Home (`#signedin-home`)
Same hero shell as signed-out (nav/headline/type-bar), but:
- Nav swaps `Sign Up`/`Log In` for a credits pill + avatar
- Headline: "What do we **create** today?"
- Below the type bar: **Latest Project bento** (large preview + Script/Storyboard/Assets/Final Output mini-cards, progress bar, "Watch progress" CTA) + **Folders grid** (project cards with shipped/in-progress badges) — replaces the video scroll entirely
- No How It Works / no Parallax CTA — those are signed-out only
- Backed by the **existing** `projects`/`project_stages` schema — no new data model needed for this page

### Dashboard shell pages — Projects / Billing / Account / Notifications (`#projects`, `#billing`, `#account`, `#notifications`)
A distinct layout from the hero pages: glass sidebar + content area. **Each is its own page/route with its own sidebar instance** — do not stack multiple pages' content under one shared sidebar (this caused a visible layout bug during review: the sidebar stretched to match combined content height, leaving dead space).

Sidebar nav (per original brief, unchanged): `Create / Projects / Assets / Storyboards / Beat Sheets / Animations / Sound / Exports`, divider, `Templates / Community`, divider, `Settings / Profile`, footer with avatar + credits.

- **Projects**: filter pills (All/In progress/Completed), "+ New Project" button, 3-column card grid (thumbnail, status badge, title, meta, progress bar)
- **Billing**: credit balance card (big number + "Buy more credits") + recent-activity ledger (render charges/refunds/signup grant, dated, +/− styled)
- **Account**: two-column settings cards (Profile: name/email/joined date; Security: password/Google connection/sessions)
- **Notifications**: list of glass notification items with unread dot, title, relative timestamp

---

## 3. Component Setup (for implementation)

The repo is **not currently a shadcn project** — no `components.json`, no `src/lib/utils.ts` (`cn` helper), missing `clsx`/`tailwind-merge`/`class-variance-authority`/`@radix-ui/react-slot`/`@radix-ui/react-label`/`motion`.

Set up the **minimal compatible structure**, not the full `shadcn init` CLI (which risks clobbering the existing Tailwind v4 config and `globals.css` CSS-variable tokens used by the current "Camera Report" identity on untouched routes like `/dashboard`):

1. Install: `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-label`, `motion`
2. Add `src/lib/utils.ts` with a standard `cn()` helper (`clsx` + `tailwind-merge`) — new pattern for this repo, scope it to the new `components/ui/*` only; don't retrofit existing components
3. Add `components.json`
4. Copy `components/*.tsx` and `components/use-mouse-position-ref.ts` from this folder into `src/components/ui/` and `src/hooks/` respectively — they're exact, unmodified source, ready to use as-is
5. Video showcase data structure (for the reel):
   ```ts
   interface ShowcaseVideo {
     id: string
     src: string
     poster?: string
     title?: string
     aspect: "portrait"   // 9:16 only
   }
   ```
   Static array now (free stock cinematic clips), swappable for real rendered project output later without touching the component.

### Layout/background scoping (don't break the untouched dashboard)
`GridBackground` currently renders once in root `layout.tsx`, applying to *every* route including today's unchanged `/dashboard`. To implement Oceanic Design without breaking that:
- Root `layout.tsx` becomes a thin shell (fonts + `<body>`) — stop rendering `GridBackground` there
- Apply the new gradient backgrounds directly within the marketing page and `(auth)/layout.tsx` (the mockup baked backgrounds per-section rather than one global component — fine to keep that way, or extract a shared `<OceanicBackground>` if it reduces duplication; both are consistent with what was validated)
- `dashboard/layout.tsx` gets one added line to keep rendering `GridBackground` — today's dashboard should be pixel-identical after this change, since it's out of scope for this design system

---

## 4. Known Gaps & Deferred Decisions

Don't silently "fix" these during implementation without flagging it — they were deliberately left open.

- **Video playback never worked in the static-HTML mockup.** A real bug was found and fixed (`.play()` was being called before elements were attached to the DOM, which browsers handle unreliably) — but videos still didn't play after that fix, suggesting a network/CDN issue specific to the mockup's sandboxed browser environment (`commondatastorage.googleapis.com` possibly blocked) rather than a remaining code bug. **Do not assume the DOM-timing fix is sufficient** — diagnose fresh with real browser devtools in the actual Next.js dev server, where the environment differs. The user explicitly deferred this ("let's skip the video part right now").
- **Signed-in prompt submit → project creation** is not fully specified. The actual generation pipeline doesn't exist in this repo yet (confirmed via README: no render pipeline, no script→EDL generation). Signed-out submit correctly reuses the existing `/register?idea=...&style=...` handoff. Signed-in submit should route toward the existing project-creation action (`src/app/dashboard/projects/new/actions.ts`) rather than inventing new pipeline behavior.
- **This design system covers UI/visual layer only.** It does not include: the new `Script`/`Storyboard`/`Beat`/`Asset`/`Animation`/`AudioTrack` data model, the `/app` routing restructure, or any part of the actual project workspace (script editor, storyboard, beat sheet, asset collection, beat animation/Remotion, sound, export) — those were explicitly decomposed out as separate, much larger sub-projects when the original mega-request was scoped down. Building against Oceanic Design does not imply those are ready to build too.
- **Templates and Community** sidebar items have no page mockup — they exist in the nav per the original brief but weren't designed. Treat as out of scope until requested.
