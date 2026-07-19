/**
 * Social profile avatars — owned pets, Riftling species cosmetics, characters.
 * Persists as SocialProfile.avatarSrc (+ avatarKey) on the in-memory social store.
 * Species unlocks: free starters · owned pet · tasks · Credits · optional SOL.
 */

import { getPet, listPetsForOwner } from "@/game/eggs/hatchery-store";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { NAMED_NPCS } from "@/content/npcs";
import {
  brandMarkPath,
  creaturePortraitPath,
  creatureThumbPath,
} from "@/lib/assets/paths";
import {
  brandAvatarKey,
  isStarterRiftlingAvatarSlug,
  loreAvatarKey,
  npcAvatarKey,
  petAvatarKey,
  speciesAvatarKey,
  STARTER_RIFTLING_AVATAR_SLUGS,
} from "@/lib/social/avatar-keys";
import {
  avatarBackgroundFallback,
  avatarBackgroundForSpecies,
} from "@/lib/social/avatar-backgrounds";
import {
  evaluateSpeciesAvatarUnlock,
  isRiftlingAvatarSlug,
  listRiftlingAvatarSlugs,
  type AvatarUnlockPaths,
} from "@/lib/social/avatar-unlocks";
import { getSocialStore } from "@/lib/social/store";
import type { SocialProfile } from "@/lib/social/types";
import type { ItemRarity } from "@/lib/items/types";

const AVATAR_RARITIES: readonly ItemRarity[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "CELESTIAL",
];

/** Normalize species rarityBias → ItemRarity for badges / borders. */
export function normalizeAvatarRarity(raw: string | undefined | null): ItemRarity {
  const key = (raw ?? "COMMON").trim().toUpperCase();
  if ((AVATAR_RARITIES as readonly string[]).includes(key)) return key as ItemRarity;
  return "COMMON";
}

export {
  brandAvatarKey,
  isStarterRiftlingAvatarSlug,
  loreAvatarKey,
  npcAvatarKey,
  petAvatarKey,
  speciesAvatarKey,
  STARTER_RIFTLING_AVATAR_SLUGS,
} from "@/lib/social/avatar-keys";

/** Caller must `ensureSocialProfile` first. */
function requireProfile(ownerKey: string): SocialProfile {
  const profile = getSocialStore().profiles.get(ownerKey);
  if (!profile) {
    throw new Error(`social_profile_missing:${ownerKey}`);
  }
  return profile;
}

export type SocialAvatarKind = "pet" | "species" | "npc" | "lore" | "brand";

export type SocialAvatarOption = {
  key: string;
  kind: SocialAvatarKind;
  label: string;
  subtitle?: string;
  /** Display / persist path (portrait quality). */
  src: string;
  /** Lighter thumb for dense picker grids. */
  thumbSrc: string;
  unlocked: boolean;
  lockedReason?: string;
  /** Species cosmetics — unlock / purchase paths. */
  unlockPaths?: AvatarUnlockPaths;
  /**
   * Collection rarity for purchasable / non-starter Riftlings.
   * Cosmetic only — maps to Credits/SOL price bands.
   */
  rarity?: ItemRarity;
  /** Affinity key (EMBER, GROVE, …) for species cards. */
  affinity?: string;
  /** Scenic plate behind the portrait (affinity-themed). */
  bgSrc?: string;
  /** True when this cosmetic can be bought with Credits / optional SOL. */
  purchasable?: boolean;
};

export type SocialAvatarSection = {
  id: "pets" | "riftlings" | "characters" | "brand";
  title: string;
  description: string;
  options: SocialAvatarOption[];
};

export type SocialAvatarCatalog = {
  selectedKey: string | null;
  selectedSrc: string;
  sections: SocialAvatarSection[];
  /** Cosmetics disclaimer for UI. */
  cosmeticsNote: string;
  unlockSummary: {
    total: number;
    freeStarters: number;
    unlocked: number;
    locked: number;
  };
};

export type SetAvatarInput =
  | { kind: "pet"; petPublicId: string }
  | { kind: "species"; speciesSlug: string }
  | { kind: "npc"; npcSlug: string }
  | { kind: "lore"; characterId: string }
  | { kind: "brand"; brandId?: string };

/**
 * Curated lore / hero portraits (avoid importing the full About module).
 * Elara Venn lives in NAMED_NPCS — do not duplicate her here.
 */
const LORE_AVATARS: Array<{
  id: string;
  label: string;
  subtitle: string;
  src: string;
}> = [
  {
    id: "first-riftling",
    label: "The First Riftling",
    subtitle: "Origin companion",
    src: "/assets/about/comic/comic-first-riftling-hatch.png",
  },
];

const BRAND_AVATARS: Array<{
  id: string;
  label: string;
  subtitle: string;
  src: string;
}> = [
  {
    id: "mark",
    label: "Riftwilds Mark",
    subtitle: "Brand emblem",
    src: brandMarkPath,
  },
];

function stripQuery(src: string): string {
  return src.split("?")[0] ?? src;
}

