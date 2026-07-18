import Link from "next/link";
import { loadThirdPartyRegistry } from "@/lib/assets/third-party/registry";
import { validateRegistry } from "@/lib/assets/third-party/validate";
import type { AssetPipelineStatus } from "@/lib/assets/third-party/schema";

export const metadata = { title: "Admin · Third-party asset library" };
export const dynamic = "force-dynamic";

const STATUS_ORDER: AssetPipelineStatus[] = [
  "DISCOVERED",
  "LICENSE_REVIEW",
  "APPROVED",
  "NEEDS_ATTRIBUTION",
  "IN_USE",
  "REJECTED",
  "RESTRICTED",
];

export default function AdminAssetLibraryPage() {
  const registry = loadThirdPartyRegistry();
  const validation = validateRegistry(registry);
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<
    AssetPipelineStatus,
    number
  >;
  for (const r of registry.records) counts[r.status] = (counts[r.status] ?? 0) + 1;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Third-party asset library</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Discovery and license-review queue. Candidates stay{" "}
            <code className="text-[var(--cyan)]">DISCOVERED</code> /{" "}
            <code className="text-[var(--cyan)]">LICENSE_REVIEW</code> until explicit approval.
            Restricted raw packs are never served from <code className="text-[var(--cyan)]">public/</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/assets" className="btn-secondary focus-ring text-sm">
            Asset pipeline
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      <section className="panel mb-6 space-y-2 p-5 text-sm text-[var(--text-muted)]">
        <p>
          Registry: <code className="text-[var(--cyan)]">assets/licenses/third-party-assets.json</code>
        </p>
        <p>
          Policy: <code className="text-[var(--cyan)]">docs/assets/THIRD_PARTY_ASSET_POLICY.md</code>
        </p>
        <p>
          API stub: <code className="text-[var(--cyan)]">GET/POST /api/admin/assets/library</code>
        </p>
        <p>
          Validation:{" "}
          {validation.ok ? (
            <span className="text-[var(--cyan)]">OK</span>
          ) : (
            <span className="text-[var(--warn,#f0c060)]">
              {validation.issues.length} issue(s)
            </span>
          )}{" "}
          · updated {registry.updatedAt}
        </p>
        <p className="flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => (
            <span key={s}>
              {s}: <strong className="text-white">{counts[s]}</strong>
            </span>
          ))}
        </p>
      </section>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">License</th>
              <th className="px-3 py-2 font-medium">Style</th>
              <th className="px-3 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {registry.records.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-3 py-2 text-white">
                  <div>{r.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{r.creator}</div>
                </td>
                <td className="px-3 py-2">
                  <code className="text-[var(--cyan)]">{r.status}</code>
                </td>
                <td className="px-3 py-2 text-[var(--text-muted)]">
                  {r.licenseCategory}
                  <div className="text-xs">{r.licenseName}</div>
                </td>
                <td className="px-3 py-2 text-white">{r.styleScore}</td>
                <td className="px-3 py-2">
                  <a
                    href={r.previewUrl ?? r.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--cyan)] underline-offset-2 hover:underline"
                  >
                    Preview
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        Approve / reject writes are intentionally stubbed until the discovery report is human-approved.
        See <code className="text-[var(--cyan)]">docs/admin/ASSET_LIBRARY_ADMIN.md</code>.
      </p>
    </main>
  );
}
