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

// No thumbnailUrl on project_assets (see schema.ts) -- there's no real image
// to show per asset, so each group gets a tinted icon tile instead of
// fabricating a preview image. Mirrors the reference reel breakdown's
// grouped-thumbnail-grid structure without inventing content the schema
// doesn't produce.
const TYPE_GLYPH: Record<string, string> = {
  code_drawn: "</>",
  ai_generated: "✨",
  user_supplied: "📁",
};

const TYPE_ORDER = ["code_drawn", "ai_generated", "user_supplied"];

/** First-class asset sheet — every asset used anywhere in the project, browsable
 * as one grouped grid (per 01-pipeline-transparency-prompt.md §4), not just
 * referenced inline per scene. */
export function AssetSheet({ assets }: { assets: ProjectAsset[] }) {
  if (assets.length === 0) return null;

  const groups = TYPE_ORDER.map((type) => ({ type, items: assets.filter((a) => a.assetType === type) })).filter(
    (g) => g.items.length > 0,
  );
  const otherTypes = [...new Set(assets.map((a) => a.assetType))].filter((t) => !TYPE_ORDER.includes(t));
  for (const type of otherTypes) {
    groups.push({ type, items: assets.filter((a) => a.assetType === type) });
  }

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.type}>
          <p className="mb-3 font-ui text-[11px] font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">
            {TYPE_LABEL[group.type] ?? group.type} · {group.items.length}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((a) => (
              <div key={a.id} className="glass flex flex-col gap-2.5 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] font-ui text-xs font-bold ${TYPE_CLASS[a.assetType] ?? "text-[#16181d]/50 bg-[#16181d]/6"}`}
                  >
                    {TYPE_GLYPH[a.assetType] ?? "•"}
                  </span>
                  <span className="truncate font-ui text-[10px] font-medium text-[#16181d]/40">{a.usedInScenes}</span>
                </div>
                <p className="truncate text-sm font-semibold text-[#16181d]" title={a.name}>
                  {a.name}
                </p>
                <p className="line-clamp-2 font-ui text-xs text-[#16181d]/45" title={a.prompt ?? a.sourcePath ?? undefined}>
                  {a.prompt ?? a.sourcePath ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
