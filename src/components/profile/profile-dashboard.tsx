"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Award,
  Egg,
  ExternalLink,
  Gamepad2,
  PawPrint,
  ScrollText,
  Settings2,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import { AffinityChip } from "@/components/leaderboards/affinity-chip";
import { AvatarPicker } from "@/components/social/avatar-picker";
import { EmptyState, StatusChip } from "@/components/shared/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { brandMarkPath, creaturePortraitPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import {
  DEMO_ACHIEVEMENTS,
  DEMO_ACTIVITY,
  DEMO_ARENA_POINTS,
  DEMO_QUESTS_COMPLETED,
  PROFILE_QUICK_LINKS,
  shortWallet,
  type ProfileAchievement,
} from "@/lib/profile/demo-data";
import { cn } from "@/lib/utils/cn";
import type { AffinityFilter } from "@/lib/leaderboards/types";

const DISPLAY_NAME_KEY = "riftwilds-profile-display-name";
const MUSIC_PREFS_KEY = "riftwilds-music-prefs";
const LOADOUT_KEY = "riftwilds-arena-loadout-v1";

type ProfileTab = "overview" | "pets" | "loadout" | "achievements" | "settings";

type PetRow = {
  publicId: string;
  name: string;
  condition: string;
  rarity: string;
  affinity: string;
  speciesSlug?: string;
  temperament?: string;
  careScore?: number;
  memories?: { kind: string; label: string; at: string }[];
};

type SavedLoadout = {
  name: string;
  speciesSlug: string;
  affinity: string;
  weaponId: string | null;
  level: number;
};

type BalancePayload = {
  balance?: { uiAmount: string; tier: string; fetchedAt: string };
  error?: { message: string };
};

const TABS: { id: ProfileTab; label: string; icon: typeof Sparkles }[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "pets", label: "Pets", icon: PawPrint },
  { id: "loadout", label: "Loadout", icon: Swords },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function tierTone(tier: string | null): "live" | "info" | "warn" | "default" {
  if (!tier) return "default";
  const t = tier.toUpperCase();
  if (t === "FOUNDER" || t === "WARDEN") return "live";
  if (t === "RANGER" || t === "KEEPER") return "info";
  return "warn";
}

function activityIcon(kind: (typeof DEMO_ACTIVITY)[number]["kind"]) {
  switch (kind) {
    case "arena":
      return Gamepad2;
    case "care":
      return PawPrint;
    case "hatch":
      return Egg;
    case "quest":
      return ScrollText;
    case "memory":
      return Sparkles;
    default:
      return Shield;
  }
}

function achievementTone(rarity: ProfileAchievement["rarity"]): "default" | "info" | "live" | "warn" {
  if (rarity === "epic") return "live";
  if (rarity === "rare") return "info";
  if (rarity === "uncommon") return "warn";
  return "default";
}

