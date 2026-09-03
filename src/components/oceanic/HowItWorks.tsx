"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { num: "01", icon: "📝", title: "Script", desc: "The script is written first — everything else follows it." },
  { num: "02", icon: "🎬", title: "Storyboard", desc: "The script becomes a shot-by-shot storyboarding plan." },
  { num: "03", icon: "🎵", title: "Beat Sheet", desc: "The storyboard becomes a beat sheet — timing for every beat." },
  { num: "04", icon: "🖼", title: "Asset Library", desc: "Every asset needed for every beat, collected in one place." },
  { num: "05", icon: "▶", title: "Per-Beat Animation", desc: "Each beat is created one by one, beat by beat." },
  { num: "06", icon: "🎧", title: "Sound", desc: "Music, VO and SFX are mixed to the timeline." },
  { num: "07", icon: "🎞", title: "Final Delivery", desc: "Everything comes together as the final video." },
];

function StepRow({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const side = index % 2 === 0 ? "left" : "right";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative mb-14 flex last:mb-0 ${side === "left" ? "justify-start" : "justify-end"} transition-all duration-700 ease-out ${
        visible ? "translate-x-0 opacity-100" : `${side === "left" ? "-translate-x-6" : "translate-x-6"} translate-y-4 opacity-0`
      }`}
    >
      <div className="oceanic-node absolute top-8.5 left-1/2 z-10 flex h-7.5 w-7.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-ui text-[10px] font-bold text-white">
        {step.num}
      </div>
      <div className="glass-dark w-[42%] overflow-hidden rounded-2xl text-white">
        <div className="flex h-24 items-center justify-center border-b border-white/8 bg-[radial-gradient(circle_at_50%_30%,rgba(147,51,234,0.35),transparent_70%)] text-2xl">
          {step.icon}
        </div>
        <div className="px-4 pt-3.5 pb-4">
          <p className="font-ui text-[10px] font-bold tracking-[0.08em] text-white/35">STEP {step.num}</p>
          <p className="mt-1 font-ui text-[15px] font-semibold">{step.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{step.desc}</p>
        </div>
      </div>
    </div>
  );
}

/** Dark-register "How It Works" section, signed-out only -- vertical zigzag
 * timeline, cards fade+slide in on scroll (IntersectionObserver, threshold
 * 0.25), per DESIGN-SYSTEM.md §1/§2. */
export function HowItWorks() {
  return (
    <section id="features" className="oceanic-hiw-bg relative overflow-hidden px-10 py-32.5 sm:py-37.5">
      <div className="relative z-10 mx-auto max-w-160 text-center">
        <p className="font-ui text-[11px] font-bold tracking-[0.12em] text-[#b98bf0]">HOW IT WORKS</p>
        <h2 className="mt-2.5 font-heading text-[28px] font-bold tracking-tight text-white sm:text-[34px]">
          From script to final cut
        </h2>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">
          One pipeline, seven stages — every project walks the same road.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-19 max-w-225">
        <div className="oceanic-timeline-line absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 opacity-70" />
        {STEPS.map((step, i) => (
          <StepRow key={step.num} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
