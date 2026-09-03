"use client";

import Link from "next/link";
import { useTransition } from "react";
import { acknowledgeRenderAction } from "./actions";
import type { Render } from "@/db/schema";

export function NotificationItem({ render, projectName }: { render: Render; projectName: string }) {
  const [isPending, startTransition] = useTransition();
  const failed = render.status === "failed";

  return (
    <div className="glass flex items-start gap-3 rounded-[14px] p-3.5 px-4">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: failed ? "#c94fd6" : "#c94fd6", opacity: failed ? 1 : 0.55 }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="font-ui text-[13px] font-semibold text-[#16181d]">
          {failed ? "Render failed — " : "Finished rendering — "}
          <Link href={`/dashboard/projects/${render.projectId}`} className="hover:underline">
            {projectName}
          </Link>
        </p>
        {failed && render.errorMessage && <p className="mt-1 text-xs text-[#16181d]/50">{render.errorMessage}</p>}
        <p className="mt-1 text-[11.5px] text-[#16181d]/40">
          {(render.completedAt ?? render.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => acknowledgeRenderAction(render.id))}
        className="shrink-0 rounded-full border border-white/50 bg-white/40 px-3 py-1.5 font-ui text-[11.5px] font-medium text-[#16181d]/60 hover:text-[#16181d] disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
