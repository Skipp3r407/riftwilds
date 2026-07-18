"use client";

import Image from "next/image";
import type { CareActionDef } from "@/game/creatures/care-catalog";
import { cn } from "@/lib/utils/cn";

const ICON_BY_ACTION: Record<string, string> = {
  FEED: "feed",
  GIVE_WATER: "water",
  PLAY: "play",
  CLEAN: "clean",
  REST: "rest",
  SLEEP: "sleep",
  HEAL: "heal",
  MEDICINE: "medicine",
  RECOVERY_CENTER: "recovery",
  BRUSH: "brush",
  TRAIN: "train",
  WALK: "walk",
  PET: "pet",
  GROOM: "groom",
  COOK_MEAL: "cook",
  TREAT: "treat",
  VET: "vet",
  ADVENTURE: "adventure",
  EXERCISE: "exercise",
  LEARN_TRICK: "trick",
  MEDITATE: "meditate",
  SOCIALIZE: "socialize",
  DECORATE: "decorate",
  ENCOURAGE: "encourage",
  GIVE_ITEM: "item",
};

function formatDeltas(def: CareActionDef): string {
  return Object.entries(def.expectedDeltas)
    .map(([k, v]) => `${k} ${v! >= 0 ? "+" : ""}${v}`)
    .join(", ");
}

export function careActionIconPath(action: string): string {
  const key = ICON_BY_ACTION[action] ?? "pet";
  return `/assets/ui/pets/care/${key}.svg`;
}

export function CareActionButton({
  def,
  busy,
  disabled,
  creditsBalance,
  onClick,
}: {
  def: CareActionDef;
  busy: boolean;
  disabled?: boolean;
  creditsBalance: number | null;
  onClick: () => void;
}) {
  const free = def.creditCost === 0;
  const cannotAfford =
    !free && creditsBalance != null && creditsBalance < def.creditCost;
  const costLabel = free
    ? def.energyCost > 0
      ? `${def.energyCost} Energy`
      : "Free"
    : `${def.creditCost} Credits`;

  const title = [
    def.description,
    `Cost: ${costLabel}`,
    `Cooldown: ${Math.round(def.cooldownMs / 1000)}s`,
    `Duration: ${def.durationLabel}`,
    `Effects: ${formatDeltas(def)}`,
    `Care XP: +${def.careXp}`,
    "Never requires SOL",
  ].join("\n");

  return (
    <button
      type="button"
      title={title}
      aria-label={`${def.label}. ${costLabel}. ${def.description}`}
      disabled={disabled || busy || cannotAfford}
      onClick={onClick}
      className={cn(
        "focus-ring group relative flex min-h-11 min-w-[7.5rem] flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition",
        "border-[var(--stroke)] bg-[rgba(10,18,32,0.55)] hover:border-[var(--cyan)] hover:bg-[rgba(56,189,248,0.1)]",
        (busy || cannotAfford) && "opacity-55",
        free && "border-[rgba(61,255,176,0.35)]",
      )}
    >
      <span className="flex w-full items-center gap-2">
        <Image
          src={careActionIconPath(def.action)}
          alt=""
          width={22}
          height={22}
          className="shrink-0 opacity-95"
          aria-hidden
        />
        <span className="text-xs font-medium text-white">{busy ? "…" : def.label}</span>
      </span>
      <span className="pl-7 text-[10px] tabular-nums text-[var(--text-muted)]">
        {costLabel}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-[var(--stroke)] bg-[rgba(8,14,24,0.96)] p-2 text-[10px] leading-relaxed text-[var(--text-muted)] shadow-lg group-hover:block group-focus-visible:block"
      >
        <span className="block text-white">{def.label}</span>
        <span className="mt-1 block">{def.description}</span>
        <span className="mt-1 block">Cost: {costLabel}</span>
        <span className="block">Cooldown: {Math.round(def.cooldownMs / 1000)}s · {def.durationLabel}</span>
        <span className="block">Δ {formatDeltas(def)}</span>
        <span className="mt-1 block text-[var(--cyan)]">Credits only — never SOL</span>
      </span>
    </button>
  );
}
