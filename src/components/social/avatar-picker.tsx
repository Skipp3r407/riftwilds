"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { RarityBadge } from "@/components/items/rarity-badge";
import { RiftPanel } from "@/components/ui/rift-panel";
import type { SocialAvatarCatalog, SocialAvatarOption } from "@/lib/social/avatars";
import { brandMarkPath } from "@/lib/assets/paths";
import { RARITY_VISUAL } from "@/lib/items/rarity";
import type { ItemRarity } from "@/lib/items/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Called after a successful set so the hub can refresh `me.avatarSrc`. */
  onSelected?: (src: string, key: string) => void;
  className?: string;
};

const RIFTLING_PREVIEW_COUNT = 20;

const SECTION_COPY: Record<
  string,
  { eyebrow: string; material: "obsidian" | "marble" | "arcane" | "gold" }
> = {
  pets: { eyebrow: "Your hatchery", material: "arcane" },
  riftlings: { eyebrow: "Species cosmetics", material: "obsidian" },
  characters: { eyebrow: "Portrait unlocks", material: "marble" },
  brand: { eyebrow: "Marks", material: "gold" },
};

function rarityBorder(rarity: ItemRarity | undefined, selected: boolean) {
  if (selected) return { borderColor: "var(--cyan)", boxShadow: "0 0 18px rgba(61,231,255,0.28)" };
  if (!rarity) return undefined;
  const v = RARITY_VISUAL[rarity];
  return {
    borderColor: `${v.border}99`,
    boxShadow: `0 0 16px ${v.glow}`,
  };
}

