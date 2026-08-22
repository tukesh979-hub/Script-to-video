# Apple Design (HIG-inspired)

**Status: Draft — built solo, not yet reviewed.** Unlike Oceanic Design, this was built in one pass without live back-and-forth (the user was away and gave full authority to proceed). Treat it as a strong, complete starting point, not a fully validated final direction — walk through `preview/all-pages.html` before implementing and flag anything that should change.

Built: 2026-08-22

## What this is

A complete alternative design system for video-dashboard, inspired by Apple's Human Interface Guidelines: SF Pro / system-font typography, semantic system colors, Liquid Glass translucent material, an 8pt spacing grid, and 44pt minimum tap targets. Covers the same page set as [Oceanic Design](../oceanic-design/DESIGN-SYSTEM.md) for direct comparison: Main (signed out), Sign In, Sign Up, Signed-In Home, Projects, Billing, Account, Notifications.

Source references the user provided: [Apple Human Interface Guidelines](https://developer.apple.com/design/), a [community iOS design system Figma file](https://www.figma.com/community/file/1071144450608398448/ios-design-system), and a token brief (reproduced below).

## How to use this

There are **two variants** — light and dark. They are not just a color swap of each other; the dark variant reframes the composition (see below).

1. `preview/all-pages.html` — the original **light** variant, reviewed above.
2. `preview/all-pages-dark.html` — a **dark** variant, built after feedback that the light version's glassmorphism read too subtle and asked for a properly dark, more distinctly-composed take. Open either directly in a browser — jump links at top.
3. This is real system-font rendering, not a web-font approximation: on macOS/iOS it renders actual SF Pro via `-apple-system`/`BlinkMacSystemFont`; on other platforms it falls back to Inter/Helvetica/Arial, which is the correct, intended behavior (Apple doesn't license SF Pro for web embedding — designing "to the system font" is itself the HIG-correct approach, not a compromise).
4. No component source folder this round — unlike Oceanic, the user didn't supply specific React component code for this system, so there's nothing pre-built to copy in. Implementation would build these as new components from the CSS recipes below.

### Dark variant — what's different and why

Requested explicitly as a reframe, not a reskin: darker background, stronger/more visible glassmorphism, no square corners, and freedom to depart from both Oceanic's and the light Apple variant's page composition.

- **Background**: true black (`#000`) with large, vivid, colorful ambient blooms (systemBlue/systemPurple/systemPink at dark-mode saturation) positioned behind every glass surface — this is what makes the blur actually *read* as glass; the light variant's flatter background was the direct cause of the "where's the glassmorphism" feedback.
- **Glass recipe strengthened**: `blur(42-46px) saturate(200-220%)` (up from 30px/180%), plus a bright top-edge inset highlight (`inset 0 1.5px 0 rgba(255,255,255,0.28)`) to sell the "light catching a glass edge" look Liquid Glass is known for.
- **Corners**: every surface uses a large continuous radius (22–28px on cards/tiles, full 999px pill on every button/nav/dock element) — nothing square anywhere in the system.
- **Composition reframed, not copied from Oceanic or the light variant**:
  - Nav is a small centered floating pill ("Dynamic Island"-style), not a full-width bar
  - Signed-in home and How It Works are **bento grids** (asymmetric tile spans) instead of a linear hero-then-section stack or a connector-line list
  - The dashboard sidebar became a **floating vertical dock**, detached from the screen edge with margin on all sides, rather than an edge-anchored panel
  - CTA floats are fewer (4) and larger, glass-framed with a visible rim highlight, rather than many small scattered thumbnails
- Same underlying interaction logic as the light variant and Oceanic Design (real mouse-parallax on CTA floats, DOM-attach-before-play video fix, IntersectionObserver scroll reveals) — only the visual language and layout changed.

## Where this deliberately diverges from Oceanic Design's composition

Given the same page set, three choices were changed rather than copied, because they'd contradict Apple's actual design language:

- **Video reel is user-driven horizontal scroll (`scroll-snap-type: x proximity`), not an auto-scrolling marquee.** This matches Apple's real product pages (App Store "Today" rows, Music) — content moves when the user moves it, not on its own.
- **How It Works is an editorial vertical list** (icon, step number, title, description, hairline dividers), not a connected neon-gradient timeline. Apple's own "how it works"-style pages (e.g. product feature walkthroughs) use exactly this restrained pattern — Clarity and Deference over decoration.
- **The CTA backdrop is restrained** — five large, softly parallaxing video panels on a deep near-black background with a subtle blue/cyan glow, not a dozen scattered thumbnails. Depth is still present (the parallax motion), but it doesn't compete with the centered message.

---

## 1. Design Tokens

### Typography
System font stack (renders real SF Pro on Apple devices):
```css
--sf: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Inter', 'Helvetica Neue', Arial, sans-serif;
--mono: ui-monospace, 'SF Mono', Menlo, monospace;
```
Scale (iOS Large size reference — rescales with Dynamic Type on real Apple platforms, fixed here for web):
| Role | Size | Weight |
|---|---|---|
| Large Title | 34px | 700 |
| Title 1 | 28px | 700 |
| Title 2 | 22px | 700 |
| Title 3 | 20px | 600 |
| Headline | 17px | 600 |
| Body | 17px | 400 |
| Callout | 16px | 400 |
| Subhead | 15px | 400 (secondary color) |
| Footnote | 13px | 400 (secondary color) |
| Caption 1 | 12px | 500 (secondary color) |
| Caption 2 | 11px | 500 (tertiary color) |

17px body is the legibility floor — never go smaller for primary reading content.

### Color — semantic roles, not fixed hex
Apple ships **adaptive** system colors; the hex values below are community-measured approximations for the light-mode build here. A real dark-mode pass would swap these, not hardcode different hex — design to the role name.
```css
--blue: #007AFF;      /* systemBlue — single primary accent everywhere */
--green: #34C759;     /* systemGreen — success/positive */
--orange: #FF9500;    /* systemOrange — needs-attention */
--red: #FF3B30;       /* systemRed — destructive/negative */
--label: #000000;               /* primary text */
--label2: rgba(60,60,67,0.6);   /* secondary text — real Apple uses opacity-over-black, not flat gray */
--label3: rgba(60,60,67,0.32);  /* tertiary text */
--bg: #FFFFFF;         /* systemBackground */
--bg2: #F2F2F7;         /* systemGray6 — grouped/secondary surfaces */
--gray1..5: #8E8E93, #AEAEB2, #C7C7CC, #D1D1D6, #E5E5EA;
--sep: rgba(60,60,67,0.13);   /* hairline separator, 0.5px */
```
Only one accent color is used throughout — systemBlue. Don't introduce a second brand color; Apple's palette discipline is part of Clarity.

### Liquid Glass material
```css
.glass {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(30px) saturate(180%);
  border: 0.5px solid rgba(0,0,0,0.08);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05);
}
```
Dark variant (`.glass-dark`) for surfaces over dark backgrounds (CTA buttons) swaps to a translucent dark base with a light border. Note the **0.5px** hairline borders throughout — this is deliberate, not a rounding artifact; Apple's chrome uses sub-pixel hairlines, not 1px+ borders, to stay recessive (Deference).

`saturate(180%)` alongside the blur is what gives Liquid Glass its characteristic vividness — content behind the glass reads more saturated through it, not washed out. Don't drop the saturate() "for simplicity."

### Layout
- **8pt spacing grid** (8/16/24/32/40/48px) — convention, not an Apple-enforced rule, but followed consistently throughout every page
- **44×44pt minimum tap target** on every interactive element (buttons, nav rows, sidebar items) — this IS an explicit HIG rule, not a convention. Every `.btn` and `.navitem` in the CSS is built to this floor.
- Continuous-corner ("squircle"-adjacent) rounding: 20px on cards, 999px (full pill) on buttons/badges/pills

### Iconography
No real SF Symbols (proprietary, not licensed for this use) — a small hand-built monoline icon set matching the aesthetic: 24×24 viewBox, `stroke="currentColor"`, 1.5–1.6px stroke width, round caps/joins, no fill except where Apple itself uses filled glyphs (play, send). Icons inherit text color so they always match surrounding type weight, per HIG guidance ("icons that match the type weight").

### Motion
Same real mouse-parallax technique as Oceanic Design (ported from the user-supplied `Floating`/`FloatingElement` math) — kept because it's a genuine, well-implemented interaction, not because Apple specifically prescribes it. Reduced to 5 elements (vs. Oceanic's 17) to stay restrained. How It Works steps fade+slide in on scroll via IntersectionObserver, matching Apple's typical "reveal as you scroll" product-page pattern.

---

## 2. Principles (from the brief, applied throughout)

- **Clarity** — 17px legibility floor, one accent color, high-contrast text-on-glass, no decorative gradient text on headlines (content carries interest, not typography effects)
- **Deference** — 0.5px hairlines instead of heavy borders, glass recedes rather than competing with content behind it, restrained CTA composition
- **Depth** — glass layering (nav floats over hero content), real parallax motion on the CTA, `saturate()` giving glass surfaces genuine dimensionality rather than flat transparency

## 3. Known Gaps

- **Neither variant has been reviewed by the user yet** — both the light and dark variants were built solo under full delegated authority while the user was away. Expect a revision round once they look at it, the same way Oceanic Design went through several rounds.
- **The dark variant is not a token-swapped copy of the light one** — it reframes composition (bento grids, floating dock/pill-nav) per explicit instruction. If the user ends up preferring the light variant's layout with dark colors, that's a different, not-yet-built request — don't assume the dark file already covers it.
- **"Pointed corners" interpretation flagged for confirmation.** The user asked to "keep the corners pointed, not square" — interpreted here as "rounded/continuous, never sharp square corners" (consistent with every other Apple-design instruction in the same message, and with HIG's actual corner-rounding convention), not literally sharp/angular corners. If this reading is wrong, the fix is a one-line radius change, not a rebuild — flag it back if so.
- **Same scope boundary as Oceanic Design** — UI/visual layer only. No new data model, no `/app` routing, no project-workspace pages. See Oceanic Design's "Known Gaps" section for the full list; it applies equally here.
- **Video playback**: same `commondatastorage.googleapis.com` sample clips as Oceanic Design, same DOM-attach-before-play fix applied preemptively (learned from that review) — but whether it actually plays in a real browser is still unconfirmed, same open question as Oceanic Design's unresolved video bug.
