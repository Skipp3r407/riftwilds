import type { DirtyFlags, SaveCategory } from "@/lib/persistence/types";

export function emptyDirtyFlags(): DirtyFlags {
  return {
    categoryA: false,
    categoryB: false,
    categoryC: false,
    position: false,
    combat: false,
  };
}

export function markDirty(flags: DirtyFlags, category: SaveCategory | "position" | "combat"): DirtyFlags {
  const next = { ...flags };
  switch (category) {
    case "A_CRITICAL":
      next.categoryA = true;
      break;
    case "B_PROGRESSION":
      next.categoryB = true;
      break;
    case "C_COSMETIC":
      next.categoryC = true;
      break;
    case "position":
      next.position = true;
      break;
    case "combat":
      next.combat = true;
      break;
  }
  return next;
}

export function clearDirty(flags: DirtyFlags, categories: SaveCategory[]): DirtyFlags {
  const next = { ...flags };
  for (const c of categories) {
    if (c === "A_CRITICAL") next.categoryA = false;
    if (c === "B_PROGRESSION") next.categoryB = false;
    if (c === "C_COSMETIC") next.categoryC = false;
  }
  return next;
}

export function anyDirty(flags: DirtyFlags): boolean {
  return (
    flags.categoryA ||
    flags.categoryB ||
    flags.categoryC ||
    flags.position ||
    flags.combat
  );
}

export function categoriesFromDirty(flags: DirtyFlags): SaveCategory[] {
  const out: SaveCategory[] = [];
  if (flags.categoryA) out.push("A_CRITICAL");
  if (flags.categoryB) out.push("B_PROGRESSION");
  if (flags.categoryC) out.push("C_COSMETIC");
  return out;
}
