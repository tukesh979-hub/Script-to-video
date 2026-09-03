import { SHOWCASE_VIDEOS } from "@/lib/showcase-videos";

/** Full-bleed, continuously auto-scrolling reel of vertical (9:16) video
 * cards directly below the signed-out hero's type bar. Doubles the clip
 * list so the CSS scroll animation (`oceanic-reel-track`, -50% translateX)
 * loops seamlessly; pauses on hover via `oceanic-reel-wrap:hover`. */
export function VideoReel() {
  const doubled = [...SHOWCASE_VIDEOS, ...SHOWCASE_VIDEOS];

  return (
    <div className="oceanic-reel-wrap oceanic-reel-mask mt-12 -mx-10 w-[calc(100%+80px)]">
      <div className="oceanic-reel-track flex w-max gap-4.5">
        {doubled.map((clip, i) => (
          <div
            key={`${clip.id}-${i}`}
            className="relative h-124.5 w-70 shrink-0 overflow-hidden rounded-[18px] bg-[#111] shadow-[0_20px_50px_rgba(60,30,90,0.12)]"
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
            <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 font-ui text-[12.5px] text-white">
              ▶ live
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
