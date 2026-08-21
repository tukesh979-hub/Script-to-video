import type { ProjectAsset } from "@/db/schema";

const TYPE_LABEL: Record<string, string> = {
  code_drawn: "Code-drawn",
  ai_generated: "AI-generated",
  user_supplied: "User-supplied",
};

// Distinct from the status-badge semantics -- code_drawn is the accent
// (this codebase built it), ai_generated is warn (worth a second glance),
// user_supplied is neutral.
const TYPE_CLASS: Record<string, string> = {
  code_drawn: "text-lime-dim border-lime-dim/30",
  ai_generated: "text-warn border-warn/30",
  user_supplied: "text-muted border-border",
};

/** First-class asset sheet — every asset used anywhere in the project, browsable
 * as one table (per 01-pipeline-transparency-prompt.md §4), not just referenced
 * inline per scene. */
export function AssetSheet({ assets }: { assets: ProjectAsset[] }) {
  if (assets.length === 0) return null;
  return (
    <div className="overflow-x-auto border border-border bg-panel">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border font-mono text-[10px] tracking-wide text-faint uppercase">
            <th className="px-4 py-3 font-normal">Asset</th>
            <th className="px-4 py-3 font-normal">Type</th>
            <th className="px-4 py-3 font-normal">Used in</th>
            <th className="px-4 py-3 font-normal">Prompt / source</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{a.name}</td>
              <td className="px-4 py-3">
                <span
                  className={`border px-2 py-0.5 font-mono text-xs uppercase ${TYPE_CLASS[a.assetType] ?? "text-muted border-border"}`}
                >
                  {TYPE_LABEL[a.assetType] ?? a.assetType}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{a.usedInScenes}</td>
              <td className="px-4 py-3 font-mono text-xs text-faint">{a.prompt ?? a.sourcePath ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
