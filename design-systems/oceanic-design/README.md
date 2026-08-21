# Oceanic Design

A complete, approved design system for video-dashboard — light pink/lavender glassmorphic UI, every major page mocked and validated.

**To use this later:** say "let's use Oceanic Design" and point at this folder. It's implementation-ready — no redesign needed.

## Contents

- **`DESIGN-SYSTEM.md`** — start here. Full tokens (fonts, color, glass, motion), page-by-page spec, component setup instructions, and deliberately-deferred decisions.
- **`preview/all-pages.html`** — open directly in any browser (no server needed). Every page, working, with jump links: Main (Signed Out), Sign In, Sign Up, Signed-In Home, Projects, Billing, Account, Notifications.
- **`components/`** — exact source for `GlassCard`, `Button`, `Label`, `Input` (shadcn primitives) and `Floating`/`FloatingElement` + `useMousePositionRef` (the real mouse-parallax component used on the CTA). Ready to copy into `src/components/ui/` and `src/hooks/` when implementation starts.

## This is a design system, not a build

Nothing in `src/` has been touched. This folder is a safe, standalone reference — you can experiment with other design directions elsewhere without risk of losing this one.
