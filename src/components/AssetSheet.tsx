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
  code_drawn: "text-[#7c6ff0] bg-[#7c6ff0]/10",
  ai_generated: "text-[#a4650f] bg-[#a4650f]/10",
  user_supplied: "text-[#16181d]/50 bg-[#16181d]/6",
};

/** First-class asset sheet — every asset used anywhere in the project, browsable
 * as one table (per 01-pipeline-transparency-prompt.md §4), not just referenced
 * inline per scene. */
export function AssetSheet({ assets }: { assets: ProjectAsset[] }) {
  if (assets.length === 0) return null;
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/50 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
            <th className="px-4 py-3 font-normal">Asset</th>
            <th className="px-4 py-3 font-normal">Type</th>
            <th className="px-4 py-3 font-normal">Used in</th>
            <th className="px-4 py-3 font-normal">Prompt / source</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b border-white/30 last:border-0">
              <td className="px-4 py-3 font-medium text-[#16181d]">{a.name}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 font-ui text-xs font-semibold uppercase ${TYPE_CLASS[a.assetType] ?? "text-[#16181d]/50 bg-[#16181d]/6"}`}
                >
                  {TYPE_LABEL[a.assetType] ?? a.assetType}
                </span>
              </td>
              <td className="px-4 py-3 text-[#16181d]/60">{a.usedInScenes}</td>
              <td className="px-4 py-3 font-ui text-xs text-[#16181d]/40">{a.prompt ?? a.sourcePath ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
