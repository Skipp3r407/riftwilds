import type { ItemRarity } from "@/lib/items/types";
import { RARITY_VISUAL } from "@/lib/items/rarity";
import { cn } from "@/lib/utils/cn";

export function RarityBadge({
  rarity,
  className,
}: {
  rarity: ItemRarity;
  className?: string;
}) {
  const v = RARITY_VISUAL[rarity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        className,
      )}
      style={{
        color: v.border,
        border: `1px solid ${v.border}`,
        boxShadow: `0 0 12px ${v.glow}`,
        background: "rgba(0,0,0,0.35)",
      }}
    >
      {v.label}
    </span>
  );
}

export function RarityFrame({
  rarity,
  children,
  className,
}: {
  rarity: ItemRarity;
  children: React.ReactNode;
  className?: string;
}) {
  const v = RARITY_VISUAL[rarity];
  return (
    <div
      className={cn(
        "rounded-md p-[1px] transition-[box-shadow,filter,transform] duration-300",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${v.border}, transparent 58%)`,
        boxShadow: `0 0 22px ${v.glow}, 0 0 48px ${v.glow}`,
      }}
    >
      <div className="h-full rounded-[calc(var(--radius-md)-1px)] bg-[var(--bg-glass)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}
