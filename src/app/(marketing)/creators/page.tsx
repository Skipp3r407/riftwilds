import Image from "next/image";
import Link from "next/link";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { getCreatorHubSnapshot } from "@/lib/ecosystem/creator-hub";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Creator Hub" };

export default function CreatorHubPage() {
  const enabled = featureFlagDefaults.ECOSYSTEM_CREATOR_HUB_ENABLED;
  const hub = getCreatorHubSnapshot();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <SectionTitleBand
          slug="creators"
          label={hub.title}
          kicker="Creator economy"
          atmosphere={false}
        />
        <p className="page-lede mt-4">{hub.lede}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/marketplace" className="btn-primary focus-ring text-sm">
            Marketplace
          </Link>
          <Link href="/social" className="btn-secondary focus-ring text-sm">
            Social
          </Link>
        </div>
      </div>

      {!enabled ? (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">
          Creator Hub paused by feature flag.
        </section>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2">
            {hub.creators.map((c) => (
              <article key={c.id} className="panel group flex flex-col overflow-hidden">
                <div
                  className={`section-card-thumb creator-hub-thumb creator-hub-thumb--${c.bgTheme} border-b border-[rgba(61,231,255,0.12)]`}
                  style={{ ["--creator-hub-bg" as string]: `url(${c.bgSrc})` }}
                >
                  <div className="creator-hub-thumb__bg" aria-hidden />
                  <Image
                    src={c.artSrc}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="section-card-thumb__img object-contain p-4"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-xl text-white">{c.displayName}</h2>
                      <p className="text-xs text-[var(--text-dim)]">@{c.handle}</p>
                    </div>
                    <StatusChip tone="info">{c.packCount} packs</StatusChip>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{c.bio}</p>
                  <p className="mt-2 text-xs text-[var(--text-dim)]">
                    {c.specialties.join(" · ")}
                    {c.tipEnabled ? " · tips on" : " · tips off"}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-white">Offers</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {hub.offers.map((o) => (
                <li key={o.id} className="panel group flex flex-col overflow-hidden">
                  <div
                    className={`section-card-thumb creator-hub-thumb creator-hub-thumb--${o.bgTheme} border-b border-[rgba(61,231,255,0.12)]`}
                    style={{ ["--creator-hub-bg" as string]: `url(${o.bgSrc})` }}
                  >
                    <div className="creator-hub-thumb__bg" aria-hidden />
                    <Image
                      src={o.artSrc}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="section-card-thumb__img object-contain p-4"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg text-white">{o.title}</h3>
                      <StatusChip tone={o.status === "preview" ? "info" : "default"}>
                        {o.status}
                      </StatusChip>
                    </div>
                    <p className="text-xs text-[var(--text-dim)]">{o.kind.replaceAll("_", " ")}</p>
                    <p className="text-xs text-[var(--text-muted)]">{o.priceLabel}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
            <h2 className="font-display text-lg text-white">Guidelines</h2>
            {hub.guidelines.map((g) => (
              <p key={g}>• {g}</p>
            ))}
            {hub.disclaimers.map((d) => (
              <p key={d} className="text-[var(--amber)]">
                {d}
              </p>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