export function ProfileDashboard() {
  const mounted = useMounted();
  const { address: wallet, connected, viewOnly } = useActiveWallet();
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [pets, setPets] = useState<PetRow[]>([]);
  const [socialAvatarSrc, setSocialAvatarSrc] = useState<string | null>(null);
  const [eggsClaimed, setEggsClaimed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Keeper");
  const [nameDraft, setNameDraft] = useState("Keeper");
  const [nameSaved, setNameSaved] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [loadout, setLoadout] = useState<SavedLoadout | null>(null);
  const [balance, setBalance] = useState<BalancePayload | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const walletShort = wallet ? shortWallet(wallet) : null;

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(DISPLAY_NAME_KEY);
      if (stored?.trim()) {
        setDisplayName(stored.trim());
        setNameDraft(stored.trim());
      }
      const musicRaw = localStorage.getItem(MUSIC_PREFS_KEY);
      if (musicRaw) {
        const parsed = JSON.parse(musicRaw) as { muted?: boolean };
        setMusicMuted(Boolean(parsed.muted));
      }
      const loadoutRaw = localStorage.getItem(LOADOUT_KEY);
      if (loadoutRaw) {
        setLoadout(JSON.parse(loadoutRaw) as SavedLoadout);
      }
    } catch {
      /* ignore */
    }
  }, [mounted]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [petsRes, eggsRes, avatarRes] = await Promise.all([
          fetch("/api/pets"),
          fetch("/api/hatchery/eggs"),
          fetch("/api/social/avatars"),
        ]);
        const petsJson = (await petsRes.json()) as { pets?: PetRow[] };
        const eggsJson = (await eggsRes.json()) as { eggs?: unknown[]; pets?: PetRow[] };
        const avatarJson = (await avatarRes.json()) as {
          ok?: boolean;
          selectedSrc?: string;
        };
        if (cancelled) return;
        const nextPets = petsJson.pets ?? eggsJson.pets ?? [];
        setPets(nextPets);
        setEggsClaimed(eggsJson.eggs?.length ?? 0);
        if (avatarJson.ok && avatarJson.selectedSrc) {
          setSocialAvatarSrc(avatarJson.selectedSrc);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/token/balance?wallet=${wallet}`);
      const json = (await res.json()) as BalancePayload;
      setBalance(json);
    } catch {
      setBalance({ error: { message: "Balance unavailable" } });
    } finally {
      setBalanceLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (connected && wallet) void refreshBalance();
    else setBalance(null);
  }, [connected, wallet, refreshBalance]);

  const avatarPet = pets[0] ?? null;
  const avatarSrc =
    socialAvatarSrc ??
    (avatarPet?.speciesSlug ? creaturePortraitPath(avatarPet.speciesSlug) : brandMarkPath);

  const memories = useMemo(
    () =>
      pets.flatMap((p) =>
        (p.memories ?? []).map((m) => ({
          ...m,
          petName: p.name,
          petId: p.publicId,
        })),
      ),
    [pets],
  );

  const achievements = useMemo(() => {
    return DEMO_ACHIEVEMENTS.map((a) => {
      if (a.id === "first-claim" && eggsClaimed > 0) return { ...a, unlocked: true };
      if (a.id === "first-hatch" && pets.length > 0) return { ...a, unlocked: true };
      if (a.id === "loadout-ready" && loadout?.weaponId) return { ...a, unlocked: true };
      if (a.id === "rift-holder" && connected && balance?.balance) return { ...a, unlocked: true };
      return a;
    });
  }, [eggsClaimed, pets.length, loadout, connected, balance]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const keeperTier = balance?.balance?.tier ?? (connected ? "VISITOR" : null);

  const saveDisplayName = () => {
    const next = nameDraft.trim() || "Keeper";
    setDisplayName(next);
    setNameDraft(next);
    try {
      localStorage.setItem(DISPLAY_NAME_KEY, next);
    } catch {
      /* ignore */
    }
    setNameSaved(true);
    window.setTimeout(() => setNameSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Identity header */}
      <section className="panel panel-glow surface-grid relative overflow-hidden p-5 md:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[rgba(61,231,255,0.12)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-[rgba(155,123,255,0.1)] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="shrink-0">
              <div className="relative h-20 w-20 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke-strong)] bg-[rgba(8,8,14,0.55)] shadow-[0_0_28px_rgba(61,231,255,0.18)] md:h-24 md:w-24">
                <Image
                  src={avatarSrc}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain p-1.5"
                  unoptimized
                  priority
                />
              </div>
              <button
                type="button"
                className="mt-1.5 block w-full text-center text-[11px] text-[var(--cyan)] underline focus-ring"
                onClick={() => setTab("settings")}
              >
                Change avatar
              </button>
            </div>
            <div className="min-w-0">
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
                Keeper identity
              </p>
              <h2 className="mt-1 truncate font-display text-2xl text-white md:text-3xl">
                {displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {connected && walletShort ? (
                  <StatusChip tone="live">{walletShort}</StatusChip>
                ) : (
                  <StatusChip tone="warn">Wallet offline</StatusChip>
                )}
                {viewOnly ? <StatusChip tone="warn">View-only</StatusChip> : null}
                <StatusChip tone={tierTone(keeperTier)}>
                  {keeperTier ? `${keeperTier} tier` : "No tier"}
                </StatusChip>
                <StatusChip tone="info">
                  Solana · {projectConfig.SOLANA_NETWORK}
                </StatusChip>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {projectConfig.UNIVERSE_NAME} · {projectConfig.GAME_VERSION}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {!connected ? (
              <>
                <p className="text-right text-xs text-[var(--text-muted)]">
                  Connect a wallet or paste an address to check $RIFT status.
                </p>
                <WalletConnectButton />
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <WalletConnectButton />
                <Link href="/token" className="btn-secondary focus-ring px-3 py-2 text-xs md:text-sm">
                  Token page
                </Link>
              </div>
            )}
            {viewOnly ? (
              <p className="max-w-xs text-right text-[10px] leading-relaxed text-[var(--amber)]">
                View-only mode — balances and profile lookups only. Connect a wallet to sign or
                send SOL.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* $RIFT holding + stats */}
      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="panel relative overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg text-white">
              {projectConfig.TOKEN_SYMBOL} status
            </h3>
            <StatusChip tone="info">Read-only</StatusChip>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Holdings inform access tiers and cosmetics — not a promise of profit or rewards.
          </p>

          {!connected ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--stroke)] bg-[rgba(8,8,14,0.35)] px-4 py-5 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Connect a Solana wallet or paste an address to refresh balance and Keeper tier.
              </p>
              <div className="mt-3 flex justify-center">
                <WalletConnectButton />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="panel-inset flex flex-wrap items-end justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Balance
                  </p>
                  <p className="mt-1 font-display text-2xl text-white">
                    {balance?.balance
                      ? `${balance.balance.uiAmount} ${projectConfig.TOKEN_SYMBOL}`
                      : balanceLoading
                        ? "…"
                        : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary focus-ring px-3 py-1.5 text-xs"
                  onClick={() => void refreshBalance()}
                  disabled={balanceLoading}
                >
                  {balanceLoading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="panel-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                    Tier
                  </p>
                  <p className="mt-0.5 text-white">{keeperTier ?? "—"}</p>
                </div>
                <div className="panel-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                    Mint
                  </p>
                  <p className="mt-0.5 truncate text-white">
                    {projectConfig.TOKEN_MINT_ADDRESS === "COMING_SOON"
                      ? "Coming soon"
                      : shortWallet(projectConfig.TOKEN_MINT_ADDRESS)}
                  </p>
                </div>
              </div>
              {balance?.error ? (
                <p className="text-xs text-[var(--amber)]">{balance.error.message}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Egg}
            label="Eggs claimed"
            value={loading ? "…" : String(eggsClaimed)}
            hint="Hatchery lifetime"
          />
          <StatCard
            icon={PawPrint}
            label={`${projectConfig.CREATURE_NAME_PLURAL} owned`}
            value={loading ? "…" : String(pets.length)}
            hint="Active roster"
          />
          <StatCard
            icon={Gamepad2}
            label="Arena points"
            value={connected || pets.length > 0 ? String(DEMO_ARENA_POINTS) : "0"}
            hint="Demo · earn-only"
          />
          <StatCard
            icon={ScrollText}
            label="Quests done"
            value={String(DEMO_QUESTS_COMPLETED)}
            hint="Demo board"
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="panel overflow-hidden">
        <div
          className="flex gap-1 overflow-x-auto border-b border-[var(--stroke)] px-2 pt-2"
          role="tablist"
          aria-label="Profile sections"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(
                  "focus-ring inline-flex shrink-0 items-center gap-2 rounded-t-[var(--radius-md)] px-3 py-2.5 font-display text-xs uppercase tracking-[0.14em] transition",
                  active
                    ? "border border-b-transparent border-[var(--stroke-strong)] bg-[rgba(22,22,37,0.85)] text-[var(--cyan)]"
                    : "text-[var(--text-muted)] hover:text-white",
                )}
                onClick={() => setTab(t.id)}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 md:p-6" role="tabpanel">
          {tab === "overview" ? (
            <OverviewPanel
              pets={pets}
              loading={loading}
              connected={connected}
              viewOnly={viewOnly}
              memories={memories}
              unlockedCount={unlockedCount}
              achievementTotal={achievements.length}
            />
          ) : null}
          {tab === "pets" ? <PetsPanel pets={pets} loading={loading} /> : null}
          {tab === "loadout" ? <LoadoutPanel loadout={loadout} /> : null}
          {tab === "achievements" ? (
            <AchievementsPanel achievements={achievements} memories={memories} />
          ) : null}
          {tab === "settings" ? (
            <SettingsPanel
              nameDraft={nameDraft}
              setNameDraft={setNameDraft}
              onSave={saveDisplayName}
              nameSaved={nameSaved}
              musicMuted={musicMuted}
              connected={connected}
              viewOnly={viewOnly}
              walletShort={walletShort}
              onAvatarSelected={(src) => setSocialAvatarSrc(src)}
            />
          ) : null}
        </div>
      </section>

      {/* Activity + quick links */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg text-white">Recent activity</h3>
            <StatusChip tone="info">Demo feed</StatusChip>
          </div>
          <ul className="mt-4 space-y-2">
            {DEMO_ACTIVITY.map((item) => {
              const Icon = activityIcon(item.kind);
              return (
                <li
                  key={item.id}
                  className="panel-inset flex gap-3 px-3 py-3 transition hover:border-[rgba(61,231,255,0.3)]"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[rgba(61,231,255,0.08)] text-[var(--cyan)]">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-sm text-white">{item.title}</p>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
                        {item.at}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-lg text-white">Jump back in</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Quick routes across the Keeper shell.
          </p>
          <ul className="mt-4 space-y-2">
            {PROFILE_QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="panel-inset group flex items-center justify-between gap-3 px-3 py-3 transition hover:border-[rgba(61,231,255,0.35)]"
                >
                  <div>
                    <p className="font-display text-sm text-white group-hover:text-[var(--cyan)]">
                      {link.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{link.body}</p>
                  </div>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-dim)] group-hover:text-[var(--cyan)]"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Egg;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[rgba(61,231,255,0.08)] text-[var(--cyan)]">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="font-display text-2xl text-white">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-white">{label}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
        {hint}
      </p>
    </div>
  );
}

function OverviewPanel({
  pets,
  loading,
  connected,
  viewOnly,
  memories,
  unlockedCount,
  achievementTotal,
}: {
  pets: PetRow[];
  loading: boolean;
  connected: boolean;
  viewOnly: boolean;
  memories: { kind: string; label: string; at: string; petName: string }[];
  unlockedCount: number;
  achievementTotal: number;
}) {
  const lead = pets[0];
  const sessionLabel = !connected
    ? "Guest / local"
    : viewOnly
      ? "View-only address"
      : "Wallet linked";
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-[var(--cyan)]">
          Snapshot
        </h4>
        <div className="grid gap-2 text-sm">
          <div className="panel-inset flex justify-between gap-2 px-3 py-2">
            <span className="text-[var(--text-muted)]">Session</span>
            <span className="text-white">{sessionLabel}</span>
          </div>
          <div className="panel-inset flex justify-between gap-2 px-3 py-2">
            <span className="text-[var(--text-muted)]">Achievements</span>
            <span className="text-white">
              {unlockedCount}/{achievementTotal}
            </span>
          </div>
          <div className="panel-inset flex justify-between gap-2 px-3 py-2">
            <span className="text-[var(--text-muted)]">Memories logged</span>
            <span className="text-white">{memories.length}</span>
          </div>
          <div className="panel-inset flex justify-between gap-2 px-3 py-2">
            <span className="text-[var(--text-muted)]">Lead companion</span>
            <span className="truncate text-white">
              {loading ? "…" : (lead?.name ?? "None yet")}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-[var(--cyan)]">
          Next steps
        </h4>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {pets.length === 0 ? (
            <li className="panel-inset px-3 py-3">
              Claim a starter egg in the{" "}
              <Link href="/hatchery" className="text-[var(--cyan)] hover:underline">
                Hatchery
              </Link>
              .
            </li>
          ) : (
            <li className="panel-inset px-3 py-3">
              Check care on{" "}
              <Link
                href={`/pets/${lead!.publicId}`}
                className="text-[var(--cyan)] hover:underline"
              >
                {lead!.name}
              </Link>
              .
            </li>
          )}
          <li className="panel-inset px-3 py-3">
            Tune your{" "}
            <Link href="/arena/loadout" className="text-[var(--cyan)] hover:underline">
              Arena loadout
            </Link>{" "}
            before training.
          </li>
          {!connected ? (
            <li className="panel-inset px-3 py-3">
              Connect a wallet to unlock $RIFT tier display on this profile.
            </li>
          ) : (
            <li className="panel-inset px-3 py-3">
              Compare ranks on the{" "}
              <Link href="/leaderboards" className="text-[var(--cyan)] hover:underline">
                Leaderboards
              </Link>
              .
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function PetsPanel({ pets, loading }: { pets: PetRow[]; loading: boolean }) {
  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading roster…</p>;
  }
  if (pets.length === 0) {
    return (
      <EmptyState
        className="min-h-[10rem]"
        title="No pets yet"
        description="Claim and hatch a starter egg to populate your Keeper roster."
        imageSrc="/assets/ui/empty-states/pets.png"
        imageAlt="Empty nest waiting for a Riftling egg"
        action={
          <Link href="/hatchery" className="btn-primary focus-ring text-sm">
            Open Hatchery
          </Link>
        }
      />
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {pets.map((p) => (
        <li key={p.publicId}>
          <Link
            href={`/pets/${p.publicId}`}
            className="panel-inset flex gap-3 px-3 py-3 transition hover:border-[rgba(61,231,255,0.35)]"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(8,8,14,0.5)]">
              {p.speciesSlug ? (
                <Image
                  src={creaturePortraitPath(p.speciesSlug)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                  unoptimized
                />
              ) : (
                <Image
                  src={brandMarkPath}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-2 opacity-70"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-display text-sm text-white">{p.name}</p>
                {p.affinity ? (
                  <AffinityChip affinity={p.affinity as Exclude<AffinityFilter, "ALL">} />
                ) : null}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {p.rarity} · {p.condition}
                {typeof p.careScore === "number" ? ` · care ${p.careScore}` : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LoadoutPanel({ loadout }: { loadout: SavedLoadout | null }) {
  if (!loadout) {
    return (
      <EmptyState
        className="min-h-[10rem]"
        title="No loadout saved"
        description="Build a training loadout in the Arena — it syncs here from local storage."
        action={
          <Link href="/arena/loadout" className="btn-primary focus-ring text-sm">
            Build loadout
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke-strong)] bg-[rgba(8,8,14,0.5)]">
        <Image
          src={creaturePortraitPath(loadout.speciesSlug)}
          alt=""
          fill
          sizes="112px"
          className="object-contain p-2"
          unoptimized
        />
      </div>
      <div className="space-y-3">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[var(--cyan)]">
            Active loadout
          </p>
          <h4 className="mt-1 font-display text-xl text-white">{loadout.name}</h4>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="panel-inset px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Species
            </p>
            <p className="mt-0.5 text-white">{loadout.speciesSlug}</p>
          </div>
          <div className="panel-inset px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Affinity
            </p>
            <p className="mt-0.5 text-white">{loadout.affinity}</p>
          </div>
          <div className="panel-inset px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Weapon
            </p>
            <p className="mt-0.5 text-white">{loadout.weaponId ?? "Unequipped"}</p>
          </div>
          <div className="panel-inset px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Level
            </p>
            <p className="mt-0.5 text-white">{loadout.level}</p>
          </div>
        </div>
        <Link href="/arena/loadout" className="btn-secondary focus-ring inline-flex text-sm">
          Edit in Arena
        </Link>
      </div>
    </div>
  );
}

function AchievementsPanel({
  achievements,
  memories,
}: {
  achievements: ProfileAchievement[];
  memories: { kind: string; label: string; at: string; petName: string; petId: string }[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-[var(--cyan)]">
          Badges
        </h4>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={cn(
                "panel-inset px-3 py-3",
                !a.unlocked && "opacity-50",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm text-white">{a.label}</p>
                <StatusChip tone={achievementTone(a.rarity)}>{a.rarity}</StatusChip>
                <StatusChip tone={a.unlocked ? "live" : "default"}>
                  {a.unlocked ? "Unlocked" : "Locked"}
                </StatusChip>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-[var(--cyan)]">
          Memories
        </h4>
        {memories.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Care actions and hatch moments will appear here as memories.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {memories.map((m, i) => (
              <li key={`${m.petId}-${m.kind}-${i}`} className="panel-inset px-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-white">{m.label}</span>
                  <Link
                    href={`/pets/${m.petId}`}
                    className="text-xs text-[var(--cyan)] hover:underline"
                  >
                    {m.petName}
                  </Link>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                  {m.kind} · {new Date(m.at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SettingsPanel({
  nameDraft,
  setNameDraft,
  onSave,
  nameSaved,
  musicMuted,
  connected,
  viewOnly,
  walletShort,
  onAvatarSelected,
}: {
  nameDraft: string;
  setNameDraft: (v: string) => void;
  onSave: () => void;
  nameSaved: boolean;
  musicMuted: boolean;
  connected: boolean;
  viewOnly: boolean;
  walletShort: string | null;
  onAvatarSelected?: (src: string, key: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <AvatarPicker onSelected={onAvatarSelected} />

      <div>
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-[var(--cyan)]">
          Display name
        </h4>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Stored locally in this browser until wallet-linked profiles ship.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={32}
            className="focus-ring min-w-[12rem] flex-1 rounded-[var(--radius-md)] border border-[var(--stroke-strong)] bg-[rgba(8,8,14,0.65)] px-3 py-2 text-sm text-white"
            placeholder="Keeper"
            aria-label="Display name"
          />
          <button type="button" className="btn-primary focus-ring px-4 py-2 text-sm" onClick={onSave}>
            {nameSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="panel-inset space-y-2 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[var(--text-muted)]">Audio &amp; keybinds</span>
          <div className="flex flex-wrap gap-2">
            <Link href="/settings/audio" className="btn-secondary focus-ring text-xs">
              Audio
            </Link>
            <Link href="/settings/keybinds" className="btn-secondary focus-ring text-xs">
              Remap keys
            </Link>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          WASD, map (M), chat (Enter), and HUD hotkeys — conflicts are highlighted on the keybinds
          page.
        </p>
      </div>

      <div className="panel-inset space-y-2 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[var(--text-muted)]">Music mute</span>
          <StatusChip tone={musicMuted ? "warn" : "live"}>
            {musicMuted ? "Muted" : "Audible"}
          </StatusChip>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Use the floating music player in the shell chrome to mute or change tracks. Preferences
          sync via <code className="text-[var(--cyan)]">riftwilds-music-prefs</code>.
        </p>
      </div>

      <div className="panel-inset space-y-2 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[var(--text-muted)]">Wallet privacy</span>
          <div className="flex flex-wrap items-center gap-2">
            {viewOnly ? <StatusChip tone="warn">View-only</StatusChip> : null}
            <StatusChip tone="info">{connected ? walletShort : "Hidden"}</StatusChip>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Addresses show abbreviated by default (ABCD…WXYZ). Full address never appears in the
          public header.
          {viewOnly
            ? " Pasted addresses are view-only and cannot sign or send transactions."
            : ""}
        </p>
      </div>

      <div className="panel-inset space-y-1 px-4 py-3 text-sm">
        <p className="text-[var(--text-muted)]">Universe</p>
        <p className="text-white">{projectConfig.UNIVERSE_NAME}</p>
        <p className="text-xs text-[var(--text-dim)]">Timezone: local browser</p>
      </div>
    </div>
  );
}
