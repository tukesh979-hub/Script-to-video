import type { ProjectAsset } from "@/db/schema";

const TYPE_LABEL: Record<string, string> = {
  code_drawn: "Code-drawn",
  ai_generated: "AI-generated",
  user_supplied: "User-supplied",
};

const TYPE_CLASS: Record<string, string> = {
  code_drawn: "text-lime-dim border-lime-dim/30",
  ai_generated: "text-lime border-lime/30",
  user_supplied: "text-muted border-border",
};

/** First-class asset sheet — every asset used anywhere in the project, browsable
 * as one table (per 01-pipeline-transparency-prompt.md §4), not just referenced
 * inline per scene. */
export function AssetSheet({ assets }: { assets: ProjectAsset[] }) {
  if (assets.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-panel">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wide text-faint">
            <th className="px-4 py-3 font-display font-normal">Asset</th>
            <th className="px-4 py-3 font-display font-normal">Type</th>
            <th className="px-4 py-3 font-display font-normal">Used in</th>
            <th className="px-4 py-3 font-display font-normal">Prompt / source</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{a.name}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2 py-0.5 text-xs ${TYPE_CLASS[a.assetType] ?? "text-muted border-border"}`}>
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
