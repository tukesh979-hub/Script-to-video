"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fade-up + blur scroll-entrance, once per element (IntersectionObserver,
 * not a scroll listener -- avoids the reflow/perf cost of polling scroll
 * position). Nothing on the page should just appear statically on load;
 * this is the shared primitive for that instead of each section rolling
 * its own observer (HowItWorks already had one before this existed).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** ms, for staggering a list of siblings. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible ? "translate-y-0 opacity-100 blur-none" : "translate-y-4 opacity-0 blur-sm"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
