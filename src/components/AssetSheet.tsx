import Image from "next/image";
import type { ProjectAsset } from "@/db/schema";

const TYPE_LABEL: Record<string, string> = {
  code_drawn: "Code-drawn",
  ai_generated: "AI-generated",
  user_supplied: "User-supplied",
};

// A real preview photo, by exact asset name, only where a real file for it
// actually exists on disk (copied from the source remotion-engine project or
// re-using a frame already extracted from the real footage elsewhere in this
// app) -- see the final report for provenance of each. No thumbnailUrl
// column exists on project_assets (see schema.ts), so this is a lightweight,
// name-keyed lookup rather than a schema migration; assets without a real
// file fall back to a plain type label, never a fabricated photo.
const PREVIEW_IMAGE: Record<string, string> = {
  "Porsche 911 hero card art": "/asset-previews/porsche-911-hero-card-art.png",
  "Ferrari / Rolls-Royce / Tesla card art": "/asset-previews/ferrari-rolls-tesla-card-art.png",
  "navneet-car-reel.mp4": "/thumbnails/navneet-porsche-reel.jpg",
};

function AssetPreview({ asset }: { asset: ProjectAsset }) {
  const src = PREVIEW_IMAGE[asset.name];
  if (src) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-[#16181d]/10">
        <Image src={src} alt={asset.name} fill sizes="140px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-[#16181d]/15 font-ui text-[10px] font-medium text-[#16181d]/35 uppercase">
      {TYPE_LABEL[asset.assetType]?.split("-")[0] ?? asset.assetType}
    </div>
  );
}

/** First-class asset sheet — every asset used anywhere in the project,
 * grouped by which beat/scene it's used in and shown as a grid per group
 * (per 01-pipeline-transparency-prompt.md §4), matching how the reference
 * reel breakdown groups its own asset thumbnails ("Scene 1" -> its assets,
 * "Scene 2" -> its assets), rather than one flat undifferentiated list. A
 * real preview photo where one genuinely exists; otherwise a plain type
 * label -- never the raw source-code path, which read as "code", not as
 * an asset. */
export function AssetSheet({ assets, bare = false }: { assets: ProjectAsset[]; bare?: boolean }) {
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
    <div className={`flex flex-col gap-6 ${bare ? "" : "border-t border-[#16181d]/8 pt-6"}`}>
      {groups.map((group) => (
        <div key={group.usedIn}>
          <p className="mb-2.5 font-ui text-[11px] font-bold text-[#7c6ff0]">{group.usedIn}</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {group.items.map((a) => (
              <div key={a.id}>
                <AssetPreview asset={a} />
                <p className="mt-1.5 truncate font-ui text-xs font-semibold text-[#16181d]" title={a.name}>
                  {a.name}
                </p>
                <p className="truncate text-[11px] text-[#16181d]/45">{TYPE_LABEL[a.assetType] ?? a.assetType}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
