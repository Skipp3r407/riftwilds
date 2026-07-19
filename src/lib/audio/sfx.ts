/**
 * Riftwilds SFX engine — procedural Web Audio with optional file overrides.
 * Volumes/mute come from AudioManager categories (ui/sfx/pet/combat/weather).
 */

import { busForEvent } from "@/lib/audio/catalog";
import { audioManager } from "@/lib/audio/manager";
import { clamp01, prefersReducedSound } from "@/lib/audio/prefs";
import type { TerrainFootstep } from "@/lib/audio/types";

export type SfxEventId =
  | "ui.click"
  | "ui.hover"
  | "ui.success"
  | "ui.modal_open"
  | "ui.modal_close"
  | "ui.nav"
  | "ui.error"
  | "ui.map_open"
  | "ui.map_close"
  | "ui.waypoint"
  | "ui.chat_open"
  | "ui.chat_close"
  | "ui.chat_send"
  | "ui.notify"
  | "login.enter"
  | "login.success"
  | "cinematic.stinger"
  | "cinematic.whoosh"
  | "hatchery.claim"
  | "hatchery.incubate_tick"
  | "hatchery.hatch_reveal"
  | "hatchery.idle"
  | "hatchery.crack"
  | "hatchery.rarity_common"
  | "hatchery.rarity_uncommon"
  | "hatchery.rarity_rare"
  | "hatchery.rarity_epic"
  | "hatchery.rarity_legendary"
  | "pets.care"
  | "pets.feed"
  | "pets.water"
  | "pets.play"
  | "pets.clean"
  | "pets.rest"
  | "pets.heal"
  | "pets.need_low"
  | "pets.equip"
  | "pets.evolve"
  | "companion.idle"
  | "companion.happy"
  | "companion.angry"
  | "companion.attack"
  | "companion.hurt"
  | "quests.accept"
  | "quests.objective"
  | "quests.complete"
  | "combat.hit"
  | "combat.ability"
  | "combat.win"
  | "combat.lose"
  | "combat.stinger"
  | "event.stinger"
  | "boss.enter"
  | "boss.phase"
  | "boss.taunt"
  | "boss.defeat"
  | "arena.start"
  | "arena.queue"
  | "arena.match_found"
  | "arena.crowd"
  | "tournament.start"
  | "tournament.round"
  | "tournament.victory"
  | "tcg.card_select"
  | "tcg.card_play"
  | "tcg.card_draw"
  | "tcg.energy_gain"
  | "tcg.summon"
  | "tcg.end_turn"
  | "tcg.attack"
  | "tcg.damage"
  | "tcg.match_start"
  | "tcg.element_fire"
  | "tcg.element_water"
  | "tcg.element_nature"
  | "tcg.element_storm"
  | "tcg.element_void"
  | "tcg.element_light"
  | "deck.add"
  | "deck.remove"
  | "deck.save"
  | "deck.error"
  | "codex.page_turn"
  | "codex.discover"
  | "codex.inspect"
  | "codex.reward"
  | "codex.locked"
  | "collection.open"
  | "collection.select"
  | "shop.open"
  | "shop.purchase_ok"
  | "shop.purchase_fail"
  | "marketplace.list"
  | "marketplace.bid"
  | "marketplace.sol_transfer"
  | "guild.open"
  | "guild.invite"
  | "guild.join"
  | "housing.enter"
  | "housing.place"
  | "housing.pickup"
  | "notify.toast"
  | "notify.achievement"
  | "notify.friend"
  | "voice.narrator_line"
  | "voice.announcer_ready"
  | "voice.announcer_victory"
  | "world.footstep"
  | "world.npc_talk"
  | "world.npc_greet"
  | "world.npc_work"
  | "world.portal"
  | "world.fast_travel"
  | "world.gateway_activate"
  | "world.gather"
  | "world.loot"
  | "rewards.claim"
  | "rewards.estimate_tick"
  | "weather.rain"
  | "weather.thunder"
  | "weather.wind";

type ToneStep = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

type SfxRecipe = {
  cooldownMs: number;
  /** Multiplier on category volume (0–1). */
  gain?: number;
  /** Skip when prefers-reduced-motion / prefer-reduced-sound. */
  ambient?: boolean;
  tones: ToneStep[];
  /** Optional file under /sounds/sfx/ — falls back to procedural if missing. */
  file?: string;
  /** Duck music/ambient when played. */
  duck?: boolean;
};

/** @deprecated Prefer AudioManager prefs — kept for useSfx compat. */
export type SfxPrefs = {
  muted: boolean;
  volume: number;
};

type PlayOpts = {
  force?: boolean;
  surface?: TerrainFootstep;
  gainScale?: number;
};

const FOOTSTEP_TONES: Record<TerrainFootstep, ToneStep> = {
  grass: { freq: 120, dur: 0.032, type: "triangle", gain: 0.12 },
  path: { freq: 160, dur: 0.028, type: "triangle", gain: 0.14 },
  stone: { freq: 200, dur: 0.025, type: "square", gain: 0.1 },
  sand: { freq: 90, dur: 0.04, type: "sine", gain: 0.11 },
  snow: { freq: 280, dur: 0.035, type: "sine", gain: 0.09 },
  wood: { freq: 180, dur: 0.03, type: "triangle", gain: 0.13 },
  water: { freq: 70, dur: 0.05, type: "sine", gain: 0.1 },
  lava: { freq: 55, dur: 0.045, type: "sawtooth", gain: 0.08 },
  metal: { freq: 320, dur: 0.022, type: "square", gain: 0.09 },
  void: { freq: 48, dur: 0.05, type: "sine", gain: 0.1 },
};