/** Named active NPCs unlocked by default as cosmetic avatars. */
export function listCharacterAvatarOptions(): SocialAvatarOption[] {
  const npcs: SocialAvatarOption[] = NAMED_NPCS.filter((n) => n.active).map((n) => ({
    key: npcAvatarKey(n.slug),
    kind: "npc" as const,
    label: n.displayName,
    subtitle: n.title || n.occupation || "Keeper",
    src: n.portraitAsset,
    thumbSrc: n.thumbnailAsset || n.portraitAsset,
    unlocked: true,
    // Distinct commons/rift plates so keeper cards don't share one flat back.
    bgSrc: avatarBackgroundForSpecies(n.slug, "RIFT"),
  }));

  const lore: SocialAvatarOption[] = LORE_AVATARS.map((c) => ({
    key: loreAvatarKey(c.id),
    kind: "lore" as const,
    label: c.label,
    subtitle: c.subtitle,
    src: c.src,
    thumbSrc: c.src,
    unlocked: true,
    bgSrc: avatarBackgroundForSpecies(c.id, "SPIRIT"),
  }));

  return [...npcs, ...lore].sort((a, b) => a.label.localeCompare(b.label));
}

export function listBrandAvatarOptions(): SocialAvatarOption[] {
  return BRAND_AVATARS.map((b) => ({
    key: brandAvatarKey(b.id),
    kind: "brand" as const,
    label: b.label,
    subtitle: b.subtitle,
    src: b.src,
    thumbSrc: stripQuery(b.src),
    unlocked: true,
    bgSrc: avatarBackgroundFallback(),
  }));
}

/** Owned hatchery pets — personal Riftling avatars. */
export function listPetAvatarOptions(ownerKey: string): SocialAvatarOption[] {
  return listPetsForOwner(ownerKey).map((pet) => {
    const species = getSpeciesBySlug(pet.speciesSlug);
    const affinity = species?.affinity ?? "RIFT";
    return {
      key: petAvatarKey(pet.publicId),
      kind: "pet" as const,
      label: pet.name,
      subtitle: pet.speciesName,
      src: creaturePortraitPath(pet.speciesSlug),
      thumbSrc: creatureThumbPath(pet.speciesSlug),
      unlocked: true,
      affinity,
      rarity: normalizeAvatarRarity(species?.rarityBias),
      bgSrc: avatarBackgroundForSpecies(pet.speciesSlug, affinity),
    };
  });
}

/**
 * Launch species portraits (cosmetic). Starters free; others via task / Credits / optional SOL.
 * Owning a hatchery pet of that species unlocks it for free.
 */
export function listSpeciesAvatarOptions(ownerKey?: string): SocialAvatarOption[] {
  const slugs = listRiftlingAvatarSlugs();
  return slugs.map((slug) => {
    const species = getSpeciesBySlug(slug);
    const evald = ownerKey ? evaluateSpeciesAvatarUnlock(ownerKey, slug) : null;
    const unlocked = evald?.unlocked ?? isStarterRiftlingAvatarSlug(slug);
    const rarity = normalizeAvatarRarity(species?.rarityBias);
    const affinity = species?.affinity ?? "RIFT";
    const freeStarter = evald?.paths.freeStarter ?? isStarterRiftlingAvatarSlug(slug);
    const purchasable = !freeStarter;
    let subtitle = `${affinity} · ${rarity.toLowerCase()}`;
    if (freeStarter) subtitle = `${affinity} · free starter`;
    else if (evald?.paths.ownedPet) subtitle = `${affinity} · ${rarity.toLowerCase()} · owned`;
    else if (!unlocked) {
      const price = evald?.paths.creditsPrice;
      subtitle =
        price != null
          ? `${rarity} · Locked · ${price} Credits`
          : `${rarity} · Locked`;
    } else if (unlocked && evald?.paths.purchased) {
      subtitle = `${affinity} · ${rarity.toLowerCase()} · unlocked`;
    } else if (unlocked && evald?.paths.task?.met) {
      subtitle = `${affinity} · ${rarity.toLowerCase()} · task unlock`;
    }

    return {
      key: speciesAvatarKey(slug),
      kind: "species" as const,
      label: species?.name ?? slug,
      subtitle,
      src: creaturePortraitPath(slug),
      thumbSrc: creatureThumbPath(slug),
      unlocked,
      lockedReason: evald?.lockedReason,
      unlockPaths: evald?.paths,
      rarity,
      affinity,
      purchasable,
      bgSrc: avatarBackgroundForSpecies(slug, affinity),
    };
  });
}

