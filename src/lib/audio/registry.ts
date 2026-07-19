/**
 * Extensible audio cue registry — metadata + path resolution.
 * Add cues here (or via registerCue) without rewriting playback engines.
 */

import type { AudioBus, AudioPriority } from "@/lib/audio/types";

export type AudioCueCategory =
  | "ui"
  | "music"
  | "sfx"
  | "companions"
  | "bosses"
  | "world"
  | "housing"
  | "guild"
  | "arena"
  | "marketplace"
  | "events"
  | "voice"
  | "notifications";

export type AudioCueDef = {
  id: string;
  /** Human label for ADD / QA */
  name: string;
  category: AudioCueCategory;
  bus: AudioBus;
  /** Runtime URL under /sounds/… */
  file?: string;
  /** Canonical package path under /audio/… */
  packagePath?: string;
  durationSec?: number;
  volume: number;
  looping: boolean;
  spatial3d: boolean;
  priority: AudioPriority;
  /** Suggested delivery format */
  compression: "wav" | "ogg" | "mp3";
  description: string;
  tags?: string[];
};

const cues = new Map<string, AudioCueDef>();

export function registerCue(def: AudioCueDef) {
  cues.set(def.id, def);
}

export function registerCues(defs: AudioCueDef[]) {
  for (const d of defs) registerCue(d);
}

export function getCue(id: string): AudioCueDef | undefined {
  return cues.get(id);
}

export function listCues(filter?: {
  category?: AudioCueCategory;
  bus?: AudioBus;
}): AudioCueDef[] {
  const all = [...cues.values()];
  return all.filter((c) => {
    if (filter?.category && c.category !== filter.category) return false;
    if (filter?.bus && c.bus !== filter.bus) return false;
    return true;
  });
}

export function cueCount(): number {
  return cues.size;
}

