import Link from "next/link";
import Floating, { FloatingElement } from "@/components/ui/parallax-floating";
import { SHOWCASE_VIDEOS } from "@/lib/showcase-videos";

// [top%, left%, width px, height px] -- scattered organically edge-to-edge
// across the whole canvas, per DESIGN-SYSTEM.md §2 (not corner-clustered).
// Copied from the validated mockup's ringPositions/nearPositions.
const FRONT_POSITIONS: [number, number, number, number][] = [
  [3, 3, 175, 311],
  [2, 24, 145, 258],
  [4, 90, 170, 302],
  [35, 1, 155, 275],
  [38, 82, 160, 284],
  [62, 2, 150, 267],
  [60, 84, 165, 293],
  [74, 20, 140, 249],
  [72, 45, 175, 311],
  [76, 68, 150, 267],
  [73, 90, 140, 249],
];
const BEHIND_POSITIONS: [number, number, number, number][] = [
  [30, 32, 110, 196],
  [26, 60, 100, 178],
  [58, 30, 105, 187],
  [56, 62, 100, 178],
  [44, 15, 95, 169],
  [46, 80, 95, 169],
];

function FloatCard({
  pos,
  clipIndex,
  behind,
  depthSeed,
}: {
  pos: [number, number, number, number];
  clipIndex: number;
  behind: boolean;
  depthSeed: number;
}) {
  const [top, left, w, h] = pos;
  const clip = SHOWCASE_VIDEOS[clipIndex % SHOWCASE_VIDEOS.length];
  // Tailwind can't generate CSS for class names assembled from JS variables
  // at runtime (its scanner matches literal text in source, not evaluated
  // strings) -- so position/size can't be arbitrary-value Tailwind classes
  // here. FloatingElement's own div (unmodified copied source: only takes
  // `className`, no `style` prop) is stretched to fill the Floating
  // container via the static `inset-0` class instead, and the actual
  // positioned/sized card is a plain inline-styled child -- its %-based
  // top/left now resolve against that full-size parent rather than a
  // zero-size one.
  return (
    <FloatingElement depth={0.5 + (depthSeed % 6) * 0.7} className={`inset-0 ${behind ? "z-[1] brightness-[0.6]" : "z-[3]"}`}>
      <div
        style={{ position: "absolute", top: `${top}%`, left: `${left}%`, width: w, height: h }}
        className="overflow-hidden rounded-lg"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={clip.src}
          poster={clip.poster}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
        />
      </div>
    </FloatingElement>
  );
}

/** Dark-register parallax CTA, signed-out only -- real mouse-tracking via
 * the copied Floating/FloatingElement + useAnimationFrame (motion package),
 * per DESIGN-SYSTEM.md §1's motion spec. Centered heading/buttons are
 * deliberately not wrapped in glass -- matches the "Fancy Components"
 * reference the mockup was validated against. */
export function ParallaxCTA() {
  return (
    <section className="oceanic-cta-bg relative flex min-h-screen items-center justify-center overflow-hidden">
      <Floating className="absolute inset-0" sensitivity={-1} easingFactor={0.05}>
        {FRONT_POSITIONS.map((pos, i) => (
          <FloatCard key={`front-${i}`} pos={pos} clipIndex={i} behind={false} depthSeed={i} />
        ))}
        {BEHIND_POSITIONS.map((pos, i) => (
          <FloatCard key={`behind-${i}`} pos={pos} clipIndex={i + 4} behind depthSeed={i + 4} />
        ))}
      </Floating>

      <div className="relative z-10 text-center">
        <h2 className="font-heading text-[40px] font-semibold tracking-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)] sm:text-[48px]">
          Create your next project.
        </h2>
        <div className="mt-6 flex justify-center gap-2.5">
          <Link
            href="/register"
            className="rounded-full bg-white/85 px-7 py-3 font-ui text-[13.5px] font-semibold text-black backdrop-blur-md"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/25 bg-white/8 px-7 py-3 font-ui text-[13.5px] font-semibold text-white backdrop-blur-md"
          >
            Log In
          </Link>
        </div>
      </div>
    </section>
  );
}
