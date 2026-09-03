import type { InputHTMLAttributes } from "react";

// Oceanic Design's field/button primitives -- restyled only, no new form
// logic. Used by the auth pages (login/register/reset-password, in scope
// for this restyle) and also by AccountForms (in scope) plus NewProjectForm
// and OnboardingForm (out of scope for this restyle; they inherit the new
// look as a side effect of sharing this file, see final report).
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-ui text-xs font-medium text-[#16181d]/55">
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[10px] border border-white/70 bg-white/60 px-3.5 py-2.5 font-oceanic-body text-sm text-[#16181d] outline-none transition-colors placeholder:text-[#16181d]/35 focus:border-[#7c6ff0]/60 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="oceanic-accent-gradient w-full rounded-xl px-4 py-3 text-center font-ui text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/60 px-4 py-3 text-center font-ui text-[13.5px] font-medium text-[#16181d] transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p
      role="alert"
      className={`rounded-lg border px-3.5 py-2.5 font-oceanic-body text-sm ${
        error ? "border-[#c94fd6]/30 bg-[#c94fd6]/10 text-[#a6248f]" : "border-[#1a9c5b]/30 bg-[#1a9c5b]/10 text-[#1a9c5b]"
      }`}
    >
      {error ?? success}
    </p>
  );
}
