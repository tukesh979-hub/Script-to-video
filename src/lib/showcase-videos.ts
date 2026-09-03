export interface ShowcaseVideo {
  id: string;
  src: string;
  poster: string;
  aspect: "portrait"; // 9:16 only
}

/**
 * Static array of free stock cinematic clips, per DESIGN-SYSTEM.md §3 --
 * swappable for real rendered project output later without touching the
 * reel/CTA components themselves. Posters are local (real project stills
 * already in /public/thumbnails); video sources are the same public sample
 * clips used in the validated mockup. Per "Known Gaps & Deferred
 * Decisions", video playback itself is a deferred concern -- these are
 * wired up with a native `poster` attribute (not the mockup's manual
 * play()-after-mount JS, which was the documented bug source) so a poster
 * image always renders even if the video never loads.
 */
export const SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: "navneet",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "/thumbnails/navneet-porsche-reel.jpg",
    aspect: "portrait",
  },
  {
    id: "porsche-taste-test",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "/thumbnails/porsche-911-taste-test.jpg",
    aspect: "portrait",
  },
  {
    id: "testimonial",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "/thumbnails/testimonial-ad.jpg",
    aspect: "portrait",
  },
  {
    id: "editorial-warm",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "/thumbnails/save-ai-credits-editorial-warm.jpg",
    aspect: "portrait",
  },
  {
    id: "kinetic-minimal",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "/thumbnails/save-ai-credits-kinetic-minimal.jpg",
    aspect: "portrait",
  },
  {
    id: "paper-cutout",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "/thumbnails/save-ai-credits-paper-cutout.jpg",
    aspect: "portrait",
  },
];
