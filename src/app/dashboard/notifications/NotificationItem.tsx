"use client";

import Link from "next/link";
import { useTransition } from "react";
import { acknowledgeRenderAction } from "./actions";
import type { Render } from "@/db/schema";

export function NotificationItem({ render, projectName }: { render: Render; projectName: string }) {
  const [isPending, startTransition] = useTransition();
  const failed = render.status === "failed";

  return (
    <div
      className={`flex items-center justify-between gap-4 border p-4 ${
        failed ? "border-red/30 bg-red/5" : "border-stamp/30 bg-stamp-soft"
      }`}
    >
      <div>
        <p className={`font-mono text-xs tracking-wide uppercase ${failed ? "text-red" : "text-stamp"}`}>
          {failed ? "Render failed" : "Render complete"}
        </p>
        <Link href={`/dashboard/projects/${render.projectId}`} className="text-sm text-foreground hover:underline">
          {projectName}
        </Link>
        {failed && render.errorMessage && <p className="mt-1 text-xs text-muted">{render.errorMessage}</p>}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => acknowledgeRenderAction(render.id))}
        className="shrink-0 border border-border px-3.5 py-2 text-sm text-foreground/70 hover:border-border-glass hover:text-foreground disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
