"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { SocialAvatarCatalog, SocialAvatarOption } from "@/lib/social/avatars";
import { brandMarkPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Called after a successful set so the hub can refresh `me.avatarSrc`. */
  onSelected?: (src: string, key: string) => void;
  className?: string;
};

const RIFTLING_PREVIEW_COUNT = 20;

function OptionButton({
  option,
  selected,
  pending,
  onPick,
  onBuyCredits,
  onBuySol,
}: {
  option: SocialAvatarOption;
  selected: boolean;
  pending: boolean;
  onPick: (key: string) => void;
  onBuyCredits?: (slug: string) => void;
  onBuySol?: (slug: string) => void;
}) {
  const paths = option.unlockPaths;
  const slug = option.key.startsWith("species:") ? option.key.slice("species:".length) : null;
  const showBuy = !option.unlocked && option.kind === "species" && slug && paths;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-2 text-center transition",
        selected
          ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.12)]"
          : "border-[var(--stroke)] bg-[rgba(0,0,0,0.2)]",
        !option.unlocked && "opacity-80",
      )}
    >
      <button
        type="button"
        disabled={pending || !option.unlocked}
        onClick={() => onPick(option.key)}
        title={
          option.lockedReason ??
          `${option.label}${option.subtitle ? ` — ${option.subtitle}` : ""}`
        }
        className={cn(
          "focus-ring group flex flex-col items-center gap-1.5",
          !option.unlocked && "cursor-not-allowed",
        )}
        aria-pressed={selected}
        aria-label={
          option.unlocked
            ? `Use ${option.label} as avatar`
            : `${option.label} locked — ${option.lockedReason ?? "complete a task or buy"}`
        }
      >
        <span className="relative h-14 w-14 overflow-hidden rounded-full border border-[var(--stroke)] bg-[rgba(8,8,14,0.6)]">
          <Image
            src={option.thumbSrc || option.src}
            alt=""
            fill
            sizes="56px"
            className={cn("object-cover", !option.unlocked && "grayscale-[0.35]")}
            unoptimized
          />
          {!option.unlocked ? (
            <span
              className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.45)] text-[10px] font-semibold uppercase tracking-wide text-white"
              aria-hidden
            >
              Locked
            </span>
          ) : null}
        </span>
        <span className="line-clamp-2 w-full text-[11px] leading-tight text-white">{option.label}</span>
        {option.subtitle ? (
          <span className="line-clamp-2 w-full text-[10px] text-[var(--text-dim)]">{option.subtitle}</span>
        ) : null}
      </button>

      {showBuy && paths ? (
        <div className="flex flex-col gap-1">
          {paths.task && !paths.task.met ? (
            <p className="text-[9px] leading-snug text-[var(--text-dim)]">
              Task: {paths.task.label} ({Math.min(paths.task.current, paths.task.target)}/
              {paths.task.target})
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => onBuyCredits?.(slug)}
            className="focus-ring rounded border border-[var(--stroke-strong)] bg-[rgba(255,200,80,0.12)] px-1.5 py-1 text-[10px] text-[var(--amber,#ffc850)] hover:border-[var(--amber,#ffc850)]"
          >
            Buy {paths.creditsPrice} Credits
          </button>
          <button
            type="button"
            disabled={pending || !paths.solPurchaseEnabled}
            onClick={() => onBuySol?.(slug)}
            title={
              paths.solPurchaseEnabled
                ? `Buy with ${paths.solPrice} SOL (optional)`
                : `${paths.solPrice} SOL — coming soon`
            }
            className={cn(
              "focus-ring rounded border px-1.5 py-1 text-[10px]",
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

  function buyCredits(speciesSlug: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "purchase_credits",
          speciesSlug,
          requestId: `ui-avatar-credits:${speciesSlug}:${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Could not buy avatar.");
        return;
      }
      if (data.catalog) setCatalog(data.catalog as SocialAvatarCatalog);
      else load();
      setMessage("Avatar unlocked with Credits. Cosmetic only — no gameplay power.");
    });
  }

  function buySol(speciesSlug: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "purchase_sol",
          speciesSlug,
          requestId: `ui-avatar-sol:${speciesSlug}:${Date.now()}`,
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
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-display text-lg text-white">Riftling avatars</h3>
        <p className="mt-1 text-xs text-[var(--text-dim)]">
          Free starters, task unlocks, or Credits. SOL optional and never required. Cosmetics only —
          no pets or power.
        </p>
        {catalog?.unlockSummary ? (
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {catalog.unlockSummary.unlocked}/{catalog.unlockSummary.total} unlocked ·{" "}
            {catalog.unlockSummary.freeStarters} free starters
          </p>
        ) : null}
      </div>

      {catalog ? (
        <div className="flex items-center gap-3">
          <span className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--stroke-strong)]">
            <Image
              src={catalog.selectedSrc || brandMarkPath}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </span>
          <p className="text-xs text-[var(--text-muted)]">
            Current selection
            {catalog.selectedKey ? (
              <span className="mt-0.5 block font-mono text-[10px] text-[var(--text-dim)]">
                {catalog.selectedKey}
              </span>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Loading avatars…</p>
      )}

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
        const options =
          isRiftlings && !showAllRiftlings
            ? section.options.slice(0, RIFTLING_PREVIEW_COUNT)
            : section.options;
        const hiddenCount =
          isRiftlings && !showAllRiftlings
            ? Math.max(0, section.options.length - RIFTLING_PREVIEW_COUNT)
            : 0;

        return (
          <div key={section.id}>
            <h4 className="font-display text-sm text-white">{section.title}</h4>
            <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">{section.description}</p>
            {section.options.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">No options in this section yet.</p>
            ) : (
              <>
                <div
                  className={cn(
                    "mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5",
                    isRiftlings && showAllRiftlings && "max-h-[28rem] overflow-y-auto pr-1",
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
                    />
                  ))}
                </div>
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="focus-ring mt-2 text-xs text-[var(--cyan)] underline-offset-2 hover:underline"
                    onClick={() => setShowAllRiftlings(true)}
                  >
                    Show all {section.options.length} Riftling avatars (+{hiddenCount} more)
                  </button>
                ) : null}
                {isRiftlings && showAllRiftlings && section.options.length > RIFTLING_PREVIEW_COUNT ? (
                  <button
                    type="button"
                    className="focus-ring mt-2 text-xs text-[var(--text-muted)] underline-offset-2 hover:underline"
                    onClick={() => setShowAllRiftlings(false)}
                  >
                    Show fewer
                  </button>
                ) : null}
              </>
            )}
          </div>
        );
      })}

      {catalog?.cosmeticsNote ? (
        <p className="text-[11px] text-[var(--text-dim)]">{catalog.cosmeticsNote}</p>
      ) : null}
    </div>
  );
}
