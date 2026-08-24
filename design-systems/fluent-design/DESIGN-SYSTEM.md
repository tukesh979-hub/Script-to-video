# Fluent Design (Microsoft Fluent 2)

**Status: Draft — built solo, not yet reviewed.** Same footing as the initial Apple Design pass: built in one sitting under full delegated authority, not iterated on live. Walk through `preview/all-pages.html` before implementing.

Built: 2026-08-24

## What this is

A third alternative design system for video-dashboard, this time based on Microsoft's Fluent 2 design language — Segoe UI Variable typography, tight 4–8px corner radius, dual-layer elevation shadows, and Fluent's three distinct materials (Card, Acrylic, Mica). Covers the same page set as [Oceanic Design](../oceanic-design/) and [Apple Design](../apple-design/) for direct comparison: Main (signed out), Sign In, Sign Up, Signed-In Home, Projects, Billing, Account, Notifications.

## Research grounding — what's confirmed vs. inferred

The user asked to "read both websites completely" (`developer.microsoft.com/fluentui` and `microsoft.design`) before designing. Both are JS-rendered SPAs that don't expose much to a plain fetch on their homepages. What actually got sourced:

**Confirmed from live sources** (exact values, not approximations):
- Typography type ramp — fetched from `fluent2.microsoft.design/typography`
- Color token *naming convention* (not exact hex) — fetched from `fluent2.microsoft.design/color`
- Spacing scale, corner radius scale, motion durations and easing curves — fetched directly from the **Fluent UI GitHub source** (`microsoft/fluentui`, `packages/tokens/src/global/*.ts`), which is more reliable than the marketing site for exact production values

**Documented Fluent 2 knowledge, not fetched this session** (no working page found for these): the five design pillars, Acrylic/Mica material behavior, exact brand-color hex values, the elevation shadow token file, Fluent System Icons' visual characteristics, and the Reveal hover effect. These are accurate to Fluent 2 as documented elsewhere, just not re-verified against a live page in this pass — worth a spot-check if pixel-perfect fidelity to the current site matters later.

## How to use this