function OptionButton({
  option,
  selected,
  pending,
  onPick,
  onBuyCredits,
  onBuySol,
  portraitSize = "md",
}: {
  option: SocialAvatarOption;
  selected: boolean;
  pending: boolean;
  onPick: (key: string) => void;
  onBuyCredits?: (avatarKey: string) => void;
  onBuySol?: (avatarKey: string) => void;
  portraitSize?: "sm" | "md";
}) {
  const paths = option.unlockPaths;
  const showBuy =
    !option.unlocked &&
    Boolean(paths) &&
    (option.kind === "species" || option.kind === "npc" || option.kind === "lore");
  const showRarity = Boolean(option.purchasable && option.rarity);
  const px = portraitSize === "sm" ? "h-12 w-12" : "h-16 w-16";
  const imgSize = portraitSize === "sm" ? "48px" : "64px";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-1.5 overflow-hidden rounded-xl border p-2.5 text-center transition",
        selected ? "bg-[rgba(61,231,255,0.1)]" : "bg-[rgba(0,0,0,0.28)]",
        !option.unlocked && "opacity-90",
      )}
      style={rarityBorder(showRarity ? option.rarity : undefined, selected)}
    >
      {option.bgSrc ? (
        <span className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={option.bgSrc}
            alt=""
            fill
            sizes="160px"
            className="object-cover opacity-55"
            unoptimized
          />
          <span className="absolute inset-0 bg-gradient-to-b from-[rgba(4,6,12,0.25)] via-[rgba(4,6,12,0.55)] to-[rgba(4,6,12,0.88)]" />
        </span>
      ) : null}

      <button
        type="button"
        disabled={pending || !option.unlocked}
        onClick={() => onPick(option.key)}
        title={
          option.lockedReason ??
          `${option.label}${option.subtitle ? ` — ${option.subtitle}` : ""}`
        }
        className={cn(
          "focus-ring relative z-[1] group flex flex-col items-center gap-1.5",
          !option.unlocked && "cursor-not-allowed",
        )}
        aria-pressed={selected}
        aria-label={
          option.unlocked
            ? `Use ${option.label} as avatar`
            : `${option.label} locked — ${option.lockedReason ?? "complete a task or buy"}`
        }
      >
        <span
          className={cn(
            "relative overflow-hidden rounded-full border bg-[rgba(8,8,14,0.55)]",
            px,
            selected ? "border-[var(--cyan)]" : "border-[var(--stroke-strong)]",
          )}
          style={
            showRarity && option.rarity
              ? { boxShadow: `0 0 14px ${RARITY_VISUAL[option.rarity].glow}` }
              : undefined
          }
        >
          {option.bgSrc ? (
            <Image
              src={option.bgSrc}
              alt=""
              fill
              sizes={imgSize}
              className="object-cover opacity-70"
              unoptimized
            />
          ) : null}
          <Image
            src={option.thumbSrc || option.src}
            alt=""
            fill
            sizes={imgSize}
            className={cn("object-cover", !option.unlocked && "grayscale-[0.4] brightness-90")}
            unoptimized
          />
          {!option.unlocked ? (
            <span
              className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.52)] text-[9px] font-semibold uppercase tracking-wide text-white"
              aria-hidden
            >
              Locked
            </span>
          ) : null}
        </span>

        {showRarity && option.rarity ? (
          <RarityBadge rarity={option.rarity} className="scale-90 px-1.5 py-0" />
        ) : null}

        <span className="line-clamp-2 w-full text-[11px] font-medium leading-tight text-white">
          {option.label}
        </span>
        {option.subtitle ? (
          <span className="line-clamp-2 w-full text-[10px] text-[var(--text-dim)]">
            {option.subtitle}
          </span>
        ) : null}
      </button>

      {showBuy && paths ? (
        <div className="relative z-[1] flex flex-col gap-1">
          {option.kind === "npc" || option.kind === "lore" ? (
            <p className="text-[9px] leading-snug text-[var(--text-dim)]">
              Portrait unlock · cosmetic keeper skin
            </p>
          ) : null}
          {paths.task && !paths.task.met ? (
            <p className="text-[9px] leading-snug text-[var(--text-dim)]">
              Task: {paths.task.label} ({Math.min(paths.task.current, paths.task.target)}/
              {paths.task.target})
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => onBuyCredits?.(option.key)}
            className="focus-ring rounded-md border border-[var(--stroke-strong)] bg-[rgba(255,200,80,0.14)] px-1.5 py-1.5 text-[10px] font-medium text-[var(--amber,#ffc850)] hover:border-[var(--amber,#ffc850)]"
          >
            Buy {paths.creditsPrice} Credits
          </button>
          <button
            type="button"
            disabled={pending || !paths.solPurchaseEnabled}
            onClick={() => onBuySol?.(option.key)}
            title={
              paths.solPurchaseEnabled
                ? `Buy with ${paths.solPrice} SOL (optional)`
                : `${paths.solPrice} SOL — coming soon`
            }
            className={cn(
              "focus-ring rounded-md border px-1.5 py-1 text-[10px]",
              paths.solPurchaseEnabled
                ? "border-[var(--cyan)] text-[var(--cyan)] hover:bg-[rgba(61,231,255,0.08)]"
                : "cursor-not-allowed border-[var(--stroke)] text-[var(--text-dim)] opacity-70",
            )}
          >
            {paths.solPurchaseEnabled
              ? `${paths.solPrice} SOL`
              : `${paths.solPrice} SOL · soon`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AvatarPicker({ onSelected, className }: Props) {
  const [pending, startTransition] = useTransition();
  const [catalog, setCatalog] = useState<SocialAvatarCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showAllRiftlings, setShowAllRiftlings] = useState(false);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/social/avatars");
        const data = await res.json();
        if (!data.ok) {
          setError(data.message ?? "Could not load avatars.");
          return;
        }
        setCatalog({
          selectedKey: data.selectedKey ?? null,
          selectedSrc: data.selectedSrc ?? brandMarkPath,
          sections: data.sections ?? [],
          cosmeticsNote: data.cosmeticsNote ?? "",
          unlockSummary: data.unlockSummary ?? {
            total: 0,
            freeStarters: 0,
            unlocked: 0,
            locked: 0,
          },
        });
      } catch {
        setError("Could not load avatars.");
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function pick(key: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "key", key }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Could not set avatar.");
        return;
      }
      if (data.catalog) {
        setCatalog(data.catalog as SocialAvatarCatalog);
      } else {
        load();
      }
      setMessage("Avatar updated.");
      if (data.src && data.key) onSelected?.(data.src as string, data.key as string);
    });
  }

  function buyCredits(avatarKey: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "purchase_credits",
          avatarKey,
          requestId: `ui-avatar-credits:${avatarKey}:${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Could not buy avatar.");
        return;
      }
      if (data.catalog) setCatalog(data.catalog as SocialAvatarCatalog);
      else load();
      setMessage(
        avatarKey.startsWith("npc:") || avatarKey.startsWith("lore:")
          ? "Portrait unlocked with Credits. Cosmetic keeper skin — no gameplay power."
          : "Avatar unlocked with Credits. Cosmetic only — no gameplay power.",
      );
    });
  }

  function buySol(avatarKey: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "purchase_sol",
          avatarKey,
          requestId: `ui-avatar-sol:${avatarKey}:${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "SOL purchase unavailable.");
        return;
      }
      if (data.catalog) setCatalog(data.catalog as SocialAvatarCatalog);
      else load();
      setMessage(data.note ?? "Avatar unlocked (SOL). Cosmetic only.");
    });
  }

  return (
    <div className={cn("space-y-5", className)}>
      <RiftPanel material="arcane" filigree padding="md" className="overflow-hidden">
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-4 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 20% 0%, rgba(61,231,255,0.22), transparent 55%), radial-gradient(ellipse at 90% 40%, rgba(168,85,247,0.14), transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
                Keeper look
              </p>
              <h3 className="font-display mt-1 text-xl text-white md:text-2xl">Riftling avatars</h3>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-[var(--text-dim)]">
                Free starters, task unlocks, or Credits. SOL is optional and never required.
                Cosmetics only — no pets or power.
              </p>
              {catalog?.unlockSummary ? (
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  <span className="text-[var(--cyan)]">
                    {catalog.unlockSummary.unlocked}/{catalog.unlockSummary.total}
                  </span>{" "}
                  unlocked · {catalog.unlockSummary.freeStarters} free starters · paid tiers show
                  rarity
                </p>
              ) : null}
            </div>

            {catalog ? (
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[rgba(0,0,0,0.35)] p-2.5">
                <span className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border border-[var(--stroke-strong)] shadow-[0_0_24px_rgba(61,231,255,0.2)]">
                  <Image
                    src={catalog.selectedSrc || brandMarkPath}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    Current selection
                  </p>
                  {catalog.selectedKey ? (
                    <p className="mt-0.5 max-w-[10rem] truncate font-mono text-[10px] text-[var(--text-muted)]">
                      {catalog.selectedKey}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">None yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Loading avatars…</p>
            )}
          </div>
        </div>
      </RiftPanel>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--cyan)]" role="status">
          {message}
        </p>
      ) : null}

      {catalog?.sections.map((section) => {
        const isRiftlings = section.id === "riftlings";
        const isCharacters = section.id === "characters";
        const meta = SECTION_COPY[section.id] ?? {
          eyebrow: "Collection",
          material: "obsidian" as const,
        };
        const options =
          isRiftlings && !showAllRiftlings
            ? section.options.slice(0, RIFTLING_PREVIEW_COUNT)
            : section.options;
        const hiddenCount =
          isRiftlings && !showAllRiftlings
            ? Math.max(0, section.options.length - RIFTLING_PREVIEW_COUNT)
            : 0;

        return (
          <RiftPanel
            key={section.id}
            material={meta.material}
            filigree
            padding="md"
            className="overflow-hidden"
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--stroke)] pb-3">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.26em] text-[var(--cyan)]">
                  {meta.eyebrow}
                </p>
                <h4 className="font-display mt-1 text-lg text-white md:text-xl">{section.title}</h4>
                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[var(--text-dim)]">
                  {section.description}
                </p>
              </div>
              <p className="text-[11px] tabular-nums text-[var(--text-muted)]">
                {section.options.length} {section.options.length === 1 ? "option" : "options"}
              </p>
            </div>

            {section.options.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--stroke)] bg-[rgba(0,0,0,0.2)] px-4 py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  {section.id === "pets"
                    ? "No hatchery pets yet — open the Hatchery to grow a personal avatar."
                    : "No options in this section yet."}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-2.5",
                    isCharacters
                      ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                    isRiftlings && showAllRiftlings && "max-h-[32rem] overflow-y-auto pr-1",
                  )}
                >
                  {options.map((option) => (
                    <OptionButton
                      key={option.key}
                      option={option}
                      selected={catalog.selectedKey === option.key}
                      pending={pending}
                      onPick={pick}
                      onBuyCredits={buyCredits}
                      onBuySol={buySol}
                      portraitSize={isCharacters || section.id === "brand" ? "sm" : "md"}
                    />
                  ))}
                </div>
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="focus-ring mt-3 text-xs text-[var(--cyan)] underline-offset-2 hover:underline"
                    onClick={() => setShowAllRiftlings(true)}
                  >
                    Show all {section.options.length} Riftling avatars (+{hiddenCount} more)
                  </button>
                ) : null}
                {isRiftlings &&
                showAllRiftlings &&
                section.options.length > RIFTLING_PREVIEW_COUNT ? (
                  <button
                    type="button"
                    className="focus-ring mt-3 text-xs text-[var(--text-muted)] underline-offset-2 hover:underline"
                    onClick={() => setShowAllRiftlings(false)}
                  >
                    Show fewer
                  </button>
                ) : null}
              </>
            )}
          </RiftPanel>
        );
      })}

      {catalog?.cosmeticsNote ? (
        <p className="text-[11px] leading-relaxed text-[var(--text-dim)]">{catalog.cosmeticsNote}</p>
      ) : null}
    </div>
  );
}