export function listAvailableAvatars(ownerKey: string): SocialAvatarCatalog {
  const profile = requireProfile(ownerKey);
  const pets = listPetAvatarOptions(ownerKey);
  const riftlings = listSpeciesAvatarOptions(ownerKey);
  const characters = listCharacterAvatarOptions();
  const brand = listBrandAvatarOptions();

  const unlocked = riftlings.filter((o) => o.unlocked).length;
  const locked = riftlings.length - unlocked;

  const sections: SocialAvatarSection[] = [];

  if (pets.length > 0) {
    sections.push({
      id: "pets",
      title: "Your Riftlings",
      description: "Portraits from Riftlings you hatched and own.",
      options: pets,
    });
  }

  sections.push({
    id: "riftlings",
    title: "Riftling avatars",
    description:
      pets.length > 0
        ? "Species portraits — free starters, task unlocks, or buy with Credits. Cosmetics only."
        : "Species portraits you can use anytime once unlocked. Hatch your own for personal pet avatars above.",
    options: riftlings,
  });

  sections.push(
    {
      id: "characters",
      title: "Keepers & characters",
      description: "Named town keepers, heroes, and lore figures.",
      options: characters,
    },
    {
      id: "brand",
      title: "Emblems",
      description: "Simple brand marks when you want a clean look.",
      options: brand,
    },
  );

  return {
    selectedKey: profile.avatarKey ?? null,
    selectedSrc: profile.avatarSrc,
    sections,
    cosmeticsNote:
      "Avatar cosmetics change how you appear to keepers — they never grant pets, cards, or gameplay power. SOL is optional and never required.",
    unlockSummary: {
      total: riftlings.length,
      freeStarters: STARTER_RIFTLING_AVATAR_SLUGS.length,
      unlocked,
      locked,
    },
  };
}

function resolveAvatarSelection(
  ownerKey: string,
  input: SetAvatarInput,
):
  | { ok: true; key: string; src: string; kind: SocialAvatarKind }
  | { ok: false; error: string; message: string } {
  if (input.kind === "pet") {
    const pet = getPet(input.petPublicId);
    if (!pet || pet.ownerKey !== ownerKey) {
      return {
        ok: false,
        error: "not_owned",
        message: "You can only use avatars from Riftlings you own.",
      };
    }
    return {
      ok: true,
      kind: "pet",
      key: petAvatarKey(pet.publicId),
      src: creaturePortraitPath(pet.speciesSlug),
    };
  }

  if (input.kind === "species") {
    const slug = input.speciesSlug.trim().toLowerCase();
    if (!isRiftlingAvatarSlug(slug) || !getSpeciesBySlug(slug)) {
      return {
        ok: false,
        error: "not_found",
        message: "That Riftling species avatar is not available.",
      };
    }
    const unlock = evaluateSpeciesAvatarUnlock(ownerKey, slug);
    if (!unlock?.unlocked) {
      return {
        ok: false,
        error: "locked",
        message:
          unlock?.lockedReason ??
          "That Riftling avatar is locked. Complete its task or buy with Credits.",
      };
    }
    return {
      ok: true,
      kind: "species",
      key: speciesAvatarKey(slug),
      src: creaturePortraitPath(slug),
    };
  }

  if (input.kind === "npc") {
    const npc = NAMED_NPCS.find((n) => n.slug === input.npcSlug || n.id === input.npcSlug);
    if (!npc || !npc.active) {
      return {
        ok: false,
        error: "not_found",
        message: "That character avatar is not available.",
      };
    }
    return {
      ok: true,
      kind: "npc",
      key: npcAvatarKey(npc.slug),
      src: npc.portraitAsset,
    };
  }

  if (input.kind === "lore") {
    const lore = LORE_AVATARS.find((c) => c.id === input.characterId);
    if (!lore) {
      return {
        ok: false,
        error: "not_found",
        message: "That lore avatar is not available.",
      };
    }
    return {
      ok: true,
      kind: "lore",
      key: loreAvatarKey(lore.id),
      src: lore.src,
    };
  }

  const brandId = input.brandId ?? "mark";
  const brand = BRAND_AVATARS.find((b) => b.id === brandId);
  if (!brand) {
    return {
      ok: false,
      error: "not_found",
      message: "That emblem is not available.",
    };
  }
  return {
    ok: true,
    kind: "brand",
    key: brandAvatarKey(brand.id),
    src: brand.src,
  };
}

/**
 * Set the player's social avatar.
 * Pet avatars require ownership; species require unlock; NPC / lore / brand are cosmetics.
 */
export function setSocialAvatar(
  ownerKey: string,
  input: SetAvatarInput,
):
  | { ok: true; profile: SocialProfile; key: string; src: string }
  | { ok: false; error: string; message: string } {
  const resolved = resolveAvatarSelection(ownerKey, input);
  if (!resolved.ok) return resolved;

  const profile = requireProfile(ownerKey);
  profile.avatarSrc = resolved.src;
  profile.avatarKey = resolved.key;
  profile.lastSeenAt = new Date().toISOString();

  return {
    ok: true,
    profile,
    key: resolved.key,
    src: resolved.src,
  };
}

/** Parse a stored avatar key back into a set input (for API convenience). */
export function parseAvatarKey(key: string): SetAvatarInput | null {
  const colon = key.indexOf(":");
  if (colon < 1) return null;
  const kind = key.slice(0, colon);
  const id = key.slice(colon + 1);
  if (!id) return null;
  if (kind === "pet") return { kind: "pet", petPublicId: id };
  if (kind === "species") return { kind: "species", speciesSlug: id };
  if (kind === "npc") return { kind: "npc", npcSlug: id };
  if (kind === "lore") return { kind: "lore", characterId: id };
  if (kind === "brand") return { kind: "brand", brandId: id };
  return null;
}
