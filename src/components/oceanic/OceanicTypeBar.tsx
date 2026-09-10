"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkle, Paperclip, X, Microphone, ArrowUp } from "@phosphor-icons/react/ssr";
import { GlassPanel } from "@/components/ui/glass-panel";

type Props =
  | { variant: "signed-out"; creditsBalance: number; creditsLimit: number }
  | { variant: "signed-in"; creditsBalance: number; creditsLimit: number };

// Minimal shape of the Web Speech API's SpeechRecognition -- not in the
// default DOM lib, and only webkitSpeechRecognition exists in Chrome/Edge/
// Safari (no vendor-unprefixed version has shipped anywhere yet).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Large centered glass type bar, per DESIGN-SYSTEM.md §2. Submit behavior
 * per the "Known Gaps" section: signed-out reuses the existing
 * `/register?idea=...` handoff (unchanged from the pre-Oceanic LandingHero);
 * signed-in routes toward the existing project-creation action
 * (dashboard/projects/new) rather than a real generation pipeline, which
 * doesn't exist in this repo yet.
 *
 * Attach and Voice are real interactions, scoped to what's actually
 * possible without a file-upload/storage backend (none exists yet): Attach
 * opens the native file picker and folds the file's name into the idea text
 * rather than claiming a fake upload; Voice runs the browser's own speech
 * recognition (no server round-trip) and dictates straight into the
 * textarea, falling back to a disabled, explained pill where unsupported.
 */
export function OceanicTypeBar({ variant, creditsBalance, creditsLimit }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionCtor() !== null);
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function submit() {
    const trimmed = idea.trim();
    if (!trimmed) return;
    const withAttachment = attachedFile ? `${trimmed}\n\n[Attached: ${attachedFile.name}]` : trimmed;
    if (variant === "signed-out") {
      router.push(`/register?idea=${encodeURIComponent(withAttachment)}`);
    } else {
      router.push(`/dashboard/projects/new?idea=${encodeURIComponent(withAttachment)}`);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAttachedFile(file);
    e.target.value = "";
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceSupported(false);
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setIdea((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  return (
    <GlassPanel className="mt-9 w-full max-w-175 shadow-[0_30px_70px_rgba(60,30,90,0.10)]" innerClassName="px-5.5 py-5 text-left sm:px-6">
      <div className="flex justify-between font-ui text-[11.5px] font-medium text-[#16181d]/45">
        <span>
          {creditsBalance}/{creditsLimit} credits
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkle weight="fill" size={11} aria-hidden />
          GPT-4o
        </span>
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
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChosen} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-2.75 py-1.25 font-ui text-[11.5px] font-medium text-[#16181d]/60 transition-colors hover:bg-white/60 hover:text-[#16181d]"
          >
            <Paperclip weight="light" size={13} aria-hidden />
            {attachedFile ? attachedFile.name.slice(0, 24) : "Attach"}
          </button>
          {attachedFile && (
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              title="Remove attachment"
              className="rounded-full border border-white/50 bg-white/40 p-1.25 text-[#16181d]/50 hover:text-[#16181d]"
            >
              <X weight="bold" size={11} aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={toggleVoice}
            disabled={!voiceSupported}
            title={voiceSupported ? (isListening ? "Stop dictation" : "Dictate your idea") : "Voice dictation isn't supported in this browser"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.75 py-1.25 font-ui text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening
                ? "border-[#c94fd6]/40 bg-[#c94fd6]/15 text-[#a6248f]"
                : "border-white/50 bg-white/40 text-[#16181d]/60 hover:bg-white/60 hover:text-[#16181d]"
            }`}
          >
            {isListening ? (
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
            ) : (
              <Microphone weight="light" size={13} aria-hidden />
            )}
            {isListening ? "Listening…" : "Voice"}
          </button>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!idea.trim()}
          title="Get started"
          className="oceanic-accent-gradient flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <ArrowUp weight="bold" size={16} aria-hidden />
        </button>
      </div>
    </GlassPanel>
  );
}
