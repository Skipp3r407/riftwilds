"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { guestFetch, rememberGuestTokenFromPayload } from "@/lib/auth/guest-client";
import { GameImage } from "@/components/assets/game-image";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { ClaimScreen } from "@/components/loyalty/claim-screen";
import { RiftStormBanner } from "@/components/loyalty/rift-storm-banner";

type LoyaltyStatus = {
  enabled: boolean;
  framing: string;
  streak: {
    daily: number;
    longestDaily: number;
    weekly: number;
    monthly: number;
    hoursPlayed: number;
  };
  tier: { tier: string; label: string; badgeId: string };
  tierProgress: {
    current: string;
    next: string | null;
    daysToNext: number | null;
    progressRatio: number;
  };
  loyaltyTokens: number;
  titles: string[];
  badges: string[];
  cosmetics: string[];
  collection: {
    id: string;
    label: string;
    rarity: string;
    source: string;
    claimedAt: string;
  }[];
  unclaimedMilestones: { days: number; title: string; description: string }[];
  dailyAirdrop: {
    claimed: boolean;
    eligible: boolean;
    activityOk: boolean;
    activityMessage?: string;
  };
  storm: {
    active: boolean;
    phase?: string;
    intensity?: string | null;
    worldMessage?: string | null;
    warningMessage?: string | null;
    warningRemainingMs?: number;
    timeRemainingMs?: number;
    tierBoostPercent?: number;
    communityPersonal?: number;
    communityTotal?: number;
    communityTarget?: number;
    participationRequirements?: string[];
    rewardCategories?: string[];
    publicHighlights?: string[];
    privacyNote?: string;
  };
  shop: {
    id: string;
    label: string;
    description: string;
    costLoyaltyTokens: number;
    category: string;
    imagePath: string;
    minTier?: string;
  }[];
  socialAnnounceOptOut: boolean;
};

type ClaimPayload = {
  label: string;
  rarity: string;
  kind: string;
  creditsAmount?: number;
  loyaltyTokens?: number;
  assetId?: string;
  source: string;
};

