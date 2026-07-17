import Link from "next/link";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { AssetManifestAdmin } from "@/components/assets/asset-manifest-admin";
import type { AssetManifestDocument } from "@/lib/assets/asset-manifest";

export const metadata = { title: "Admin · Assets" };
export const dynamic = "force-dynamic";

function loadManifest(): AssetManifestDocument | null {
  const p = path.join(process.cwd(), "public/assets/asset-manifest.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as AssetManifestDocument;
  } catch {
    return null;
  }
}

export default function AdminAssetsPage() {
  const manifest = loadManifest();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Asset pipeline</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Manifest-driven review of generated vs pending masters. Run{" "}
            <code className="text-[var(--cyan)]">npm run assets:scan</code> to refresh.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/assets/sprite-inspector" className="btn-primary focus-ring text-sm">
            Sprite inspector
          </Link>
          <Link href="/admin/assets/equipment-aligner" className="btn-secondary focus-ring text-sm">
            Equipment aligner
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      <section className="panel mb-6 space-y-2 p-5 text-sm text-[var(--text-muted)]">
        <p>
          Docs: <code className="text-[var(--cyan)]">docs/ASSET_GENERATION.md</code>
        </p>
        <p>
          Style guides: <code className="text-[var(--cyan)]">artifacts/assets/style-guides/</code>
        </p>
        <p>
          Manifest: <code className="text-[var(--cyan)]">public/assets/asset-manifest.json</code>
        </p>
        {!manifest ? (
          <p className="text-[var(--warn,#f0c060)]">
            No manifest yet — run <code>npm run assets:scan</code>.
          </p>
        ) : (
          <p>
            Last scan {manifest.generatedAt} · generated {manifest.byStatus.generated} · pending{" "}
            {manifest.byStatus.pending} · legacy {manifest.byStatus.legacy}
          </p>
        )}
      </section>

      {manifest ? <AssetManifestAdmin manifest={manifest} /> : null}
    </main>
  );
}