const RECIPES: Record<SfxEventId, SfxRecipe> = {
  "ui.click": {
    cooldownMs: 45,
    gain: 0.35,
    tones: [{ freq: 880, dur: 0.035, type: "sine", gain: 0.4 }],
    file: "/sounds/sfx/ui-click.wav",
  },
  "ui.hover": {
    cooldownMs: 90,
    gain: 0.18,
    tones: [{ freq: 1200, dur: 0.02, type: "sine", gain: 0.22 }],
    file: "/sounds/sfx/ui-hover.wav",
  },
  "ui.success": {
    cooldownMs: 180,
    gain: 0.5,
    tones: [
      { freq: 523, dur: 0.05, type: "sine", gain: 0.28 },
      { freq: 784, dur: 0.08, type: "triangle", gain: 0.24, delay: 0.05 },
    ],
    file: "/sounds/sfx/ui-success.wav",
  },
  "ui.notify": {
    cooldownMs: 200,
    gain: 0.42,
    tones: [
      { freq: 880, dur: 0.04, type: "sine", gain: 0.26 },
      { freq: 1175, dur: 0.06, type: "triangle", gain: 0.2, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-notify.wav",
  },
  "login.enter": {
    cooldownMs: 800,
    gain: 0.5,
    duck: true,
    tones: [
      { freq: 196, dur: 0.18, type: "sine", gain: 0.2 },
      { freq: 294, dur: 0.2, type: "triangle", gain: 0.22, delay: 0.12 },
      { freq: 392, dur: 0.28, type: "sine", gain: 0.2, delay: 0.28 },
    ],
    file: "/sounds/sfx/login-enter.wav",
  },
  "login.success": {
    cooldownMs: 400,
    gain: 0.55,
    tones: [
      { freq: 523, dur: 0.08, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.07 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.22, delay: 0.16 },
    ],
    file: "/sounds/sfx/login-success.wav",
  },
  "cinematic.stinger": {
    cooldownMs: 1200,
    gain: 0.7,
    duck: true,
    tones: [
      { freq: 110, dur: 0.2, type: "sine", gain: 0.28 },
      { freq: 220, dur: 0.22, type: "triangle", gain: 0.24, delay: 0.12 },
      { freq: 440, dur: 0.3, type: "sine", gain: 0.22, delay: 0.28 },
      { freq: 880, dur: 0.35, type: "sine", gain: 0.18, delay: 0.5 },
    ],
    file: "/sounds/sfx/cinematic-stinger.wav",
  },
  "cinematic.whoosh": {
    cooldownMs: 350,
    gain: 0.5,
    tones: [
      { freq: 180, dur: 0.12, type: "triangle", gain: 0.2 },
      { freq: 520, dur: 0.18, type: "sine", gain: 0.22, delay: 0.08 },
    ],
    file: "/sounds/sfx/cinematic-whoosh.wav",
  },
  "ui.modal_open": {
    cooldownMs: 120,
    gain: 0.45,
    tones: [
      { freq: 420, dur: 0.05, type: "triangle", gain: 0.35 },
      { freq: 640, dur: 0.07, type: "triangle", gain: 0.3, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-modal-open.wav",
  },
  "ui.modal_close": {
    cooldownMs: 120,
    gain: 0.4,
    tones: [
      { freq: 560, dur: 0.05, type: "triangle", gain: 0.3 },
      { freq: 360, dur: 0.06, type: "triangle", gain: 0.25, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-modal-close.wav",
  },
  "ui.nav": {
    cooldownMs: 80,
    gain: 0.28,
    tones: [{ freq: 720, dur: 0.028, type: "sine", gain: 0.3 }],
    file: "/sounds/sfx/ui-nav.wav",
  },
  "ui.error": {
    cooldownMs: 200,
    gain: 0.5,
    tones: [
      { freq: 220, dur: 0.09, type: "square", gain: 0.22 },
      { freq: 160, dur: 0.12, type: "square", gain: 0.18, delay: 0.08 },
    ],
    file: "/sounds/sfx/ui-error.wav",
  },
  "ui.map_open": {
    cooldownMs: 180,
    gain: 0.4,
    tones: [
      { freq: 380, dur: 0.05, type: "triangle", gain: 0.28 },
      { freq: 560, dur: 0.08, type: "sine", gain: 0.26, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-map-open.wav",
  },
  "ui.map_close": {
    cooldownMs: 180,
    gain: 0.35,
    tones: [
      { freq: 520, dur: 0.05, type: "triangle", gain: 0.24 },
      { freq: 320, dur: 0.07, type: "sine", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-map-close.wav",
  },
  "ui.waypoint": {
    cooldownMs: 220,
    gain: 0.45,
    tones: [
      { freq: 660, dur: 0.05, type: "sine", gain: 0.28 },
      { freq: 990, dur: 0.08, type: "triangle", gain: 0.24, delay: 0.05 },
    ],
    file: "/sounds/sfx/ui-waypoint.wav",
  },
  "ui.chat_open": {
    cooldownMs: 150,
    gain: 0.3,
    tones: [{ freq: 640, dur: 0.03, type: "sine", gain: 0.28 }],
    file: "/sounds/sfx/ui-chat-open.wav",
  },
  "ui.chat_close": {
    cooldownMs: 150,
    gain: 0.28,
    tones: [{ freq: 480, dur: 0.03, type: "sine", gain: 0.24 }],
    file: "/sounds/sfx/ui-chat-close.wav",
  },
  "ui.chat_send": {
    cooldownMs: 120,
    gain: 0.32,
    tones: [{ freq: 780, dur: 0.035, type: "triangle", gain: 0.26 }],
    file: "/sounds/sfx/ui-chat-send.wav",
  },
  "hatchery.claim": {
    cooldownMs: 250,
    gain: 0.55,
    tones: [
      { freq: 392, dur: 0.07, type: "triangle", gain: 0.35 },
      { freq: 523, dur: 0.08, type: "triangle", gain: 0.32, delay: 0.06 },
      { freq: 659, dur: 0.1, type: "sine", gain: 0.28, delay: 0.13 },
    ],
    file: "/sounds/sfx/hatchery-claim.wav",
  },
  "hatchery.incubate_tick": {
    cooldownMs: 2800,
    gain: 0.2,
    ambient: true,
    tones: [{ freq: 520, dur: 0.04, type: "sine", gain: 0.2 }],
  },
  "hatchery.hatch_reveal": {
    cooldownMs: 400,
    gain: 0.65,
    duck: true,
    tones: [
      { freq: 523, dur: 0.08, type: "sine", gain: 0.35 },
      { freq: 659, dur: 0.09, type: "sine", gain: 0.32, delay: 0.07 },
      { freq: 784, dur: 0.1, type: "triangle", gain: 0.3, delay: 0.15 },
      { freq: 1046, dur: 0.16, type: "sine", gain: 0.28, delay: 0.24 },
    ],
    file: "/sounds/sfx/hatchery-reveal.wav",
  },
  "hatchery.idle": {
    cooldownMs: 3200,
    gain: 0.18,
    ambient: true,
    tones: [{ freq: 480, dur: 0.06, type: "sine", gain: 0.16 }],
    file: "/sounds/sfx/hatchery-idle.wav",
  },
  "hatchery.crack": {
    cooldownMs: 220,
    gain: 0.5,
    tones: [
      { freq: 240, dur: 0.04, type: "square", gain: 0.14 },
      { freq: 180, dur: 0.06, type: "triangle", gain: 0.16, delay: 0.03 },
      { freq: 90, dur: 0.08, type: "sine", gain: 0.12, delay: 0.06 },
    ],
    file: "/sounds/sfx/hatchery-crack.wav",
  },
  "hatchery.rarity_common": {
    cooldownMs: 500,
    gain: 0.5,
    tones: [
      { freq: 392, dur: 0.08, type: "sine", gain: 0.26 },
      { freq: 523, dur: 0.1, type: "triangle", gain: 0.22, delay: 0.07 },
    ],
    file: "/sounds/sfx/hatchery-rarity-common.wav",
  },
  "hatchery.rarity_uncommon": {
    cooldownMs: 500,
    gain: 0.55,
    tones: [
      { freq: 440, dur: 0.08, type: "sine", gain: 0.26 },
      { freq: 554, dur: 0.1, type: "triangle", gain: 0.24, delay: 0.07 },
      { freq: 659, dur: 0.12, type: "sine", gain: 0.2, delay: 0.15 },
    ],
    file: "/sounds/sfx/hatchery-rarity-uncommon.wav",
  },
  "hatchery.rarity_rare": {
    cooldownMs: 550,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 494, dur: 0.09, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.11, type: "triangle", gain: 0.26, delay: 0.08 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.24, delay: 0.18 },
    ],
    file: "/sounds/sfx/hatchery-rarity-rare.wav",
  },
  "hatchery.rarity_epic": {
    cooldownMs: 600,
    gain: 0.65,
    duck: true,
    tones: [
      { freq: 523, dur: 0.1, type: "sine", gain: 0.28 },
      { freq: 698, dur: 0.12, type: "triangle", gain: 0.26, delay: 0.09 },
      { freq: 880, dur: 0.14, type: "sine", gain: 0.24, delay: 0.2 },
      { freq: 1046, dur: 0.18, type: "sine", gain: 0.2, delay: 0.32 },
    ],
    file: "/sounds/sfx/hatchery-rarity-epic.wav",
  },
  "hatchery.rarity_legendary": {
    cooldownMs: 700,
    gain: 0.72,
    duck: true,
    tones: [
      { freq: 196, dur: 0.14, type: "sine", gain: 0.24 },
      { freq: 392, dur: 0.14, type: "triangle", gain: 0.26, delay: 0.1 },
      { freq: 587, dur: 0.16, type: "sine", gain: 0.26, delay: 0.22 },
      { freq: 784, dur: 0.18, type: "sine", gain: 0.24, delay: 0.36 },
      { freq: 1175, dur: 0.28, type: "triangle", gain: 0.22, delay: 0.52 },
    ],
    file: "/sounds/sfx/hatchery-rarity-legendary.wav",
  },
  "pets.care": {
    cooldownMs: 160,
    gain: 0.45,
    tones: [
      { freq: 600, dur: 0.05, type: "sine", gain: 0.3 },
      { freq: 900, dur: 0.07, type: "sine", gain: 0.25, delay: 0.04 },
    ],
    file: "/sounds/sfx/pets-care.wav",
  },
  "pets.feed": {
    cooldownMs: 180,
    gain: 0.42,
    tones: [
      { freq: 420, dur: 0.04, type: "triangle", gain: 0.28 },
      { freq: 560, dur: 0.05, type: "sine", gain: 0.24, delay: 0.04 },
    ],
    file: "/sounds/sfx/pets-feed.wav",
  },
  "pets.water": {
    cooldownMs: 180,
    gain: 0.4,
    tones: [
      { freq: 700, dur: 0.04, type: "sine", gain: 0.22 },
      { freq: 980, dur: 0.06, type: "sine", gain: 0.18, delay: 0.03 },
    ],
    file: "/sounds/sfx/pets-water.wav",
  },
  "pets.play": {
    cooldownMs: 200,
    gain: 0.48,
    tones: [
      { freq: 520, dur: 0.04, type: "triangle", gain: 0.28 },
      { freq: 780, dur: 0.06, type: "sine", gain: 0.26, delay: 0.05 },
      { freq: 1040, dur: 0.05, type: "sine", gain: 0.2, delay: 0.1 },
    ],
    file: "/sounds/sfx/pets-play.wav",
  },
  "pets.clean": {
    cooldownMs: 180,
    gain: 0.4,
    tones: [
      { freq: 880, dur: 0.03, type: "sine", gain: 0.2 },
      { freq: 1100, dur: 0.04, type: "triangle", gain: 0.18, delay: 0.03 },
    ],
    file: "/sounds/sfx/pets-clean.wav",
  },
  "pets.rest": {
    cooldownMs: 220,
    gain: 0.35,
    tones: [
      { freq: 300, dur: 0.08, type: "sine", gain: 0.24 },
      { freq: 220, dur: 0.1, type: "sine", gain: 0.2, delay: 0.08 },
    ],
    file: "/sounds/sfx/pets-rest.wav",
  },
  "pets.heal": {
    cooldownMs: 250,
    gain: 0.5,
    tones: [
      { freq: 523, dur: 0.06, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.26, delay: 0.05 },
    ],
    file: "/sounds/sfx/pets-heal.wav",
  },
  "pets.need_low": {
    cooldownMs: 4000,
    gain: 0.28,
    ambient: true,
    tones: [
      { freq: 340, dur: 0.06, type: "triangle", gain: 0.2 },
      { freq: 280, dur: 0.08, type: "sine", gain: 0.16, delay: 0.07 },
    ],
    file: "/sounds/sfx/pets-need-low.wav",
  },
  "pets.equip": {
    cooldownMs: 180,
    gain: 0.45,
    tones: [
      { freq: 340, dur: 0.04, type: "square", gain: 0.18 },
      { freq: 510, dur: 0.06, type: "triangle", gain: 0.28, delay: 0.03 },
    ],
    file: "/sounds/sfx/pets-equip.wav",
  },
  "pets.evolve": {
    cooldownMs: 500,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 440, dur: 0.1, type: "sawtooth", gain: 0.15 },
      { freq: 660, dur: 0.12, type: "triangle", gain: 0.28, delay: 0.1 },
      { freq: 880, dur: 0.18, type: "sine", gain: 0.3, delay: 0.22 },
    ],
    file: "/sounds/sfx/pets-evolve.wav",
  },
  "quests.accept": {
    cooldownMs: 200,
    gain: 0.5,
    tones: [
      { freq: 494, dur: 0.06, type: "triangle", gain: 0.3 },
      { freq: 740, dur: 0.1, type: "sine", gain: 0.28, delay: 0.05 },
    ],
    file: "/sounds/sfx/quests-accept.wav",
  },
  "quests.objective": {
    cooldownMs: 150,
    gain: 0.4,
    tones: [{ freq: 820, dur: 0.05, type: "sine", gain: 0.32 }],
    file: "/sounds/sfx/quests-objective.wav",
  },
  "quests.complete": {
    cooldownMs: 350,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 523, dur: 0.07, type: "triangle", gain: 0.3 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.28, delay: 0.07 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.3, delay: 0.15 },
    ],
    file: "/sounds/sfx/quests-complete.wav",
  },
  "combat.hit": {
    cooldownMs: 70,
    gain: 0.5,
    tones: [
      { freq: 180, dur: 0.05, type: "square", gain: 0.2 },
      { freq: 90, dur: 0.08, type: "sawtooth", gain: 0.12, delay: 0.02 },
    ],
    file: "/sounds/sfx/combat-hit.wav",
  },
  "combat.ability": {
    cooldownMs: 100,
    gain: 0.5,
    tones: [
      { freq: 300, dur: 0.04, type: "sawtooth", gain: 0.14 },
      { freq: 700, dur: 0.08, type: "triangle", gain: 0.28, delay: 0.03 },
    ],
    file: "/sounds/sfx/combat-ability.wav",
  },
  "combat.win": {
    cooldownMs: 500,
    gain: 0.65,
    duck: true,
    tones: [
      { freq: 523, dur: 0.08, type: "triangle", gain: 0.32 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.3, delay: 0.08 },
      { freq: 784, dur: 0.1, type: "sine", gain: 0.28, delay: 0.16 },
      { freq: 1046, dur: 0.2, type: "sine", gain: 0.26, delay: 0.26 },
    ],
    file: "/sounds/sfx/combat-win.wav",
  },
  "combat.lose": {
    cooldownMs: 500,
    gain: 0.5,
    duck: true,
    tones: [
      { freq: 300, dur: 0.12, type: "triangle", gain: 0.28 },
      { freq: 220, dur: 0.16, type: "triangle", gain: 0.24, delay: 0.1 },
      { freq: 160, dur: 0.2, type: "sine", gain: 0.2, delay: 0.22 },
    ],
    file: "/sounds/sfx/combat-lose.wav",
  },
  "combat.stinger": {
    cooldownMs: 600,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 200, dur: 0.08, type: "sawtooth", gain: 0.16 },
      { freq: 400, dur: 0.1, type: "triangle", gain: 0.28, delay: 0.06 },
      { freq: 800, dur: 0.14, type: "sine", gain: 0.24, delay: 0.14 },
    ],
    file: "/sounds/sfx/combat-stinger.wav",
  },
  "event.stinger": {
    cooldownMs: 700,
    gain: 0.55,
    duck: true,
    tones: [
      { freq: 440, dur: 0.08, type: "triangle", gain: 0.28 },
      { freq: 554, dur: 0.09, type: "sine", gain: 0.26, delay: 0.07 },
      { freq: 659, dur: 0.16, type: "sine", gain: 0.24, delay: 0.15 },
    ],
    file: "/sounds/sfx/event-stinger.wav",
  },
  "arena.start": {
    cooldownMs: 500,
    gain: 0.55,
    duck: true,
    tones: [
      { freq: 196, dur: 0.1, type: "triangle", gain: 0.28 },
      { freq: 294, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.09 },
      { freq: 392, dur: 0.14, type: "sine", gain: 0.24, delay: 0.18 },
    ],
    file: "/sounds/sfx/arena-start.wav",
  },
  "arena.queue": {
    cooldownMs: 200,
    gain: 0.38,
    tones: [
      { freq: 640, dur: 0.04, type: "sine", gain: 0.22 },
      { freq: 800, dur: 0.05, type: "triangle", gain: 0.18, delay: 0.04 },
    ],
    file: "/sounds/sfx/arena-queue.wav",
  },
  "arena.match_found": {
    cooldownMs: 500,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 392, dur: 0.08, type: "sine", gain: 0.28 },
      { freq: 523, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.07 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.24, delay: 0.16 },
    ],
    file: "/sounds/sfx/arena-match-found.wav",
  },
  "arena.crowd": {
    cooldownMs: 4000,
    gain: 0.22,
    ambient: true,
    tones: [{ freq: 140, dur: 0.35, type: "triangle", gain: 0.1 }],
    file: "/sounds/sfx/arena-crowd.wav",
  },
  "tournament.start": {
    cooldownMs: 700,
    gain: 0.62,
    duck: true,
    tones: [
      { freq: 262, dur: 0.12, type: "triangle", gain: 0.28 },
      { freq: 330, dur: 0.12, type: "sine", gain: 0.26, delay: 0.1 },
      { freq: 392, dur: 0.18, type: "sine", gain: 0.24, delay: 0.22 },
    ],
    file: "/sounds/sfx/tournament-start.wav",
  },
  "tournament.round": {
    cooldownMs: 400,
    gain: 0.5,
    tones: [
      { freq: 440, dur: 0.07, type: "sine", gain: 0.26 },
      { freq: 554, dur: 0.1, type: "triangle", gain: 0.22, delay: 0.06 },
    ],
    file: "/sounds/sfx/tournament-round.wav",
  },
  "tournament.victory": {
    cooldownMs: 800,
    gain: 0.68,
    duck: true,
    tones: [
      { freq: 523, dur: 0.1, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.12, type: "triangle", gain: 0.26, delay: 0.09 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.24, delay: 0.2 },
      { freq: 1046, dur: 0.22, type: "sine", gain: 0.22, delay: 0.34 },
    ],
    file: "/sounds/sfx/tournament-victory.wav",
  },
  "boss.enter": {
    cooldownMs: 1200,
    gain: 0.72,
    duck: true,
    tones: [
      { freq: 70, dur: 0.25, type: "sine", gain: 0.3 },
      { freq: 140, dur: 0.28, type: "triangle", gain: 0.22, delay: 0.15 },
      { freq: 210, dur: 0.35, type: "sine", gain: 0.2, delay: 0.35 },
    ],
    file: "/sounds/sfx/boss-enter.wav",
  },
  "boss.phase": {
    cooldownMs: 700,
    gain: 0.62,
    duck: true,
    tones: [
      { freq: 100, dur: 0.14, type: "sawtooth", gain: 0.12 },
      { freq: 200, dur: 0.16, type: "triangle", gain: 0.22, delay: 0.1 },
      { freq: 400, dur: 0.2, type: "sine", gain: 0.2, delay: 0.22 },
    ],
    file: "/sounds/sfx/boss-phase.wav",
  },
  "boss.taunt": {
    cooldownMs: 600,
    gain: 0.55,
    tones: [
      { freq: 160, dur: 0.12, type: "triangle", gain: 0.22 },
      { freq: 120, dur: 0.16, type: "sine", gain: 0.18, delay: 0.1 },
    ],
    file: "/sounds/sfx/boss-taunt.wav",
  },
  "boss.defeat": {
    cooldownMs: 900,
    gain: 0.7,
    duck: true,
    tones: [
      { freq: 330, dur: 0.12, type: "sine", gain: 0.26 },
      { freq: 440, dur: 0.14, type: "triangle", gain: 0.24, delay: 0.1 },
      { freq: 554, dur: 0.18, type: "sine", gain: 0.22, delay: 0.24 },
      { freq: 740, dur: 0.28, type: "sine", gain: 0.2, delay: 0.4 },
    ],
    file: "/sounds/sfx/boss-defeat.wav",
  },
  "companion.idle": {
    cooldownMs: 900,
    gain: 0.32,
    tones: [{ freq: 720, dur: 0.05, type: "sine", gain: 0.2 }],
    file: "/sounds/sfx/companion-idle.wav",
  },
  "companion.happy": {
    cooldownMs: 280,
    gain: 0.48,
    tones: [
      { freq: 660, dur: 0.05, type: "sine", gain: 0.26 },
      { freq: 990, dur: 0.07, type: "triangle", gain: 0.22, delay: 0.05 },
    ],
    file: "/sounds/sfx/companion-happy.wav",
  },
  "companion.angry": {
    cooldownMs: 280,
    gain: 0.48,
    tones: [
      { freq: 220, dur: 0.06, type: "sawtooth", gain: 0.12 },
      { freq: 160, dur: 0.08, type: "triangle", gain: 0.18, delay: 0.05 },
    ],
    file: "/sounds/sfx/companion-angry.wav",
  },
  "companion.attack": {
    cooldownMs: 200,
    gain: 0.52,
    tones: [
      { freq: 300, dur: 0.05, type: "triangle", gain: 0.22 },
      { freq: 180, dur: 0.07, type: "sine", gain: 0.18, delay: 0.03 },
    ],
    file: "/sounds/sfx/companion-attack.wav",
  },
  "companion.hurt": {
    cooldownMs: 200,
    gain: 0.45,
    tones: [
      { freq: 400, dur: 0.04, type: "sine", gain: 0.2 },
      { freq: 260, dur: 0.08, type: "triangle", gain: 0.16, delay: 0.04 },
    ],
    file: "/sounds/sfx/companion-hurt.wav",
  },
  "tcg.card_select": {
    cooldownMs: 70,
    gain: 0.32,
    tones: [
      { freq: 740, dur: 0.028, type: "sine", gain: 0.28 },
      { freq: 1110, dur: 0.04, type: "triangle", gain: 0.16, delay: 0.02 },
    ],
    file: "/sounds/sfx/tcg-card-select.wav",
  },
  "tcg.card_play": {
    cooldownMs: 120,
    gain: 0.55,
    duck: true,
    tones: [
      { freq: 220, dur: 0.05, type: "triangle", gain: 0.22 },
      { freq: 440, dur: 0.07, type: "sine", gain: 0.28, delay: 0.04 },
      { freq: 880, dur: 0.1, type: "triangle", gain: 0.22, delay: 0.1 },
    ],
    file: "/sounds/sfx/tcg-card-play.wav",
  },
  "tcg.card_draw": {
    cooldownMs: 100,
    gain: 0.38,
    tones: [
      { freq: 520, dur: 0.04, type: "triangle", gain: 0.22 },
      { freq: 780, dur: 0.06, type: "sine", gain: 0.2, delay: 0.03 },
    ],
    file: "/sounds/sfx/tcg-card-draw.wav",
  },
  "tcg.energy_gain": {
    cooldownMs: 120,
    gain: 0.42,
    tones: [
      { freq: 740, dur: 0.05, type: "sine", gain: 0.24 },
      { freq: 1110, dur: 0.08, type: "triangle", gain: 0.2, delay: 0.04 },
    ],
    file: "/sounds/sfx/tcg-energy-gain.wav",
  },
  "tcg.summon": {
    cooldownMs: 220,
    gain: 0.58,
    duck: true,
    tones: [
      { freq: 220, dur: 0.08, type: "triangle", gain: 0.22 },
      { freq: 440, dur: 0.1, type: "sine", gain: 0.26, delay: 0.06 },
      { freq: 660, dur: 0.14, type: "sine", gain: 0.22, delay: 0.14 },
    ],
    file: "/sounds/sfx/tcg-summon.wav",
  },
  "tcg.element_fire": {
    cooldownMs: 140,
    gain: 0.52,
    tones: [
      { freq: 180, dur: 0.08, type: "sawtooth", gain: 0.12 },
      { freq: 360, dur: 0.1, type: "triangle", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/tcg-element-fire.wav",
  },
  "tcg.element_water": {
    cooldownMs: 140,
    gain: 0.5,
    tones: [
      { freq: 280, dur: 0.1, type: "sine", gain: 0.22 },
      { freq: 420, dur: 0.12, type: "triangle", gain: 0.18, delay: 0.05 },
    ],
    file: "/sounds/sfx/tcg-element-water.wav",
  },
  "tcg.element_nature": {
    cooldownMs: 140,
    gain: 0.48,
    tones: [
      { freq: 330, dur: 0.08, type: "triangle", gain: 0.22 },
      { freq: 495, dur: 0.1, type: "sine", gain: 0.2, delay: 0.05 },
    ],
    file: "/sounds/sfx/tcg-element-nature.wav",
  },
  "tcg.element_storm": {
    cooldownMs: 140,
    gain: 0.52,
    tones: [
      { freq: 900, dur: 0.05, type: "square", gain: 0.1 },
      { freq: 200, dur: 0.12, type: "triangle", gain: 0.2, delay: 0.03 },
    ],
    file: "/sounds/sfx/tcg-element-storm.wav",
  },
  "tcg.element_void": {
    cooldownMs: 140,
    gain: 0.5,
    tones: [
      { freq: 70, dur: 0.14, type: "sine", gain: 0.22 },
      { freq: 105, dur: 0.16, type: "triangle", gain: 0.16, delay: 0.06 },
    ],
    file: "/sounds/sfx/tcg-element-void.wav",
  },
  "tcg.element_light": {
    cooldownMs: 140,
    gain: 0.52,
    tones: [
      { freq: 880, dur: 0.08, type: "sine", gain: 0.24 },
      { freq: 1320, dur: 0.12, type: "triangle", gain: 0.2, delay: 0.05 },
    ],
    file: "/sounds/sfx/tcg-element-light.wav",
  },
  "tcg.end_turn": {
    cooldownMs: 200,
    gain: 0.42,
    tones: [
      { freq: 360, dur: 0.05, type: "sine", gain: 0.24 },
      { freq: 240, dur: 0.08, type: "triangle", gain: 0.2, delay: 0.05 },
    ],
    file: "/sounds/sfx/tcg-end-turn.wav",
  },
  "tcg.attack": {
    cooldownMs: 90,
    gain: 0.55,
    tones: [
      { freq: 160, dur: 0.045, type: "sawtooth", gain: 0.16 },
      { freq: 320, dur: 0.07, type: "triangle", gain: 0.26, delay: 0.025 },
    ],
    file: "/sounds/sfx/tcg-attack.wav",
  },
  "tcg.damage": {
    cooldownMs: 80,
    gain: 0.5,
    tones: [
      { freq: 140, dur: 0.06, type: "square", gain: 0.16 },
      { freq: 70, dur: 0.1, type: "sine", gain: 0.14, delay: 0.03 },
    ],
    file: "/sounds/sfx/tcg-damage.wav",
  },
  "tcg.match_start": {
    cooldownMs: 600,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 196, dur: 0.1, type: "triangle", gain: 0.28 },
      { freq: 294, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.09 },
      { freq: 392, dur: 0.16, type: "sine", gain: 0.24, delay: 0.18 },
    ],
    file: "/sounds/sfx/tcg-match-start.wav",
  },
  "deck.add": {
    cooldownMs: 60,
    gain: 0.36,
    tones: [
      { freq: 660, dur: 0.03, type: "sine", gain: 0.26 },
      { freq: 990, dur: 0.045, type: "triangle", gain: 0.18, delay: 0.025 },
    ],
    file: "/sounds/sfx/deck-add.wav",
  },
  "deck.remove": {
    cooldownMs: 60,
    gain: 0.32,
    tones: [
      { freq: 520, dur: 0.03, type: "triangle", gain: 0.22 },
      { freq: 360, dur: 0.04, type: "sine", gain: 0.18, delay: 0.025 },
    ],
    file: "/sounds/sfx/deck-remove.wav",
  },
  "deck.save": {
    cooldownMs: 250,
    gain: 0.5,
    tones: [
      { freq: 523, dur: 0.06, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.24, delay: 0.05 },
      { freq: 784, dur: 0.1, type: "sine", gain: 0.2, delay: 0.12 },
    ],
    file: "/sounds/sfx/deck-save.wav",
  },
  "deck.error": {
    cooldownMs: 180,
    gain: 0.42,
    tones: [
      { freq: 220, dur: 0.07, type: "square", gain: 0.16 },
      { freq: 170, dur: 0.09, type: "triangle", gain: 0.14, delay: 0.06 },
    ],
    file: "/sounds/sfx/deck-error.wav",
  },
  "codex.page_turn": {
    cooldownMs: 100,
    gain: 0.4,
    tones: [
      { freq: 280, dur: 0.04, type: "triangle", gain: 0.18 },
      { freq: 420, dur: 0.06, type: "sine", gain: 0.16, delay: 0.03 },
    ],
    file: "/sounds/sfx/codex-page-turn.wav",
  },
  "codex.discover": {
    cooldownMs: 400,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 392, dur: 0.08, type: "sine", gain: 0.28 },
      { freq: 523, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.07 },
      { freq: 784, dur: 0.16, type: "sine", gain: 0.24, delay: 0.16 },
    ],
    file: "/sounds/sfx/codex-discover.wav",
  },
  "codex.inspect": {
    cooldownMs: 120,
    gain: 0.35,
    tones: [
      { freq: 640, dur: 0.035, type: "sine", gain: 0.24 },
      { freq: 960, dur: 0.05, type: "triangle", gain: 0.16, delay: 0.03 },
    ],
    file: "/sounds/sfx/codex-inspect.wav",
  },
  "codex.reward": {
    cooldownMs: 350,
    gain: 0.58,
    duck: true,
    tones: [
      { freq: 587, dur: 0.07, type: "sine", gain: 0.28 },
      { freq: 740, dur: 0.09, type: "triangle", gain: 0.26, delay: 0.06 },
      { freq: 987, dur: 0.14, type: "sine", gain: 0.22, delay: 0.14 },
    ],
    file: "/sounds/sfx/codex-reward.wav",
  },
  "codex.locked": {
    cooldownMs: 160,
    gain: 0.3,
    tones: [
      { freq: 180, dur: 0.05, type: "triangle", gain: 0.18 },
      { freq: 140, dur: 0.07, type: "sine", gain: 0.14, delay: 0.04 },
    ],
    file: "/sounds/sfx/codex-locked.wav",
  },
  "collection.open": {
    cooldownMs: 400,
    gain: 0.42,
    tones: [
      { freq: 300, dur: 0.06, type: "triangle", gain: 0.2 },
      { freq: 450, dur: 0.1, type: "sine", gain: 0.22, delay: 0.05 },
    ],
    file: "/sounds/sfx/collection-open.wav",
  },
  "collection.select": {
    cooldownMs: 70,
    gain: 0.3,
    tones: [{ freq: 700, dur: 0.03, type: "sine", gain: 0.24 }],
    file: "/sounds/sfx/collection-select.wav",
  },
  "shop.open": {
    cooldownMs: 400,
    gain: 0.4,
    tones: [
      { freq: 360, dur: 0.07, type: "triangle", gain: 0.22 },
      { freq: 540, dur: 0.1, type: "sine", gain: 0.2, delay: 0.06 },
    ],
    file: "/sounds/sfx/shop-open.wav",
  },
  "shop.purchase_ok": {
    cooldownMs: 250,
    gain: 0.55,
    tones: [
      { freq: 660, dur: 0.05, type: "sine", gain: 0.3 },
      { freq: 880, dur: 0.08, type: "sine", gain: 0.28, delay: 0.05 },
      { freq: 1320, dur: 0.06, type: "triangle", gain: 0.2, delay: 0.12 },
    ],
    file: "/sounds/sfx/shop-ok.wav",
  },
  "shop.purchase_fail": {
    cooldownMs: 250,
    gain: 0.45,
    tones: [
      { freq: 240, dur: 0.08, type: "square", gain: 0.18 },
      { freq: 180, dur: 0.1, type: "square", gain: 0.14, delay: 0.07 },
    ],
    file: "/sounds/sfx/shop-fail.wav",
  },
  "marketplace.list": {
    cooldownMs: 220,
    gain: 0.45,
    tones: [
      { freq: 520, dur: 0.05, type: "sine", gain: 0.24 },
      { freq: 780, dur: 0.07, type: "triangle", gain: 0.2, delay: 0.04 },
    ],
    file: "/sounds/sfx/marketplace-list.wav",
  },
  "marketplace.bid": {
    cooldownMs: 180,
    gain: 0.42,
    tones: [
      { freq: 600, dur: 0.04, type: "sine", gain: 0.24 },
      { freq: 900, dur: 0.06, type: "triangle", gain: 0.18, delay: 0.035 },
    ],
    file: "/sounds/sfx/marketplace-bid.wav",
  },
  "marketplace.sol_transfer": {
    cooldownMs: 280,
    gain: 0.48,
    tones: [
      { freq: 440, dur: 0.06, type: "sine", gain: 0.24 },
      { freq: 660, dur: 0.08, type: "triangle", gain: 0.22, delay: 0.05 },
      { freq: 880, dur: 0.1, type: "sine", gain: 0.18, delay: 0.12 },
    ],
    file: "/sounds/sfx/marketplace-sol-transfer.wav",
  },
  "guild.open": {
    cooldownMs: 500,
    gain: 0.45,
    tones: [
      { freq: 196, dur: 0.12, type: "sine", gain: 0.22 },
      { freq: 294, dur: 0.14, type: "triangle", gain: 0.22, delay: 0.1 },
    ],
    file: "/sounds/sfx/guild-open.wav",
  },
  "guild.invite": {
    cooldownMs: 300,
    gain: 0.48,
    tones: [
      { freq: 700, dur: 0.05, type: "sine", gain: 0.24 },
      { freq: 1050, dur: 0.08, type: "triangle", gain: 0.2, delay: 0.05 },
    ],
    file: "/sounds/sfx/guild-invite.wav",
  },
  "guild.join": {
    cooldownMs: 400,
    gain: 0.55,
    duck: true,
    tones: [
      { freq: 392, dur: 0.08, type: "sine", gain: 0.26 },
      { freq: 523, dur: 0.1, type: "triangle", gain: 0.24, delay: 0.07 },
      { freq: 659, dur: 0.14, type: "sine", gain: 0.22, delay: 0.16 },
    ],
    file: "/sounds/sfx/guild-join.wav",
  },
  "housing.enter": {
    cooldownMs: 500,
    gain: 0.45,
    tones: [
      { freq: 220, dur: 0.1, type: "sine", gain: 0.2 },
      { freq: 330, dur: 0.14, type: "triangle", gain: 0.22, delay: 0.08 },
    ],
    file: "/sounds/sfx/housing-enter.wav",
  },
  "housing.place": {
    cooldownMs: 120,
    gain: 0.4,
    tones: [
      { freq: 280, dur: 0.04, type: "triangle", gain: 0.2 },
      { freq: 200, dur: 0.05, type: "sine", gain: 0.16, delay: 0.03 },
    ],
    file: "/sounds/sfx/housing-place.wav",
  },
  "housing.pickup": {
    cooldownMs: 120,
    gain: 0.36,
    tones: [
      { freq: 360, dur: 0.035, type: "sine", gain: 0.2 },
      { freq: 480, dur: 0.05, type: "triangle", gain: 0.16, delay: 0.03 },
    ],
    file: "/sounds/sfx/housing-pickup.wav",
  },
  "notify.toast": {
    cooldownMs: 180,
    gain: 0.4,
    tones: [{ freq: 980, dur: 0.05, type: "sine", gain: 0.24 }],
    file: "/sounds/sfx/notify-toast.wav",
  },
  "notify.achievement": {
    cooldownMs: 500,
    gain: 0.58,
    duck: true,
    tones: [
      { freq: 523, dur: 0.08, type: "sine", gain: 0.28 },
      { freq: 659, dur: 0.1, type: "triangle", gain: 0.26, delay: 0.07 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.22, delay: 0.16 },
    ],
    file: "/sounds/sfx/notify-achievement.wav",
  },
  "notify.friend": {
    cooldownMs: 350,
    gain: 0.48,
    tones: [
      { freq: 640, dur: 0.05, type: "sine", gain: 0.24 },
      { freq: 860, dur: 0.08, type: "triangle", gain: 0.2, delay: 0.05 },
    ],
    file: "/sounds/sfx/notify-friend.wav",
  },
  "voice.narrator_line": {
    cooldownMs: 400,
    gain: 0.55,
    tones: [
      { freq: 180, dur: 0.2, type: "sine", gain: 0.18 },
      { freq: 220, dur: 0.22, type: "triangle", gain: 0.14, delay: 0.12 },
    ],
    file: "/sounds/sfx/voice-narrator.wav",
  },
  "voice.announcer_ready": {
    cooldownMs: 500,
    gain: 0.55,
    tones: [
      { freq: 200, dur: 0.1, type: "triangle", gain: 0.22 },
      { freq: 300, dur: 0.14, type: "sine", gain: 0.2, delay: 0.08 },
    ],
    file: "/sounds/sfx/voice-announcer-ready.wav",
  },
  "voice.announcer_victory": {
    cooldownMs: 600,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 262, dur: 0.1, type: "sine", gain: 0.24 },
      { freq: 392, dur: 0.12, type: "triangle", gain: 0.22, delay: 0.09 },
      { freq: 523, dur: 0.16, type: "sine", gain: 0.2, delay: 0.2 },
    ],
    file: "/sounds/sfx/voice-announcer-victory.wav",
  },
  "world.footstep": {
    cooldownMs: 220,
    gain: 0.12,
    ambient: true,
    tones: [{ freq: 110, dur: 0.035, type: "triangle", gain: 0.15 }],
  },
  "world.npc_talk": {
    cooldownMs: 200,
    gain: 0.4,
    tones: [
      { freq: 480, dur: 0.04, type: "sine", gain: 0.25 },
      { freq: 560, dur: 0.05, type: "sine", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-npc.wav",
  },
  "world.npc_greet": {
    cooldownMs: 350,
    gain: 0.42,
    tones: [
      { freq: 520, dur: 0.05, type: "sine", gain: 0.26 },
      { freq: 660, dur: 0.07, type: "triangle", gain: 0.24, delay: 0.05 },
    ],
    file: "/sounds/sfx/world-npc-greet.wav",
  },
  "world.npc_work": {
    cooldownMs: 400,
    gain: 0.35,
    ambient: true,
    tones: [
      { freq: 180, dur: 0.05, type: "square", gain: 0.12 },
      { freq: 140, dur: 0.06, type: "triangle", gain: 0.1, delay: 0.05 },
    ],
    file: "/sounds/sfx/world-npc-work.wav",
  },
  "world.portal": {
    cooldownMs: 400,
    gain: 0.55,
    duck: true,
    tones: [
      { freq: 200, dur: 0.12, type: "sawtooth", gain: 0.1 },
      { freq: 400, dur: 0.14, type: "triangle", gain: 0.22, delay: 0.08 },
      { freq: 800, dur: 0.18, type: "sine", gain: 0.25, delay: 0.18 },
    ],
    file: "/sounds/sfx/world-portal.wav",
  },
  "world.fast_travel": {
    cooldownMs: 500,
    gain: 0.5,
    duck: true,
    tones: [
      { freq: 280, dur: 0.1, type: "sine", gain: 0.18 },
      { freq: 560, dur: 0.14, type: "triangle", gain: 0.22, delay: 0.08 },
      { freq: 840, dur: 0.16, type: "sine", gain: 0.2, delay: 0.16 },
    ],
    file: "/sounds/sfx/world-portal.wav",
  },
  "world.gateway_activate": {
    cooldownMs: 800,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 160, dur: 0.14, type: "sawtooth", gain: 0.12 },
      { freq: 320, dur: 0.16, type: "triangle", gain: 0.2, delay: 0.1 },
      { freq: 640, dur: 0.22, type: "sine", gain: 0.28, delay: 0.22 },
      { freq: 960, dur: 0.18, type: "sine", gain: 0.18, delay: 0.36 },
    ],
    file: "/sounds/sfx/world-portal.wav",
  },
  "world.gather": {
    cooldownMs: 200,
    gain: 0.4,
    tones: [
      { freq: 360, dur: 0.05, type: "triangle", gain: 0.25 },
      { freq: 540, dur: 0.07, type: "sine", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-gather.wav",
  },
  "world.loot": {
    cooldownMs: 180,
    gain: 0.45,
    tones: [
      { freq: 880, dur: 0.04, type: "sine", gain: 0.28 },
      { freq: 1320, dur: 0.08, type: "triangle", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-loot.wav",
  },
  "rewards.claim": {
    cooldownMs: 350,
    gain: 0.6,
    duck: true,
    tones: [
      { freq: 587, dur: 0.07, type: "sine", gain: 0.3 },
      { freq: 740, dur: 0.08, type: "sine", gain: 0.28, delay: 0.06 },
      { freq: 987, dur: 0.14, type: "triangle", gain: 0.26, delay: 0.14 },
    ],
    file: "/sounds/sfx/rewards-claim.wav",
  },
  "rewards.estimate_tick": {
    cooldownMs: 900,
    gain: 0.22,
    ambient: true,
    tones: [{ freq: 980, dur: 0.045, type: "sine", gain: 0.18 }],
    file: "/sounds/sfx/rewards-chime.wav",
  },
  "weather.rain": {
    cooldownMs: 2500,
    gain: 0.25,
    ambient: true,
    tones: [
      { freq: 800, dur: 0.08, type: "sine", gain: 0.08 },
      { freq: 1200, dur: 0.1, type: "triangle", gain: 0.06, delay: 0.05 },
    ],
    file: "/sounds/sfx/weather-rain.wav",
  },
  "weather.thunder": {
    cooldownMs: 5000,
    gain: 0.4,
    ambient: true,
    duck: true,
    tones: [
      { freq: 60, dur: 0.2, type: "sawtooth", gain: 0.18 },
      { freq: 40, dur: 0.35, type: "sine", gain: 0.14, delay: 0.1 },
    ],
    file: "/sounds/sfx/weather-thunder.wav",
  },
  "weather.wind": {
    cooldownMs: 3000,
    gain: 0.22,
    ambient: true,
    tones: [{ freq: 180, dur: 0.25, type: "triangle", gain: 0.1 }],
    file: "/sounds/sfx/weather-wind.wav",
  },
};

type Listener = (prefs: SfxPrefs) => void;

const CARE_ACTION_SFX: Record<string, SfxEventId> = {
  FEED: "pets.feed",
  COOK_MEAL: "pets.feed",
  TREAT: "pets.feed",
  GIVE_WATER: "pets.water",
  PLAY: "pets.play",
  WALK: "pets.play",
  ADVENTURE: "pets.play",
  SOCIALIZE: "pets.play",
  EXERCISE: "pets.play",
  CLEAN: "pets.clean",
  BRUSH: "pets.clean",
  GROOM: "pets.clean",
  REST: "pets.rest",
  SLEEP: "pets.rest",
  MEDITATE: "pets.rest",
  HEAL: "pets.heal",
  MEDICINE: "pets.heal",
  VET: "pets.heal",
  RECOVERY_CENTER: "pets.heal",
  PET: "pets.care",
  ENCOURAGE: "pets.care",
  DECORATE: "pets.care",
  TRAIN: "pets.care",
  LEARN_TRICK: "pets.care",
  GIVE_ITEM: "pets.feed",
};

class SfxEngine {
  private ctx: AudioContext | null = null;
  private lastPlayed = new Map<SfxEventId, number>();
  private listeners = new Set<Listener>();
  private fileCache = new Map<string, HTMLAudioElement>();
  private fileFailed = new Set<string>();
  private unsubManager: (() => void) | null = null;

  init() {
    if (typeof window === "undefined") return;
    audioManager.init();
    if (!this.unsubManager) {
      this.unsubManager = audioManager.subscribe(() => this.emitCompat());
    }
  }

  /** Compat snapshot for legacy useSfx (maps to ui+sfx groups). */
  getPrefs(): SfxPrefs {
    const p = audioManager.getPrefs();
    const volume = Math.max(p.volumes.sfx, p.volumes.ui);
    return {
      muted: p.mutedAll || volume <= 0,
      volume,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getPrefs());
    return () => this.listeners.delete(listener);
  }

  setMuted(muted: boolean) {
    if (muted) {
      audioManager.setVolume("sfx", 0);
      audioManager.setVolume("ui", 0);
    } else {
      const p = audioManager.getPrefs();
      if (p.volumes.sfx <= 0) audioManager.setVolume("sfx", 0.45);
      if (p.volumes.ui <= 0) audioManager.setVolume("ui", 0.45);
      if (p.mutedAll) audioManager.setMutedAll(false);
    }
    this.emitCompat();
  }

  setVolume(volume: number) {
    const v = clamp01(volume);
    audioManager.setVolume("sfx", v);
    audioManager.setVolume("ui", v);
    if (v > 0) audioManager.setMutedAll(false);
    this.emitCompat();
  }

  toggleMute() {
    this.setMuted(!this.getPrefs().muted);
  }

  unlock() {
    void audioManager.unlock();
  }

  play(id: SfxEventId, opts?: PlayOpts) {
    if (typeof window === "undefined") return;
    const recipe = RECIPES[id];
    if (!recipe) return;

    const bus = busForEvent(id);
    const busGain = audioManager.gainFor(bus);
    if (busGain <= 0) return;
    if (!opts?.force && recipe.ambient && prefersReducedSound()) return;

    const now = performance.now();
    const last = this.lastPlayed.get(id) ?? 0;
    if (!opts?.force && now - last < recipe.cooldownMs) return;
    this.lastPlayed.set(id, now);

    if (recipe.duck) {
      audioManager.duck(`sfx:${id}`, { amount: 0.4, durationMs: 700 });
    }

    void this.ensureContext().then((ctx) => {
      if (!ctx || audioManager.gainFor(bus) <= 0) return;
      const master =
        busGain * (recipe.gain ?? 1) * clamp01(opts?.gainScale ?? 1);

      let tones = recipe.tones;
      if (id === "world.footstep" && opts?.surface) {
        tones = [FOOTSTEP_TONES[opts.surface] ?? FOOTSTEP_TONES.grass];
      }

      if (recipe.file && !this.fileFailed.has(recipe.file)) {
        this.tryPlayFile(recipe.file, master, () => {
          if (audioManager.gainFor(bus) > 0) {
            this.playProcedural(ctx, tones, master);
          }
        });
        return;
      }

      this.playProcedural(ctx, tones, master);
    });
  }

  playCareAction(action: string) {
    const id = CARE_ACTION_SFX[action] ?? "pets.care";
    this.play(id);
  }

  private emitCompat() {
    const prefs = this.getPrefs();
    for (const l of this.listeners) l(prefs);
  }

  private async ensureContext(): Promise<AudioContext | null> {
    const ctx = await audioManager.getContext();
    this.ctx = ctx;
    return ctx;
  }

  private tryPlayFile(src: string, volume: number, onFail: () => void) {
    let failed = false;
    const failOnce = () => {
      if (failed) return;
      failed = true;
      this.fileFailed.add(src);
      onFail();
    };
    try {
      let proto = this.fileCache.get(src);
      if (!proto) {
        proto = new Audio(src);
        proto.preload = "auto";
        this.fileCache.set(src, proto);
      }
      const node = proto.cloneNode(true) as HTMLAudioElement;
      node.volume = clamp01(volume);
      node.addEventListener("error", failOnce, { once: true });
      void node.play().catch(failOnce);
    } catch {
      failOnce();
    }
  }

  private playProcedural(ctx: AudioContext, tones: ToneStep[], master: number) {
    const t0 = ctx.currentTime;
    const dest = ctx.destination;

    // Soft bandpassed noise tick under the first tone — magical click, not a raw beep.
    if (tones.length > 0 && master > 0.05) {
      const first = tones[0]!;
      const start = t0 + (first.delay ?? 0);
      const dur = Math.min(0.09, first.dur + 0.04);
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, Math.max(1, len), ctx.sampleRate);
      const data = buf.getChannelData(0);
      let y = 0;
      for (let i = 0; i < data.length; i++) {
        const x = Math.random() * 2 - 1;
        y = y * 0.97 + x * 0.03;
        data[i] = y;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = Math.min(4200, first.freq * 2.4);
      bp.Q.value = 0.9;
      const ng = ctx.createGain();
      const peak = clamp01(master * 0.12);
      ng.gain.setValueAtTime(0.0001, start);
      ng.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + 0.008);
      ng.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      src.connect(bp);
      bp.connect(ng);
      ng.connect(dest);
      src.start(start);
      src.stop(start + dur + 0.02);
    }

    for (const step of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = Math.min(6400, step.freq * 4.5);
      osc.type = step.type ?? "sine";
      osc.frequency.value = step.freq;
      const peak = clamp01(master * (step.gain ?? 0.3));
      const start = t0 + (step.delay ?? 0);
      const end = start + step.dur;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(end + 0.02);

      // Quiet octave shimmer for premium UI feel.
      if ((step.type ?? "sine") === "sine" && step.freq >= 300) {
        const harm = ctx.createOscillator();
        const hg = ctx.createGain();
        harm.type = "sine";
        harm.frequency.value = step.freq * 2;
        const hPeak = peak * 0.22;
        hg.gain.setValueAtTime(0.0001, start);
        hg.gain.exponentialRampToValueAtTime(Math.max(0.0001, hPeak), start + 0.01);
        hg.gain.exponentialRampToValueAtTime(0.0001, end);
        harm.connect(hg);
        hg.connect(dest);
        harm.start(start);
        harm.stop(end + 0.02);
      }
    }
  }
}

export const sfx = new SfxEngine();

if (typeof window !== "undefined") {
  sfx.init();
}

export function playSfx(id: SfxEventId, opts?: PlayOpts) {
  sfx.play(id, opts);
}

export function playCareSfx(action: string) {
  sfx.playCareAction(action);
}

export function unlockSfx() {
  sfx.unlock();
}

/** Map hatch rarity string → fanfare cue (after reveal stinger). */
export function playHatchRaritySfx(rarity: string | null | undefined) {
  const key = (rarity ?? "common").toLowerCase();
  const map: Record<string, SfxEventId> = {
    common: "hatchery.rarity_common",
    uncommon: "hatchery.rarity_uncommon",
    rare: "hatchery.rarity_rare",
    epic: "hatchery.rarity_epic",
    legendary: "hatchery.rarity_legendary",
    mythic: "hatchery.rarity_legendary",
  };
  playSfx(map[key] ?? "hatchery.rarity_common");
}

/** Affinity → elemental combat cue. */
export function playElementSfx(affinity: string | null | undefined) {
  const key = (affinity ?? "").toLowerCase();
  const map: Record<string, SfxEventId> = {
    fire: "tcg.element_fire",
    ember: "tcg.element_fire",
    water: "tcg.element_water",
    tide: "tcg.element_water",
    nature: "tcg.element_nature",
    flora: "tcg.element_nature",
    storm: "tcg.element_storm",
    thunder: "tcg.element_storm",
    void: "tcg.element_void",
    shadow: "tcg.element_void",
    light: "tcg.element_light",
    radiant: "tcg.element_light",
  };
  const id = map[key];
  if (id) playSfx(id);
}

export const SFX_EVENTS = Object.keys(RECIPES) as SfxEventId[];
