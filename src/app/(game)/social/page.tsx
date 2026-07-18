import Image from "next/image";
import Link from "next/link";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { getSocialHubSnapshot } from "@/game/social/stubs";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PresenceChip } from "@/components/ecosystem/presence-chip";
import { getTownFeaturedSnapshot } from "@/lib/social-presence";

export const metadata = { title: "Social" };

function SocialAvatar({
  src,
  alt,
  size = 40,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-[var(--stroke)] object-cover"
      unoptimized
    />
  );
}

function SocialThumb({
  src,
  alt,
  size = 56,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-md border border-[var(--stroke)] object-cover"
      unoptimized
    />
  );
}

export default function SocialHubPage() {
  const enabled = featureFlagDefaults.ECOSYSTEM_SOCIAL_HUB_ENABLED;
  const hub = getSocialHubSnapshot();
  const town = featureFlagDefaults.TOWN_FEATURED_PLAYER_ENABLED
    ? getTownFeaturedSnapshot()
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Community"
        titleSlug="social"
        title="Social Hub"
        description="Friends, party, messages, community posts, and the event calendar — stubs until presence and moderation ship."
        status={enabled ? "Stubs live" : "Paused"}
        statusTone={enabled ? "info" : "warn"}
        actions={
          <>
            <PresenceChip />
            <Link href="/live-world" className="btn-secondary focus-ring text-sm">
              Live World
            </Link>
            <Link href="/creators" className="btn-secondary focus-ring text-sm">
              Creators
            </Link>
            <Link href="/guilds" className="btn-primary focus-ring text-sm">
              Guilds
            </Link>
          </>
        }
      />

      {!enabled ? (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">
          Social hub paused by `ECOSYSTEM_SOCIAL_HUB_ENABLED`.
        </section>
      ) : (
        <>
          <p className="text-xs text-[var(--text-dim)]">{hub.note}</p>

          {town ? (
            <section className="panel p-5">
              <h2 className="font-display text-xl text-white">Town Featured</h2>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                Hourly cosmetic titles for genuinely active social-hub keepers — Town Hero, Master
                Merchant, Community Favorite. No combat power. Never SOL.
              </p>
              {town.featured.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  No featured keepers this hour yet — earn Presence XP in towns to compete.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  {town.featured.map((f) => (
                    <li
                      key={`${f.title}-${f.userId}`}
                      className="flex items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                    >
                      <span className="text-white">
                        {f.title} · {f.displayName}
                      </span>
                      <StatusChip tone="info">{f.regionSlug}</StatusChip>
                    </li>
                  ))}
                </ul>
              )}
              <ul className="mt-4 grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
                {town.popularLocations.slice(0, 4).map((loc) => (
                  <li key={loc.locationId}>
                    {loc.label} · activity {loc.activityScore}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Friends</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                {hub.friends.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <SocialAvatar src={f.avatarSrc} alt="" />
                      <span className="min-w-0">
                        <span className="text-white">{f.displayName}</span> · {f.rankTitle}
                      </span>
                    </span>
                    <StatusChip tone="default">{f.status}</StatusChip>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Party</h2>
              <div className="mt-3 flex gap-3">
                <SocialThumb
                  src={hub.party.objectiveThumbSrc}
                  alt=""
                  size={72}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{hub.party.objective}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <SocialAvatar
                      src={hub.party.leaderAvatarSrc}
                      alt=""
                      size={28}
                    />
                    <span>
                      Leader {hub.party.leaderLabel} · {hub.party.memberLabels.length}/
                      {hub.party.maxSize} members
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Direct messages</h2>
              <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
                {hub.dms.map((dm) => (
                  <li key={dm.id} className="flex items-start gap-3">
                    <SocialAvatar src={dm.avatarSrc} alt="" size={36} />
                    <span>
                      <span className="text-white">{dm.fromLabel}</span> — {dm.preview}
                    </span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 font-display text-lg text-white">Mail</h3>
              <ul className="mt-2 space-y-2 text-xs text-[var(--text-muted)]">
                {hub.mail.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    {m.avatarSrc ? (
                      <SocialAvatar src={m.avatarSrc} alt="" size={36} />
                    ) : null}
                    <span>
                      <span className="text-white">{m.subject}</span> — {m.fromLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Community posts</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {hub.posts.map((p) => (
                  <li
                    key={p.id}
                    className="flex gap-3 border-b border-[var(--stroke)] pb-3"
                  >
                    <SocialThumb src={p.thumbSrc} alt="" size={64} />
                    <div className="min-w-0 flex-1">
                      <p className="text-white">{p.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{p.body}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
                        {p.authorAvatarSrc ? (
                          <SocialAvatar src={p.authorAvatarSrc} alt="" size={16} />
                        ) : null}
                        <span>
                          {p.channel} · {p.authorLabel}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Event calendar</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
              {hub.calendar.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <SocialThumb src={e.thumbSrc} alt="" size={48} />
                    <span className="text-white">{e.title}</span>
                  </span>
                  <span className="text-xs">
                    {e.kind} · {new Date(e.startsAt).toLocaleDateString()}
                    {e.href ? (
                      <>
                        {" · "}
                        <Link href={e.href} className="text-[var(--cyan)] focus-ring">
                          Open
                        </Link>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