export function LoyaltyDashboard() {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [claim, setClaim] = useState<ClaimPayload | null>(null);
  const [share, setShare] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guestFetch("/api/loyalty/status");
      const json = await res.json();
      rememberGuestTokenFromPayload(json);
      setStatus(json as LoyaltyStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function post(path: string, body: Record<string, unknown>, label: string) {
    setBusy(label);
    setMessage(null);
    try {
      const res = await guestFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      rememberGuestTokenFromPayload(json);
      if (!json.ok && json.error) {
        setMessage(json.message ?? json.error);
      } else if (json.message) {
        setMessage(json.message);
      }
      if (json.claim) {
        setClaim({
          label: json.claim.label,
          rarity: json.claim.rarity,
          kind: json.claim.kind,
          creditsAmount: json.claim.creditsAmount,
          loyaltyTokens: json.claim.loyaltyTokens,
          assetId: json.claim.assetId,
          source: json.claim.source,
        });
      }
      if (json.announce) setMessage(json.announce);
      await refresh();
      return json;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Loyalty"
        titleSlug="loyalty"
        title="Streaks & Rift Storm"
        description="Daily streaks, weighted airdrops, and server-wide Rift Storm events — fair odds by loyalty tier, never pay-to-win."
        status={status?.tier.label ?? "…"}
        statusTone="info"
        actions={
          <>
            <Link href="/rewards" className="btn-secondary focus-ring text-sm">
              Reward Center
            </Link>
            <Link href="/collection" className="btn-secondary focus-ring text-sm">
              Collection
            </Link>
          </>
        }
      />

      {status?.framing ? (
        <p className="text-sm text-[var(--amber)]">{status.framing}</p>
      ) : null}

      <RiftStormBanner
        storm={status?.storm}
        busy={busy}
        onParticipate={() =>
          post(
            "/api/loyalty/storm",
            { action: "participate", participationAction: "QUEST_OBJECTIVE" },
            "storm-participate",
          )
        }
        onRoll={() =>
          post("/api/loyalty/storm", { action: "roll", shareWin: share }, "storm-roll")
        }
        onTriggerDev={() =>
          post(
            "/api/loyalty/storm/trigger",
            { action: "trigger", intensity: "GREATER", skipWarning: true, global: true },
            "storm-trigger",
          )
        }
      />

      {claim ? (
        <ClaimScreen
          claim={claim}
          onClose={() => setClaim(null)}
          onShare={() => {
            setShare(true);
            setMessage("Shared privately as an opt-in blurb (no wallet reveal).");
          }}
        />
      ) : null}

      {message ? (
        <p className="rounded-md border border-[var(--stroke)] bg-black/20 px-3 py-2 text-sm text-white">
          {message}
        </p>
      ) : null}

      {loading || !status ? (
        <p className="text-sm text-[var(--text-muted)]">Loading loyalty status…</p>
      ) : (
        <>
          <section className="panel grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Daily streak</p>
              <p className="font-display text-3xl text-white">{status.streak.daily}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Longest {status.streak.longestDaily} · Weekly {status.streak.weekly} · Monthly{" "}
                {status.streak.monthly}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Tier</p>
              <p className="font-display text-xl text-white">{status.tier.label}</p>
              <div className="mt-2 h-2 overflow-hidden rounded bg-black/40">
                <div
                  className="h-full bg-[var(--amber)] transition-all duration-700"
                  style={{ width: `${Math.round(status.tierProgress.progressRatio * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {status.tierProgress.next
                  ? `${status.tierProgress.daysToNext} days to ${status.tierProgress.next}`
                  : "Max tier"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Loyalty Tokens</p>
              <p className="font-display text-3xl text-white">{status.loyaltyTokens}</p>
              <StatusChip tone="info">Cosmetics shop only</StatusChip>
            </div>
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="font-display text-lg text-white">Daily claim</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Meaningful activity required (movement, quest, combat, craft, care…). Login alone is
              denied.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                disabled={busy !== null}
                onClick={() =>
                  post("/api/loyalty/activity", { kind: "QUEST", detail: "demo" }, "activity")
                }
              >
                Record activity
              </button>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                disabled={busy !== null}
                onClick={() => post("/api/loyalty/check-in", {}, "checkin")}
              >
                Check in
              </button>
              <button
                type="button"
                className="btn-primary focus-ring text-sm"
                disabled={busy !== null || status.dailyAirdrop.claimed}
                onClick={() =>
                  post("/api/loyalty/claim", { type: "daily", share }, "claim-daily")
                }
              >
                {status.dailyAirdrop.claimed ? "Claimed today" : "Claim daily airdrop"}
              </button>
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={share}
                  onChange={(e) => setShare(e.target.checked)}
                />
                Opt-in share (privacy-safe)
              </label>
            </div>
            {!status.dailyAirdrop.activityOk ? (
              <p className="text-xs text-[var(--coral)]">
                {status.dailyAirdrop.activityMessage ?? "Need activity first."}
              </p>
            ) : null}
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="font-display text-lg text-white">Milestones</h2>
            {status.unclaimedMilestones.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No unclaimed milestones.</p>
            ) : (
              <ul className="space-y-2">
                {status.unclaimedMilestones.map((m) => (
                  <li
                    key={m.days}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] py-2"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {m.days}d — {m.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{m.description}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary focus-ring text-sm"
                      disabled={busy !== null}
                      onClick={() =>
                        post(
                          "/api/loyalty/claim",
                          { type: "milestone", days: m.days },
                          `ms-${m.days}`,
                        )
                      }
                    >
                      Claim
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="font-display text-lg text-white">Loyalty Shop</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Cosmetics, titles, badges, housing — never combat power.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {status.shop.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-md border border-[var(--stroke)]">
                  <div className="relative aspect-[16/10] w-full bg-[rgba(8,16,32,0.85)]">
                    <GameImage
                      src={item.imagePath}
                      alt={item.label}
                      width={640}
                      height={400}
                      fill
                      className="h-full w-full"
                      loading="eager"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                    <p className="mt-1 text-xs text-[var(--amber)]">
                      {item.costLoyaltyTokens} tokens · {item.category}
                      {item.minTier ? ` · ${item.minTier}+` : ""}
                    </p>
                    <button
                      type="button"
                      className="btn-secondary focus-ring mt-2 text-sm"
                      disabled={busy !== null}
                      onClick={() =>
                        post("/api/loyalty/shop", { itemId: item.id }, `shop-${item.id}`)
                      }
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="font-display text-lg text-white">Collection</h2>
            {status.collection.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No claims yet — earn your first drop.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {status.collection.slice(0, 12).map((c) => (
                  <li key={c.id} className="rounded-md border border-[var(--stroke)] px-3 py-2 text-sm">
                    <span className="text-white">{c.label}</span>
                    <span className="ml-2 text-xs text-[var(--text-muted)]">
                      {c.rarity} · {c.source}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
              <span>Titles: {status.titles.length}</span>
              <span>Badges: {status.badges.length}</span>
              <span>Cosmetics: {status.cosmetics.length}</span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
