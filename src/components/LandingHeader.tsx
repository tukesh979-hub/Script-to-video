import Link from "next/link";

/** Flat report-strip header, not a floating glass pill -- full width, a
 * single hairline rule underneath, sitting flush at the top of the page. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-panel">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-foreground bg-lime font-display text-sm font-bold text-on-accent"
          >
            S
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground uppercase">
            Script <span className="text-faint">to</span> Video
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="border border-foreground bg-lime px-4 py-2 font-display text-xs font-bold tracking-wide text-on-accent uppercase transition-colors hover:bg-lime-dim"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
