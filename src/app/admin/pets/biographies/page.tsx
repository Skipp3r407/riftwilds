import Link from "next/link";

export const metadata = { title: "Admin · Pet Biographies" };

export default function AdminPetBiographiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="panel p-6">
        <p className="page-kicker">Admin · Pets</p>
        <h1 className="page-title mt-2">Biography Review</h1>
        <p className="page-lede">
          Shell for reviewing generated individual biographies, locking approved versions, and
          regenerating only with an explicit version bump. Live hatchery pets already store
          biographies on the pet record at hatch.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
          <li>Never silently overwrite locked biographies</li>
          <li>Bred vs wild origin contradictions surface in validate:pet-lore</li>
          <li>
            Sample dump:{" "}
            <code className="text-[var(--cyan)]">artifacts/reports/pet-lore/sample-biographies.md</code>
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/pets/lore" className="btn-primary focus-ring text-sm">
            Species lore table
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>
    </main>
  );
}