1. Open `preview/all-pages.html` in a browser — jump links at top.
2. This uses the real `Segoe UI Variable Text` / `Segoe UI` font stack — renders correctly on Windows; falls back to `-apple-system`/`system-ui` elsewhere, which is the expected degradation (Segoe UI Variable isn't available outside Windows).
3. No component source folder — same as Apple Design, no user-supplied React code for this system.

## Where this deliberately differs from Oceanic Design and Apple Design

This is the most different of the three systems so far — Fluent's actual visual language contradicts both prior systems in several concrete ways, not just palette:

- **Buttons are NOT pills.** Both Oceanic and Apple Design used full-round pill buttons throughout. Real Fluent buttons use a 4px (Medium) or 6px (Large) radius — a small rounded rectangle, never a stadium shape. Pill/circular shapes in this system are reserved for things that are genuinely circular by function: avatars, status dots, badges/chips, icon-only buttons.
- **Elevation is a dual-layer shadow, not a glow or a single soft blur.** Every `card`/`acrylic` surface uses Fluent's real shadow tokens (`shadow4`, `shadow8`, `shadow16` — each a tight "key" shadow plus a softer "ambient" one), which reads as sharper and more "material" than Apple Design's soft `0 10px 30px` glass shadow or Oceanic's colored glow shadows.
- **Three distinct materials, not one "glass" class.** Oceanic and Apple both used a single `.glass` recipe everywhere. Fluent genuinely distinguishes:
  - **Card** — flat white, 1px neutral-stroke border, `shadow4` — the default surface for almost all content (project cards, list rows, form panels)
  - **Acrylic** — translucent, `blur(30px)`, plus a **noise texture overlay** (a real, distinguishing detail — Acrylic isn't just blur, it has grain) — used only for transient/floating surfaces: the hero type bar, the auth card
  - **Mica** — flat, subtly gray-tinted, no blur at all — used for persistent chrome: the command bar, the nav rail. This is a deliberately calmer, cheaper-feeling material than either Oceanic's animated gradient washes or Apple's Liquid Glass, and that flatness is correct, not a corner cut.
- **Headings are Semibold, never Bold.** Fluent's entire type ramp (Caption2 through Display) uses weight 400 or 600 — there's no 700 in the system. This is a real, confirmed signature (from the fetched type-ramp page) that's easy to get wrong by defaulting to bold headlines like the other two systems do.
- **No decorative gradient text anywhere.** Consistent with Apple Design's restraint, but here it's doubly true — Fluent's brand identity is calm and functional (the "Light" pillar is about illumination and clarity, not chromatic effects).
- **The CTA is a calm brand-tint wash, not a dark/neon scene.** Both Oceanic's parallax-photo CTA and Apple's black-with-color-blooms CTA are moody/dramatic. Fluent's marketing surfaces (and Microsoft 365's own feature pages) use a light, brand-blue-tinted section — no black backgrounds, no floating video panels, no parallax. This is the most visually restrained CTA of the three systems, deliberately.
- **Nav is edge-anchored and flat (Mica), not a floating pill or a detached dock.** Apple Design's dark variant used a floating "Dynamic Island" pill nav and a detached floating dock sidebar. Fluent's actual product surfaces (Teams, Outlook, Windows Explorer) anchor navigation flush to the window edge with a thin 1px stroke, no margin, no shadow-lift — that's what's built here, both for the top command bar and the left nav rail on dashboard pages.
- **Video reel stays user-driven scroll** (`scroll-snap-type`), same restraint as Apple Design, for the same reason: none of these three systems' real-world references use an auto-marquee.
- **Reveal effect**, implemented as a lightweight approximation: a radial-gradient spotlight tracks the cursor within the nav rail and softly highlights only the item under the pointer (see the `.navgroup` mousemove handler in the HTML). This is Fluent's most recognizable signature interaction and was worth including even as an approximation — omitting it would make this feel like a reskin rather than an authentic Fluent build.

## 1. Design Tokens

### Typography (confirmed exact — fetched from fluent2.microsoft.design/typography)
```css
--font: 'Segoe UI Variable Text', 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```
| Role | Size/Line-height | Weight |
|---|---|---|
| Display | 68/92 (used at 56px here for practical hero fit — see note below) | 600 |
| Large Title | 40/52 | 600 |
| Title 1 | 32/40 | 600 |
| Title 2 | 28/36 | 600 |
| Title 3 | 24/32 | 600 |
| Subtitle 1 | 20/26 | 600 |
| Subtitle 2 | 16/22 | 600 |
| Body 1 | 14/20 | 400 |
| Body 1 Strong | 14/20 | 600 |
| Caption 1 | 12/16 | 400 (secondary color) |
| Caption 1 Strong | 12/16 | 600 (secondary color) |
| Caption 2 | 10/14 | 400 (tertiary color) |

**Note on Display size:** the confirmed spec is 68px/92 line-height — used here at 56px for the marketing hero instead, since 68px felt disproportionate against this page's actual copy length. Bump it back to 68px if a punchier hero is wanted; the rest of the ramp is used at spec.

### Color (naming convention confirmed; hex values are standard Fluent 2 reference values, not re-verified against current source this session)
```css
--brand: #0F6CBD; --brand-hover: #115EA3; --brand-pressed: #0C3B5E;
--brand-tint1: #EBF3FC; --brand-tint2: #E0EDFA; --brand-tint3: #C7E0F4;
--nf1: #242424; /* neutral foreground 1 — primary text */
--nf2: #424242; /* secondary text */
--nf3: #616161; /* tertiary text */
--nb1: #FFFFFF; /* neutral background 1 — page/card surface */
--nb2: #FAFAFA; --nb3: #F5F5F5; --nb4: #F0F0F0;
--stroke1: #D1D1D1; --stroke2: #E0E0E0; --stroke3: #EDEBE9;
--success: #0E7A0D; --danger: #C4314B; --warning: #9D5D00;
```
Single brand accent throughout — no second brand color, matching Fluent's palette discipline.

### Spacing (confirmed exact — Fluent UI GitHub `spacings.ts`)
`2 / 4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32px` — note this is axis-independent (`spacingHorizontal*`/`spacingVertical*` are exported separately with identical values), not a single universal multiplier grid like the 8pt convention used in Apple Design.

### Corner radius (confirmed exact — Fluent UI GitHub `borderRadius.ts`)
`0 / 2 / 4 / 6 / 8 / 12 / 16 / 24 / 32 / 40px`, plus `Circular: 10000px` for anything round-by-function. Component default is **Medium (4px)**; Large (6px) and XLarge (8px) cover most cards/panels. This system uses 4–8px on nearly everything rectangular.

### Elevation (documented Fluent shadow tokens, not re-fetched this session)
```css
--shadow4:  0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14);
--shadow8:  0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14);
--shadow16: 0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14);
--shadow28: 0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14);
```
Dual-layer: a tight "key" shadow plus a softer "ambient" shadow, always together — don't simplify to a single shadow, that's what makes it read as Fluent rather than generic.

### Motion (confirmed exact — Fluent UI GitHub `curves.ts` + `durations.ts`)
```css
--dur-fast: 150ms; --dur-normal: 200ms; --dur-slow: 300ms;
--curve-easy: cubic-bezier(.33,0,.67,1);    /* general default */
--curve-decel: cubic-bezier(.1,.9,.2,1);    /* entrances */
```
Fast and snappy by default (150–250ms typical) — noticeably quicker than Apple Design's 200–500ms range.

### Materials
```css
/* Card — default content surface */
.card { background:#fff; border:1px solid var(--stroke2); border-radius:8px; box-shadow:var(--shadow4); }

/* Acrylic — transient surfaces: blur + tint + noise texture */
.acrylic {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.7);
  /* + an SVG feTurbulence noise overlay at ~4.5% opacity, mix-blend-mode: multiply — see .acrylic::after in the HTML */
}

/* Mica — persistent chrome: flat, tinted, no blur */
.mica { background: linear-gradient(180deg, #FBFBFB, #F6F6F6); border-color: var(--stroke2); }
```

## 2. Page Inventory

Same eight pages as the other two systems (see `preview/all-pages.html`, anchored by id). Structural differences from Oceanic/Apple worth calling out per page:

- **Main (Signed Out)**: flat Mica command bar (not floating), Display-adjacent hero headline, Acrylic type bar with noise texture, Card-based video reel with Reveal-style hover (border shifts to brand blue + shadow lifts on hover), a clean 4-column feature-card grid for How It Works (not a bento grid or timeline), and a calm brand-tint CTA (not dark/neon).
- **Sign In / Sign Up**: Acrylic flyout-style card, Fluent form fields (32px height, 4px radius, 1px brand-blue focus ring — not a glow).
- **Signed-In Home**: same command bar with a credit badge (pill, correctly — badges ARE circular in Fluent) + avatar, Latest Project and Folders as Cards in a bento-ish grid (kept from the prior systems since it's a genuinely good layout, just re-materialized as Cards instead of glass tiles).
- **Projects / Billing / Account / Notifications**: persistent, edge-anchored Mica nav rail (240px, flush left, 1px right border, no margin/float) with Reveal hover, page command bar per section, Card-grid or Card-list content matching Fluent's real list/table conventions (thin row dividers, right-aligned values, colored pos/neg amounts).

## 3. Known Gaps

- **Not yet reviewed by the user.**
- **Dark theme not built** — only light. Fluent's dark-mode shift isn't a simple invert (shared-palette colors change saturation, not just lightness, per the fetched color page) — a real dark pass would need its own token research, not just flipped hex.
- **Reveal effect is a simplified approximation**, not the real Fluent implementation (which uses a more sophisticated multi-element light-tracking system) — good enough to demonstrate the pillar, not production-accurate.
- **Exact brand/neutral hex values weren't re-verified against current Fluent 2 source** this session (see grounding note above) — they're standard, widely-documented Fluent 2 reference values, but worth a spot-check against `packages/tokens/src/global/colors.ts` if pixel-perfect brand-color accuracy matters.
- **Same scope boundary as the other two systems** — UI/visual layer only, no new data model, no `/app` routing, no project-workspace pages.
- **Video playback**: same unresolved `commondatastorage.googleapis.com` question as Oceanic/Apple Design — DOM-attach-before-play fix applied preemptively, actual playback in a real browser still unconfirmed.
