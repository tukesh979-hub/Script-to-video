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
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#16181d]/10">
        <Image src={src} alt={asset.name} fill sizes="48px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#16181d]/15 font-ui text-[9.5px] font-medium text-[#16181d]/35 uppercase">
      {TYPE_LABEL[asset.assetType]?.split("-")[0] ?? asset.assetType}
    </div>
  );
}

/** First-class asset sheet — every asset used anywhere in the project, browsable
 * as one plain table (per 01-pipeline-transparency-prompt.md §4), not just
 * referenced inline per scene. A real preview photo where one genuinely
 * exists; otherwise a plain type label -- never the raw source-code path,
 * which read as "code", not as an asset. */
export function AssetSheet({ assets, bare = false }: { assets: ProjectAsset[]; bare?: boolean }) {
  if (assets.length === 0) return null;
  return (
    <div className={`overflow-x-auto ${bare ? "" : "border-t border-[#16181d]/8"}`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#16181d]/8 font-ui text-[10px] font-bold tracking-[0.06em] text-[#16181d]/40 uppercase">
            <th className="py-3 pr-4 font-normal">Preview</th>
            <th className="py-3 pr-4 font-normal">Asset</th>
            <th className="py-3 pr-4 font-normal">Type</th>
            <th className="py-3 pr-4 font-normal">Used in</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b border-[#16181d]/8 last:border-0">
              <td className="py-3 pr-4">
                <AssetPreview asset={a} />
              </td>
              <td className="py-3 pr-4 font-medium text-[#16181d]">{a.name}</td>
              <td className="py-3 pr-4 text-[#16181d]/55">{TYPE_LABEL[a.assetType] ?? a.assetType}</td>
              <td className="py-3 pr-4 text-[#16181d]/55">{a.usedInScenes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
