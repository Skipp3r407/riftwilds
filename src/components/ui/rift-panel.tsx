import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type RiftMaterial = "obsidian" | "marble" | "gold" | "arcane";

export type RiftPanelProps = HTMLAttributes<HTMLDivElement> & {
  material?: RiftMaterial;
  /** Corner filigree brackets (cyan/amber). Default true. */
  filigree?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  children: ReactNode;
};

const padClass: Record<NonNullable<RiftPanelProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 md:p-5",
  lg: "p-5 md:p-6",
};

/**
 * Handcrafted material panel — obsidian / marble / gold / arcane glass.
 * Prefer over bare `.panel` on TCG & meta surfaces.
 */
export function RiftPanel({
  material = "obsidian",
  filigree = true,
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: RiftPanelProps) {
  return (
    <div
      className={cn(
        "rift-panel",
        `rift-material-${material}`,
        filigree && "rift-panel--filigree",
        interactive && "rift-panel--interactive panel-interactive",
        padClass[padding],
        className,
      )}
      {...rest}
    >
      <div className="rift-panel__grain" aria-hidden />
      <div className="rift-panel__content">{children}</div>
    </div>
  );
}
