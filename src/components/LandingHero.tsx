"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { GLYPH } from "@/lib/icons";
import { STYLE_PILLS } from "@/lib/style-pills";

/** Flat "camera report" scriptbar -- hairline border, sharp corners, solid
 * red focus ring instead of a glow. Functional, same as before: submitting
 * carries the idea into sign-up rather than promising a generation pipeline
 * that isn't built yet. */
export function LandingHero() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState<string | null>(null);

  function submit() {
    const trimmed = idea.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ idea: trimmed });
    if (style) params.set("style", style);
    router.push(`/register?${params.toString()}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <>
      <h1 className="font-display text-[38px] leading-[1.04] font-bold tracking-tight text-foreground uppercase sm:text-[58px]">
        What are we <span className="circle-mark text-lime">making</span> today?
      </h1>
      <p className="mt-5 text-base text-muted sm:text-lg">
        One pipeline handles it all — research, script, storyboard, film &amp; more
      </p>

      <div className="mt-9 w-full max-w-[680px] border border-border bg-panel px-5 pt-4.5 pb-3.5 text-left transition-[border-color] focus-within:border-lime">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={6000}
          placeholder="Paste a full script, or just describe your idea…"
          className="block max-h-55 min-h-7 w-full resize-none bg-transparent text-[15.5px] leading-[1.55] text-foreground outline-none placeholder:text-faint"
        />
        <div className="mt-3.5 flex items-center gap-3 border-t border-border pt-3">
          <span className="flex-1 font-mono text-[11px] tracking-wide text-faint uppercase">
            Free to start — no card required
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!idea.trim()}
            title="Get started"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-foreground bg-lime text-on-accent transition-colors hover:bg-lime-dim disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-2 disabled:text-faint"
          >
            {GLYPH.brief}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {STYLE_PILLS.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => setStyle((s) => (s === pill ? null : pill))}
            className={`border px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wide uppercase transition-colors ${
              style === pill
                ? "border-lime bg-lime-soft text-lime-dim"
                : "border-border bg-panel text-foreground/60 hover:border-border-glass hover:text-foreground"
            }`}
          >
            {pill}
          </button>
        ))}
      </div>
    </>
  );
}
