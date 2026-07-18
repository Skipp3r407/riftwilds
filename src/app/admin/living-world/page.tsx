import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  getAdminPopulationSnapshot,
  listSocialHubs,
  COMMUNITY_TOKENS_DAY_CAP,
  PRESENCE_XP_DAY_CAP,
  PRESENCE_XP_HOUR_CAP,
} from "@/lib/social-presence";

export const metadata = { title: "Living World Admin" };

export default function LivingWorldAdminPage() {
  const snap = getAdminPopulationSnapshot();
  const hubs = listSocialHubs();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Ops</p>
          <h1 className="page-title mt-2">Living World Population</h1>
          <p className="page-lede">
            Presence tiers, hubs, Community Tokens, featured keepers. Soft rewards only —
            never SOL for idling.
          </p>
        </div>
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Back
        </Link>
      </div>

      <section className="panel grid gap-3 p-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">XP / hour cap</p>
          <p className="font-display text-xl text-white">{PRESENCE_XP_HOUR_CAP}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">XP / day cap</p>
          <p className="font-display text-xl text-white">{PRESENCE_XP_DAY_CAP}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">CT / day cap</p>
          <p className="font-display text-xl text-white">{COMMUNITY_TOKENS_DAY_CAP}</p>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Feature flags</h2>
        <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
          {(
            [
              "LIVING_SERVER_POPULATION_ENABLED",
              "SOCIAL_PRESENCE_ENABLED",
              "COMMUNITY_TOKENS_ENABLED",
              "SOCIAL_HELPER_SYSTEM_ENABLED",
              "SOCIAL_PERFORMANCES_ENABLED",
              "RIFTLING_SOCIALIZATION_ENABLED",
            ] as const
          ).map((key) => (
            <li key={key}>
              {key}:{" "}
              <span className={featureFlagDefaults[key] ? "text-[var(--emerald)]" : "text-[var(--coral)]"}>
                {String(featureFlagDefaults[key])}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Featured this hour</h2>
        {snap.featured.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">None yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
            {snap.featured.map((f) => (
              <li key={`${f.title}-${f.userId}`}>
                {f.title} · {f.displayName} · {f.regionSlug} · score {f.score}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Social hubs ({hubs.length})</h2>
        <ul className="mt-2 grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
          {hubs.map((h) => (
            <li key={h.id} className="rounded border border-[var(--stroke)] px-2 py-1.5">
              <span className="text-white">{h.name}</span> · {h.hubType} · cap {h.capacity} · ×
              {h.presenceMultiplier}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Popular locations</h2>
        <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
          {snap.popularLocations.map((loc) => (
            <li key={loc.locationId}>
              {loc.label} · activity {loc.activityScore}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-[var(--text-dim)]">{snap.note}</p>
      </section>
    </main>
  );
}
