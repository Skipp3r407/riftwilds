import Link from "next/link";
import { listSpeciesLore } from "@/content/pets/lore";
import { wordCount } from "@/lib/pets/lore-types";

export const metadata = { title: "Admin · Pet Lore" };

export default function AdminPetLorePage() {
  const loreList = listSpeciesLore().sort((a, b) => a.name.localeCompare(b.name));
  const complete = loreList.filter((l) => l.status === "COMPLETE" || l.status === "LOCKED");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Admin · Pets</p>
          <h1 className="page-title mt-2">Species Lore</h1>
          <p className="page-lede">
            {complete.length}/{loreList.length} complete. Edit shells are read-only in Phase 1 —
            content lives in <code className="text-[var(--cyan)]">src/content/pets/lore</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/codex/riftlings" className="btn-secondary focus-ring text-sm">
            Public Codex
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      <div className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--stroke)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Species</th>
              <th className="px-4 py-3">Affinity</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Short</th>
              <th className="px-4 py-3">Standard</th>
              <th className="px-4 py-3">Full</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loreList.map((lore) => {
              const short = wordCount(lore.shortBio);
              const standard = wordCount(lore.standardBio);
              const full = wordCount(lore.fullLore);
              const shortOk = short >= 40 && short <= 70;
              const standardOk = standard >= 150 && standard <= 250;
              const fullOk = full >= 450;
              return (
                <tr key={lore.slug} className="border-b border-[var(--stroke)]/60">
                  <td className="px-4 py-3 text-white">{lore.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{lore.affinity}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{lore.nativeRegion}</td>
                  <td className={`px-4 py-3 ${shortOk ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}>
                    {short}
                  </td>
                  <td
                    className={`px-4 py-3 ${standardOk ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}
                  >
                    {standard}
                  </td>
                  <td className={`px-4 py-3 ${fullOk ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}>
                    {full}
                  </td>
                  <td className="px-4 py-3 text-[var(--amber)]">{lore.status}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/codex/riftlings/${lore.slug}`}
                      className="text-[var(--cyan)] hover:underline"
                    >
                      Preview
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="panel mt-6 p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Admin shells (planned)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>/admin/pets/biographies — review generated individual bios</li>
          <li>/admin/pets/story-templates — template usage / disable flags</li>
          <li>/admin/pets/memories — memory audit</li>
        </ul>
        <p className="mt-3">
          Regeneration requires version bump — never silently overwrite locked biographies.
        </p>
      </section>
    </main>
  );
}
