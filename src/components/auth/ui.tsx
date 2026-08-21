import type { InputHTMLAttributes } from "react";

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-foreground/85">
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-border bg-panel-2 px-3.5 py-3 text-base text-foreground placeholder:text-faint outline-none transition-colors focus:border-lime disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full border border-foreground bg-lime px-4 py-2.5 text-center font-display text-xs font-bold tracking-wide text-on-accent uppercase transition-colors hover:bg-lime-dim disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full border border-border bg-panel-2 px-4 py-2.5 text-center text-sm text-foreground transition-colors hover:border-border-glass disabled:cursor-not-allowed disabled:opacity-50"
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
      className={`border px-3.5 py-2.5 text-sm ${
        error ? "border-red/40 bg-red/10 text-red" : "border-stamp/40 bg-stamp-soft text-stamp"
      }`}
    >
      {error ?? success}
    </p>
  );
}
