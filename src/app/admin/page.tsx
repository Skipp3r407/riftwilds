import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Admin" };

const sections = [
  { label: "Overview", href: null },
  { label: "Players", href: "/admin/players" },
  { label: "Eggs", href: null },
  { label: "Pets", href: "/admin/pets/lore" },
  { label: "Pet lore", href: "/admin/pets/lore" },
  { label: "Items", href: "/admin/items" },
  { label: "Arena", href: "/admin/arena" },
  { label: "Live World", href: "/live-world" },
  { label: "Emotes", href: "/admin/emotes" },
  { label: "NPCs", href: "/admin/npcs" },
  { label: "Regions", href: "/admin/regions" },
  { label: "Guilds", href: "/admin/guilds" },
  { label: "Marketplace", href: "/admin/marketplace" },
  { label: "Economy", href: "/admin/economy" },
  { label: "Treasury", href: "/admin/treasury" },
  { label: "Rewards", href: "/admin/rewards" },
  { label: "Loyalty / Rift Storm", href: "/admin/loyalty" },
  { label: "Living World Population", href: "/admin/living-world" },
  { label: "Revenue allocation", href: "/admin/economy/revenue-allocation" },
  { label: "Economy simulator", href: "/admin/economy/simulator" },
  { label: "Economy health", href: "/admin/economy/health" },
  { label: "Testing", href: "/admin/testing" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Events", href: "/admin/events" },
  { label: "Support", href: "/admin/support" },
  { label: "Story", href: "/api/story/arcs" },
  { label: "Assets", href: "/admin/assets" },
  { label: "Moderation", href: "/admin/support" },
  { label: "System", href: "/api/expansion/packs" },
  { label: "Feature flags", href: null },
  { label: "Audit logs", href: "/admin/analytics" },
] as const;

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Ops</p>
          <h1 className="page-title mt-2">Admin Dashboard</h1>
          <p className="page-lede">
            Protected shell — admin role checks required before mutations. Never silently rewrite
            completed hatch results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/economy" className="btn-primary focus-ring text-sm">
            Economy
          </Link>
          <Link href="/admin/arena" className="btn-secondary focus-ring text-sm">
            Arena
          </Link>
          <Link href="/admin/items" className="btn-secondary focus-ring text-sm">
            Items
          </Link>
          <Link href="/admin/assets" className="btn-secondary focus-ring text-sm">
            Assets
          </Link>
          <Link href="/admin/testing" className="btn-secondary focus-ring text-sm">
            Testing
          </Link>
          <Link href="/" className="btn-secondary focus-ring text-sm">
            Exit
          </Link>
        </div>
      </div>

      <section className="panel mb-6 p-5">
        <h2 className="font-display text-lg text-white">Feature flags (defaults)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(featureFlagDefaults).map(([key, enabled]) => (
            <div key={key} className="rounded-md border border-[var(--stroke)] px-3 py-2 text-xs">
              <span className="text-[var(--text-muted)]">{key}</span>
              <span className={`ml-2 ${enabled ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}>
                {enabled ? "ON" : "OFF"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sections.map((section) =>
          section.href ? (
            <Link
              key={section.label}
              href={section.href}
              className="panel block p-4 text-sm text-[var(--cyan)] hover:border-[rgba(61,231,255,0.35)]"
            >
              {section.label}
            </Link>
          ) : (
            <div key={section.label} className="panel p-4 text-sm text-[var(--text-muted)]">
              {section.label}
            </div>
          ),
        )}
      </section>
    </main>
  );
}
