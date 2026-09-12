import Image from "next/image";
import { CaretRight, Code, Sparkle, Stack, User } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ProjectAsset } from "@/db/schema";
import { TONE_BG } from "@/components/StageSection";

const TYPE_LABEL: Record<string, string> = {
  code_drawn: "Code-drawn",
  ai_generated: "AI-generated",
  user_supplied: "User-supplied",
};

// Same semantic palette as StatusBadge (purple/green/amber) so a type without
// a real preview photo still reads as a deliberately designed tile, not a
// blank placeholder -- one accent color per asset type.
const TYPE_ACCENT: Record<string, { bg: string; icon: Icon }> = {
  code_drawn: { bg: "bg-[#7c6ff0]/12 text-[#7c6ff0]", icon: Code },
  ai_generated: { bg: "bg-[#1a9c5b]/12 text-[#1a9c5b]", icon: Sparkle },
  user_supplied: { bg: "bg-[#a4650f]/12 text-[#a4650f]", icon: User },
};

// A real preview photo, by exact asset name, only where a real file for it
// actually exists on disk (copied from the source remotion-engine project or
// re-using a frame already extracted from the real footage elsewhere in this
// app) -- see the final report for provenance of each. No thumbnailUrl
// column exists on project_assets (see schema.ts), so this is a lightweight,
// name-keyed lookup rather than a schema migration. Assets without a real
// file get a tinted type-icon tile (TYPE_ACCENT) instead -- never a
// fabricated photo, and no more a blank/dashed placeholder.
const PREVIEW_IMAGE: Record<string, string> = {
  "Porsche 911 hero card art": "/asset-previews/porsche-911-hero-card-art.png",
  "Ferrari / Rolls-Royce / Tesla card art": "/asset-previews/ferrari-rolls-tesla-card-art.png",
  "navneet-car-reel.mp4": "/thumbnails/navneet-porsche-reel.jpg",
};

function AssetPreview({ asset }: { asset: ProjectAsset }) {
  const src = PREVIEW_IMAGE[asset.name];
  if (src) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-[#16181d]/10">
        <Image src={src} alt={asset.name} fill sizes="44px" className="object-cover" />
      </div>
    );
  }
  const accent = TYPE_ACCENT[asset.assetType] ?? TYPE_ACCENT.code_drawn;
  const PlaceholderIcon = accent.icon;
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${accent.bg}`}>
      <PlaceholderIcon weight="light" size={18} aria-hidden />
    </div>
  );
}

/** First-class asset sheet -- every asset used anywhere in the project, as
 * one retractable table (rows/columns, not a card grid), grouped by which
 * beat/scene it's used in via a row-spanning "Used in" cell rather than
 * repeated group headers. A real preview photo where one genuinely exists;
 * otherwise a tinted type-icon tile (see TYPE_ACCENT) -- there is no source
 * render available in this project for the code-drawn components
 * themselves (CardFlipGrid, MagicianCardFlourish, etc.), so those get a
 * deliberate accent tile, never a fabricated screenshot. */
export function AssetSheet({
  assets,
  tone = "light",
  defaultOpen = true,
}: {
  assets: ProjectAsset[];
  tone?: "light" | "dark";
  defaultOpen?: boolean;
}) {
  if (assets.length === 0) return null;

  const groups: { usedIn: string; items: ProjectAsset[] }[] = [];
  for (const asset of assets) {
    const group = groups.find((g) => g.usedIn === asset.usedInScenes);
    if (group) {
      group.items.push(asset);
    } else {
      groups.push({ usedIn: asset.usedInScenes, items: [asset] });
    }
  }

  return (
    <details
      open={defaultOpen}
      className={`group -mx-4 border-b border-[#16181d]/8 px-4 py-5 last:border-b-0 sm:-mx-5 sm:px-5 ${TONE_BG[tone]}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3.5">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7c6ff0]/10 text-[#7c6ff0]"
        >
          <Stack weight="light" size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">Asset Sheet</p>
          <p className="truncate font-heading text-lg font-semibold text-[#16181d]">
            {assets.length} assets across {groups.length} beats
          </p>
        </div>
        <CaretRight
          weight="bold"
          size={14}
          aria-hidden
          className="shrink-0 text-[#16181d]/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-90"
        />
      </summary>

      <div className="mt-3 min-w-0 overflow-x-auto rounded-xl border border-[#16181d]/8">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#16181d]/8 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
              <th className="w-28 border-r border-[#16181d]/8 px-3 py-2 font-normal">Used in</th>
              <th className="w-16 px-3 py-2 font-normal">Preview</th>
              <th className="px-3 py-2 font-normal">Asset</th>
              <th className="px-3 py-2 font-normal">Type</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) =>
              group.items.map((a, i) => (
                <tr key={a.id} className="border-b border-[#16181d]/8 last:border-0">
                  {i === 0 && (
                    <td
                      rowSpan={group.items.length}
                      className="border-r border-[#16181d]/8 px-3 py-2 align-top font-ui text-[11px] font-bold text-[#7c6ff0]"
                    >
                      {group.usedIn}
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <AssetPreview asset={a} />
                  </td>
                  <td className="px-3 py-2 font-ui text-xs font-semibold text-[#16181d]" title={a.name}>
                    {a.name}
                  </td>
                  <td className="px-3 py-2 text-[#16181d]/60">{TYPE_LABEL[a.assetType] ?? a.assetType}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
