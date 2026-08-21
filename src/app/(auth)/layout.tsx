import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-base font-bold tracking-tight text-foreground uppercase">
        Script <span className="text-faint">to</span> Video
      </Link>
      <div className="w-full max-w-md border border-border bg-panel p-8 sm:p-10">
        {children}
      </div>
    </div>
  );
}