/** Seeded at module load — mirrors SFX recipes + adaptive modes. */
export const CORE_CUE_SEED: AudioCueDef[] = [
  // UI
  cue("ui.click", "UI Click", "ui", "ui", "ui/ui-click.wav", 0.05, 0.35, "Soft magical UI tap"),
  cue("ui.hover", "UI Hover", "ui", "ui", "ui/ui-hover.wav", 0.04, 0.22, "Light hover chime", {
    priority: "low",
  }),
  cue("ui.success", "UI Success", "ui", "ui", "ui/ui-success.wav", 0.18, 0.5, "Confirm success arpeggio"),
  cue("ui.error", "UI Error", "ui", "ui", "ui/ui-error.wav", 0.16, 0.5, "Soft deny thud"),
  cue("ui.nav", "UI Nav", "ui", "ui", "ui/ui-nav.wav", 0.05, 0.28, "Navigation tick"),
  cue("ui.modal_open", "Modal Open", "ui", "ui", "ui/ui-modal-open.wav", 0.12, 0.45, "Modal rise"),
  cue("ui.modal_close", "Modal Close", "ui", "ui", "ui/ui-modal-close.wav", 0.1, 0.4, "Modal settle"),
  cue("ui.notify", "UI Notify", "notifications", "notifications", "events/ui-notify.wav", 0.14, 0.45, "Generic toast ping"),

  // Login / cinematic
  cue("login.enter", "Login Hall Enter", "events", "sfx", "events/login-enter.wav", 1.2, 0.55, "Login hall door whoosh + pad"),
  cue("login.success", "Login Success", "events", "ui", "events/login-success.wav", 0.45, 0.55, "Keeper accepted chime"),
  cue("cinematic.stinger", "Cinematic Stinger", "events", "combat", "events/cinematic-stinger.wav", 1.6, 0.65, "Opening cinematic hit", {
    priority: "critical",
    duck: true,
  }),
  cue("cinematic.whoosh", "Cinematic Whoosh", "events", "sfx", "events/cinematic-whoosh.wav", 0.55, 0.5, "Rift transition whoosh"),

  // Hatchery
  cue("hatchery.idle", "Hatchery Idle", "sfx", "sfx", "sfx/hatchery-idle.wav", 0.35, 0.2, "Soft egg warmth tick", {
    looping: false,
    ambient: true,
  }),
  cue("hatchery.crack", "Egg Crack", "sfx", "sfx", "sfx/hatchery-crack.wav", 0.28, 0.55, "Shell fracture"),
  cue("hatchery.claim", "Egg Claim", "sfx", "sfx", "sfx/hatchery-claim.wav", 0.35, 0.55, "Claim egg chime"),
  cue("hatchery.hatch_reveal", "Hatch Reveal", "sfx", "sfx", "sfx/hatchery-reveal.wav", 0.55, 0.65, "Reveal flourish"),
  cue("hatchery.rarity_common", "Hatch Common", "sfx", "sfx", "sfx/hatchery-rarity-common.wav", 0.4, 0.5, "Common hatch fanfare"),
  cue("hatchery.rarity_uncommon", "Hatch Uncommon", "sfx", "sfx", "sfx/hatchery-rarity-uncommon.wav", 0.5, 0.55, "Uncommon hatch fanfare"),
  cue("hatchery.rarity_rare", "Hatch Rare", "sfx", "sfx", "sfx/hatchery-rarity-rare.wav", 0.65, 0.6, "Rare hatch fanfare"),
  cue("hatchery.rarity_epic", "Hatch Epic", "sfx", "sfx", "sfx/hatchery-rarity-epic.wav", 0.85, 0.65, "Epic hatch fanfare"),
  cue("hatchery.rarity_legendary", "Hatch Legendary", "sfx", "sfx", "sfx/hatchery-rarity-legendary.wav", 1.2, 0.72, "Legendary hatch fanfare", {
    priority: "critical",
  }),

  // TCG
  cue("tcg.card_select", "Card Select", "sfx", "ui", "sfx/tcg-card-select.wav", 0.06, 0.32, "Hand select"),
  cue("tcg.card_play", "Card Play", "sfx", "combat", "sfx/tcg-card-play.wav", 0.28, 0.55, "Rift whoosh + paper"),
  cue("tcg.card_draw", "Card Draw", "sfx", "ui", "sfx/tcg-card-draw.wav", 0.14, 0.38, "Draw from deck"),
  cue("tcg.energy_gain", "Energy Gain", "sfx", "ui", "sfx/tcg-energy-gain.wav", 0.22, 0.45, "Rift energy sparkle"),
  cue("tcg.summon", "Summon", "sfx", "combat", "sfx/tcg-summon.wav", 0.4, 0.58, "Companion summon swell"),
  cue("tcg.end_turn", "End Turn", "sfx", "ui", "sfx/tcg-end-turn.wav", 0.14, 0.42, "Turn pass"),
  cue("tcg.attack", "Attack", "sfx", "combat", "sfx/tcg-attack.wav", 0.16, 0.55, "Strike impact"),
  cue("tcg.damage", "Damage", "sfx", "combat", "sfx/tcg-damage.wav", 0.14, 0.5, "Damage thud"),
  cue("tcg.match_start", "Match Start", "sfx", "combat", "sfx/tcg-match-start.wav", 0.45, 0.6, "Arena gates open"),
  cue("tcg.element_fire", "Element Fire", "sfx", "combat", "sfx/tcg-element-fire.wav", 0.32, 0.55, "Fire affinity whoosh"),
  cue("tcg.element_water", "Element Water", "sfx", "combat", "sfx/tcg-element-water.wav", 0.32, 0.52, "Water affinity wash"),
  cue("tcg.element_nature", "Element Nature", "sfx", "combat", "sfx/tcg-element-nature.wav", 0.32, 0.5, "Nature leaf swirl"),
  cue("tcg.element_storm", "Element Storm", "sfx", "combat", "sfx/tcg-element-storm.wav", 0.35, 0.55, "Storm crackle"),
  cue("tcg.element_void", "Element Void", "sfx", "combat", "sfx/tcg-element-void.wav", 0.38, 0.52, "Void suck"),
  cue("tcg.element_light", "Element Light", "sfx", "combat", "sfx/tcg-element-light.wav", 0.35, 0.55, "Light bloom"),

  // Companions
  cue("companion.idle", "Companion Idle", "companions", "pet", "companions/companion-idle.wav", 0.25, 0.35, "Soft idle chirp"),
  cue("companion.happy", "Companion Happy", "companions", "pet", "companions/companion-happy.wav", 0.3, 0.5, "Happy chirp"),
  cue("companion.angry", "Companion Angry", "companions", "pet", "companions/companion-angry.wav", 0.28, 0.48, "Angry growl-chirp"),
  cue("companion.attack", "Companion Attack", "companions", "pet", "companions/companion-attack.wav", 0.22, 0.55, "Attack cry"),
  cue("companion.hurt", "Companion Hurt", "companions", "pet", "companions/companion-hurt.wav", 0.2, 0.45, "Hurt yelp"),

  // Bosses
  cue("boss.enter", "Boss Enter", "bosses", "combat", "bosses/boss-enter.wav", 1.4, 0.7, "Boss gate slam + choir", {
    priority: "critical",
  }),
  cue("boss.phase", "Boss Phase", "bosses", "combat", "bosses/boss-phase.wav", 0.9, 0.65, "Phase transition"),
  cue("boss.taunt", "Boss Taunt Slot", "bosses", "voice", "bosses/boss-taunt.wav", 0.8, 0.6, "Announcer/taunt placeholder slot"),
  cue("boss.defeat", "Boss Defeat", "bosses", "combat", "bosses/boss-defeat.wav", 1.5, 0.7, "Boss defeat resolve"),

  // Guild / housing / arena
  cue("guild.open", "Guild Hall", "guild", "ui", "guild/guild-open.wav", 0.5, 0.45, "Guild hall enter"),
  cue("guild.invite", "Guild Invite", "guild", "notifications", "guild/guild-invite.wav", 0.28, 0.5, "Invite toast"),
  cue("guild.join", "Guild Join", "guild", "sfx", "guild/guild-join.wav", 0.4, 0.55, "Join flourish"),
  cue("housing.enter", "Housing Enter", "housing", "sfx", "housing/housing-enter.wav", 0.55, 0.45, "Door + warm pad"),
  cue("housing.place", "Furniture Place", "housing", "ui", "housing/housing-place.wav", 0.18, 0.4, "Place furniture"),
  cue("housing.pickup", "Furniture Pickup", "housing", "ui", "housing/housing-pickup.wav", 0.14, 0.38, "Pickup furniture"),
  cue("arena.queue", "Arena Queue", "arena", "ui", "arena/arena-queue.wav", 0.2, 0.4, "Queue tick"),
  cue("arena.match_found", "Match Found", "arena", "combat", "arena/arena-match-found.wav", 0.55, 0.6, "Match found fanfare"),
  cue("arena.crowd", "Arena Crowd", "arena", "ambient", "arena/arena-crowd.wav", 2.0, 0.25, "Soft crowd bed", {
    looping: true,
  }),
  cue("arena.start", "Arena Start", "arena", "combat", "arena/arena-start.wav", 0.45, 0.55, "Arena start"),
  cue("tournament.start", "Tournament Start", "arena", "combat", "arena/tournament-start.wav", 0.8, 0.6, "Tournament horn"),
  cue("tournament.round", "Tournament Round", "arena", "ui", "arena/tournament-round.wav", 0.35, 0.5, "Round advance"),
  cue("tournament.victory", "Tournament Victory", "arena", "combat", "arena/tournament-victory.wav", 1.2, 0.68, "Cup victory"),

  // Marketplace / shop / collection
  cue("marketplace.list", "Listing Created", "marketplace", "ui", "marketplace/marketplace-list.wav", 0.25, 0.45, "List item"),
  cue("marketplace.bid", "Bid Placed", "marketplace", "ui", "marketplace/marketplace-bid.wav", 0.22, 0.45, "Bid tick"),
  cue(
    "marketplace.sol_transfer",
    "SOL Transfer (cosmetic)",
    "marketplace",
    "ui",
    "marketplace/marketplace-sol-transfer.wav",
    0.35,
    0.5,
    "Cosmetic coin whoosh — NOT wagering audio",
  ),
  cue("shop.open", "Shop Open", "marketplace", "ui", "marketplace/shop-open.wav", 0.3, 0.4, "Shop curtain"),
  cue("shop.purchase_ok", "Purchase OK", "marketplace", "ui", "marketplace/shop-ok.wav", 0.25, 0.55, "Purchase success"),
  cue("shop.purchase_fail", "Purchase Fail", "marketplace", "ui", "marketplace/shop-fail.wav", 0.2, 0.45, "Purchase deny"),
  cue("collection.open", "Collection Open", "sfx", "ui", "sfx/collection-open.wav", 0.35, 0.42, "Binder open"),
  cue("collection.select", "Collection Select", "sfx", "ui", "sfx/collection-select.wav", 0.08, 0.32, "Card tile select"),

  // Notifications
  cue("notify.toast", "Toast", "notifications", "notifications", "events/notify-toast.wav", 0.12, 0.42, "Toast appear"),
  cue("notify.achievement", "Achievement", "notifications", "notifications", "events/notify-achievement.wav", 0.55, 0.58, "Achievement sting"),
  cue("notify.friend", "Friend Request", "notifications", "notifications", "events/notify-friend.wav", 0.28, 0.48, "Friend ping"),

  // Voice slots
  cue("voice.narrator_line", "Narrator Line", "voice", "voice", "events/voice-narrator.wav", 1.0, 0.65, "Generic narrator bed slot"),
  cue("voice.announcer_ready", "Announcer Ready", "voice", "voice", "events/voice-announcer-ready.wav", 0.7, 0.6, "Arena announcer ready"),
  cue("voice.announcer_victory", "Announcer Victory", "voice", "voice", "events/voice-announcer-victory.wav", 0.9, 0.65, "Arena announcer victory"),
];

type CueOpts = {
  priority?: AudioPriority;
  looping?: boolean;
  ambient?: boolean;
  duck?: boolean;
  spatial3d?: boolean;
};

function cue(
  id: string,
  name: string,
  category: AudioCueCategory,
  bus: AudioBus,
  packageRel: string,
  durationSec: number,
  volume: number,
  description: string,
  opts: CueOpts = {},
): AudioCueDef {
  const fileName = packageRel.split("/").pop()!;
  return {
    id,
    name,
    category,
    bus,
    file: `/sounds/sfx/${fileName}`,
    packagePath: `/audio/${packageRel}`,
    durationSec,
    volume,
    looping: opts.looping ?? false,
    spatial3d: opts.spatial3d ?? false,
    priority: opts.priority ?? "normal",
    compression: "wav",
    description,
    tags: opts.ambient ? ["ambient"] : undefined,
  };
}

registerCues(CORE_CUE_SEED);
