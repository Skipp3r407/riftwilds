import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PresenceChip } from "@/components/ecosystem/presence-chip";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { SocialHub } from "@/components/social/social-hub";
import { SocialNavBadge } from "@/components/social/social-nav-badge";
import { ImageButton } from "@/components/ui/image-button";
import { getSocialHubSnapshot } from "@/game/social/stubs";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getTownFeaturedSnapshot } from "@/lib/social-presence";

export const metadata = { title: "Social" };

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

function SocialAvatar({
  src,
  size = 36,
}: {
  src: string;
  size?: number;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-[var(--stroke)] object-cover"
      unoptimized
    />
  );
}

export default function SocialHubPage() {
  const enabled = featureFlagDefaults.ECOSYSTEM_SOCIAL_HUB_ENABLED;
  const friendsPm = featureFlagDefaults.FRIENDS_AND_PM_ENABLED;
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
        description="Add friends, send private messages, manage requests and safety — Credits only, no wallet required for basics."
        status={friendsPm ? "Friends + PM live" : enabled ? "Stubs" : "Paused"}
        statusTone={friendsPm ? "info" : enabled ? "warn" : "warn"}
        actions={
          <>
            <SocialNavBadge />
            <PresenceChip />
            <ImageButton href="/social" variant="tab" size="sm" selected>
              Social
            </ImageButton>
            <ImageButton href="/guilds" variant="tab" size="sm">
              Guilds
            </ImageButton>
            <ImageButton href="/live-world" variant="tab" size="sm">
              Live World
            </ImageButton>
            <ImageButton href="/creators" variant="tab" size="sm">
              Creators
            </ImageButton>
            <ImageButton href="/settings/nakama" variant="tab" size="sm">
              Nakama
            </ImageButton>
          </>
        }
      />

      {!enabled ? (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">
          Social hub paused by `ECOSYSTEM_SOCIAL_HUB_ENABLED`.
        </section>
      ) : (
        <>
          {friendsPm ? (
            <Suspense
              fallback={
                <section className="panel p-5 text-sm text-[var(--text-muted)]">
                  Loading friends &amp; messages…
                </section>
              }
            >
              <SocialHub />
            </Suspense>
          ) : (
            <section className="panel p-5 text-sm text-[var(--text-muted)]">
              Friends &amp; PM paused by `FRIENDS_AND_PM_ENABLED`.
            </section>
          )}

          {town ? (
            <section className="panel p-5">
              <h2 className="font-display text-xl text-white">Town Featured</h2>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                Hourly cosmetic titles for genuinely active social-hub keepers — Town Hero, Master
                Merchant, Community Favorite. No combat power. Never SOL.
              </p>
              {town.featured.length === 0 ? (
                <>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    No live winners this hour yet — preview keepers below. Earn Presence XP in towns
                    to compete.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                    {hub.townFeaturedPreview.map((f) => (
                      <li
                        key={`${f.title}-${f.displayName}`}
                        className="flex items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <SocialThumb src={f.scenicThumbSrc} alt="" size={48} />
                          <SocialAvatar src={f.avatarSrc} size={36} />
                          <span className="min-w-0">
                            <span className="text-white">
                              {f.title} · {f.displayName}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--text-dim)]">
                              Preview · {f.regionLabel}
                            </span>
                          </span>
                        </span>
                        <StatusChip tone="info">{f.regionSlug}</StatusChip>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  {town.featured.map((f) => (
                    <li
                      key={`${f.title}-${f.userId}`}
                      className="flex items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <SocialThumb
                          src={`/assets/cards/rise-of-the-rift/region-${f.regionSlug}/thumb.png`}
                          alt=""
                          size={48}
                        />
                        <span className="text-white">
                          {f.title} · {f.displayName}
                        </span>
                      </span>
                      <StatusChip tone="info">{f.regionSlug}</StatusChip>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Party</h2>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                Party invites from Friends are stubs until multiplayer Phase 2.
              </p>
              <ul className="mt-3 space-y-3">
                {hub.parties.map((p) => (
                  <li key={p.id} className="flex gap-3 border-b border-[var(--stroke)] pb-3 last:border-0 last:pb-0">
                    <SocialThumb src={p.objectiveThumbSrc} alt="" size={72} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-white">{p.objective}</p>
                        <StatusChip tone={p.kind === "active" ? "info" : "default"}>
                          {p.kind === "active" ? "Your party" : "Invite"}
                        </StatusChip>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <SocialAvatar src={p.leaderAvatarSrc} size={28} />
                        <span>
                          Leader {p.leaderLabel} · {p.memberLabels.length}/{p.maxSize} members
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel p-5">
              <h2 className="font-display text-xl text-white">Mail &amp; community</h2>
              <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
                {hub.mail.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    {m.avatarSrc ? (
                      <SocialAvatar src={m.avatarSrc} />
                    ) : (
                      <SocialAvatar src="/assets/brand/riftwilds-mark.png" />
                    )}
                    <span>
                      <span className="text-white">{m.subject}</span> — {m.fromLabel}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-3 text-sm">
                {hub.posts.map((p) => (
                  <li key={p.id} className="flex gap-3 border-b border-[var(--stroke)] pb-3 last:border-0 last:pb-0">
                    <SocialThumb src={p.thumbSrc} alt="" size={56} />
                    <div className="min-w-0 flex-1">
                      <p className="text-white">{p.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{p.body}</p>
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
