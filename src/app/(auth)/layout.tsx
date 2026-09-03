import Image from "next/image";
import Link from "next/link";

// Decorative, low-opacity floating photo fragments -- not interactive, per
// DESIGN-SYSTEM.md's Sign In/Sign Up spec. Local thumbnails (real project
// stills already in /public/thumbnails) instead of the mockup's remote
// Unsplash URLs, so this page has no external image dependency.
const FRAGMENTS = [
  { src: "/thumbnails/navneet-porsche-reel.jpg", className: "top-[8%] left-[6%] h-37.5 w-27.5 -rotate-6" },
  { src: "/thumbnails/porsche-911-taste-test.jpg", className: "top-[12%] right-[7%] h-22.5 w-32.5 rotate-6" },
  { src: "/thumbnails/testimonial-ad.jpg", className: "bottom-[10%] left-[8%] h-35 w-25 rotate-4" },
  { src: "/thumbnails/save-ai-credits-editorial-warm.jpg", className: "bottom-[11%] right-[8%] h-22.5 w-32.5 -rotate-5" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="oceanic-wash relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <Link
        href="/"
        className="absolute top-7 left-1/2 z-20 -translate-x-1/2 font-ui text-lg font-semibold tracking-tight text-[#16181d]"
      >
        Script <span className="text-[#c94fd6]">to</span> Video
      </Link>

      {FRAGMENTS.map((f) => (
        <div
          key={f.src}
          aria-hidden
          className={`absolute hidden overflow-hidden rounded-2xl opacity-85 shadow-[0_16px_40px_rgba(60,30,90,0.1)] sm:block ${f.className}`}
        >
          <Image src={f.src} alt="" fill sizes="140px" className="object-cover" />
        </div>
      ))}

      <div className="glass-strong relative z-10 w-full max-w-105 rounded-[26px] px-9 py-10">{children}</div>
    </div>
  );
}
