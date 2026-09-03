"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type Props =
  | { variant: "signed-out"; creditsBalance: number; creditsLimit: number }
  | { variant: "signed-in"; creditsBalance: number; creditsLimit: number };

/**
 * Large centered glass type bar, per DESIGN-SYSTEM.md §2. Submit behavior
 * per the "Known Gaps" section: signed-out reuses the existing
 * `/register?idea=...` handoff (unchanged from the pre-Oceanic LandingHero);
 * signed-in routes toward the existing project-creation action
 * (dashboard/projects/new) rather than a real generation pipeline, which
 * doesn't exist in this repo yet.
 */
export function OceanicTypeBar({ variant, creditsBalance, creditsLimit }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState("");

  function submit() {
    const trimmed = idea.trim();
    if (!trimmed) return;
    if (variant === "signed-out") {
      router.push(`/register?idea=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/dashboard/projects/new?idea=${encodeURIComponent(trimmed)}`);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="glass mt-9 w-full max-w-175 rounded-[22px] px-5.5 py-5 text-left shadow-[0_30px_70px_rgba(60,30,90,0.10)] sm:px-6">
      <div className="flex justify-between font-ui text-[11.5px] font-medium text-[#16181d]/45">
        <span>
          {creditsBalance}/{creditsLimit} credits
        </span>
        <span>✦ GPT-4o</span>
      </div>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        maxLength={6000}
        placeholder="Paste a full script, or just describe your idea…"
        className="mt-3.5 block max-h-55 min-h-11 w-full resize-none bg-transparent font-oceanic-body text-base text-[#16181d] outline-none placeholder:text-[#16181d]/40 sm:text-[17px]"
      />
      <div className="mt-3.5 flex items-center justify-between border-t border-white/55 pt-3.5">
        <div className="flex gap-2">
          <span className="rounded-full border border-white/50 bg-white/40 px-2.75 py-1.25 font-ui text-[11.5px] font-medium text-[#16181d]/60">
            📎 Attach
          </span>
          <span className="rounded-full border border-white/50 bg-white/40 px-2.75 py-1.25 font-ui text-[11.5px] font-medium text-[#16181d]/60">
            🎙 Voice
          </span>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!idea.trim()}
          title="Get started"
          className="oceanic-accent-gradient flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-[15px] text-white disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
