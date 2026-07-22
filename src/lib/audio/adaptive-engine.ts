/**
 * Adaptive soundscape engine — stereo buses, intensity layers, priority one-shots.
 * Builds on AudioManager ducking + MusicEngine crossfade + stem mixer + reverb zones.
 */

import { audioManager } from "@/lib/audio/manager";
import { musicEngine } from "@/lib/audio/music";
import { ambientEngine } from "@/lib/audio/ambient";
import { pauseAllBeds } from "@/lib/audio/beds";
import { musicStems } from "@/lib/audio/music-stems";
import { readMusicUiPaused } from "@/lib/audio/music-ui";
import { reverbEngine } from "@/lib/audio/reverb";
import { playSfx, type SfxEventId } from "@/lib/audio/sfx";
import { clamp01 } from "@/lib/audio/prefs";
import type { AudioPriority } from "@/lib/audio/types";

export type SoundscapeMode =
  | "menu"
  | "login"
  | "explore"
  | "hatchery"
  | "marketplace"
  | "shop"
  | "codex"
  | "deck"
  | "collection"
  | "housing"
  | "guild"
  | "arena"
  | "tournament"
  | "battle"
  | "boss"
  | "victory"
  | "defeat"
  | "cinematic";

type PriorityRank = 0 | 1 | 2 | 3;

const PRIORITY_RANK: Record<AudioPriority, PriorityRank> = {
  low: 0,
  normal: 1,
  high: 2,
  critical: 3,
};

type LayerState = {
  intensity: number;
  mode: SoundscapeMode;
  regionId: string | null;
};

/**
 * Coordinates music / ambient / stems / reverb / SFX into a single adaptive bed.
 * Intensity 0 = calm hub · 1 = peak combat / boss.
 */
class AdaptiveAudioEngine {
  private state: LayerState = {
    intensity: 0.15,
    mode: "menu",
    regionId: null,
  };
  private lastPriority: PriorityRank = 0;
  private priorityUntil = 0;
  private combatBedActive = false;

  getState(): Readonly<LayerState> {
    return this.state;
  }

  /**
   * Enter a UI / game surface — sets ambient/stems/reverb/SFX posture.
   *
   * Dock playlist music is user-owned: route/page soundscapes must NOT
   * crossfade or restart the HTMLAudio playlist. Live-world region themes
   * and in-match battle/boss beds may still opt into playlist changes via
   * `switchPlaylist` (default off except battle/boss).
   */
  async enterMode(
    mode: SoundscapeMode,
    opts: {
      regionId?: string;
      fadeMs?: number;
      /** When true, may change the dock playlist track. Default: battle/boss only. */
      switchPlaylist?: boolean;
    } = {},
  ) {
    this.state.mode = mode;
    const fadeMs = opts.fadeMs ?? 900;
    const switchPlaylist =
      opts.switchPlaylist ?? (mode === "battle" || mode === "boss");

    const hubish =
      mode === "menu" ||
      mode === "login" ||
      mode === "marketplace" ||
      mode === "shop" ||
      mode === "codex" ||
      mode === "deck" ||
      mode === "collection" ||
      mode === "housing" ||
      mode === "guild" ||
      mode === "hatchery";

    // User paused the floating Ambience player — keep beds silent.
    // (Do not stack procedural drones under the playlist; they survive HTMLAudio.pause.)
    const userPaused = readMusicUiPaused();

    if (hubish) {
      this.state.intensity =
        mode === "hatchery" ? 0.28 : mode === "login" ? 0.22 : 0.18;
      this.state.regionId = null;
      this.combatBedActive = false;
      void musicStems.stop(600);
      // Playlist is the hub bed. Starting menu oscillators here raced past
      // MusicPlayer's stopAmbient and left a sine hum after pause.
      ambientEngine.stop(300);
      if (userPaused) {
        pauseAllBeds();
      }
      // Do not call playMenuTheme — that restarted / swapped tracks on every nav.
      if (mode === "login") {
        playSfx("login.enter");
      }
      if (mode === "housing") {
        playSfx("housing.enter");
      }
      if (mode === "guild") {
        playSfx("guild.open");
      }
      if (mode === "collection") {
        playSfx("collection.open");
      }
      if (mode === "shop" || mode === "marketplace") {
        playSfx("shop.open");
      }
    } else {
      switch (mode) {
        case "explore":
          this.state.intensity = 0.35;
          this.state.regionId = opts.regionId ?? "riftwild-commons";
          this.combatBedActive = false;
          void musicStems.stop(600);
          if (this.state.regionId) {
            if (userPaused) {
              pauseAllBeds();
            } else if (switchPlaylist) {
              await musicEngine.playRegionTheme(this.state.regionId, fadeMs);
              ambientEngine.startRegion(this.state.regionId);
            } else {
              // Keep dock playlist; still seat regional ambience under it.
              ambientEngine.startRegion(this.state.regionId);
            }
          }
          break;
        case "arena":
        case "tournament":
          this.state.intensity = mode === "tournament" ? 0.62 : 0.55;
          this.combatBedActive = true;
          audioManager.duck("adaptive:arena-enter", {
            amount: 0.3,
            durationMs: 1000,
            buses: ["ambient"],
          });
          // Hub/lobby pages must not yank the dock playlist to Pulse.
          if (switchPlaylist) {
            await musicEngine.playTrack(3, fadeMs); // Pulse
          }
          void musicStems.startCombatBed();
          if (mode === "tournament") playSfx("tournament.start");
          else playSfx("arena.start");
          break;
        case "battle":
          this.state.intensity = 0.72;
          this.combatBedActive = true;
          audioManager.duck("adaptive:battle-enter", {
            amount: 0.35,
            durationMs: 1200,
            buses: ["ambient"],
          });
          if (switchPlaylist) {
            await musicEngine.playTrack(4, fadeMs); // Urgent
          }
          void musicStems.startCombatBed();
          void musicStems.setIntensity(0.72);
          break;
        case "boss":
          this.state.intensity = 0.9;
          this.combatBedActive = true;
          audioManager.duck("adaptive:boss-enter", {
            amount: 0.5,
            durationMs: 1600,
            buses: ["ambient", "music"],
          });
          if (switchPlaylist) {
            await musicEngine.playTrack(7, fadeMs); // Menacing
          }
          void musicStems.startBossBed();
          playSfx("boss.enter");
          break;
        case "victory":
          this.state.intensity = 0.55;
          void musicStems.stop(900);
          audioManager.duck("adaptive:victory", {
            amount: 0.5,
            durationMs: 1600,
            buses: ["music", "ambient"],
          });
          break;
        case "defeat":
          this.state.intensity = 0.25;
          void musicStems.stop(900);
          audioManager.duck("adaptive:defeat", {
            amount: 0.55,
            durationMs: 1800,
            buses: ["music", "ambient"],
          });
          break;
        case "cinematic":
          this.state.intensity = 0.45;
          this.combatBedActive = false;
          void musicStems.stop(400);
          audioManager.duck("adaptive:cinematic", {
            amount: 0.4,
            durationMs: 2200,
            buses: ["music", "ambient"],
          });
          playSfx("cinematic.stinger");
          break;
        default:
          break;
      }
    }

    void reverbEngine.setZone(
      reverbEngine.zoneForMode(mode, this.state.regionId),
      fadeMs,
    );
    this.applyIntensityGains();
  }

  /** 0–1 combat / tension blend. Smoothly ducks ambient, lifts stems. */
  setIntensity(value: number) {
    this.state.intensity = clamp01(value);
    this.applyIntensityGains();
    if (this.combatBedActive) {
      void musicStems.setIntensity(this.state.intensity);
    }
  }

  /**
   * Play a one-shot with priority. Lower-priority cues are skipped while a
   * higher-priority cue window is open (prevents click spam under stingers).
   */
  playCue(
    id: SfxEventId,
    opts: {
      priority?: AudioPriority;
      force?: boolean;
      gainScale?: number;
    } = {},
  ) {
    const priority = opts.priority ?? "normal";
    const rank = PRIORITY_RANK[priority];
    const now = performance.now();

    if (!opts.force && now < this.priorityUntil && rank < this.lastPriority) {
      return;
    }

    if (rank >= this.lastPriority || now >= this.priorityUntil) {
      this.lastPriority = rank;
      this.priorityUntil =
        now + (rank >= 2 ? 420 : rank === 1 ? 120 : 60);
    }

    if (priority === "high" || priority === "critical") {
      audioManager.duck(`adaptive:cue:${id}`, {
        amount: priority === "critical" ? 0.55 : 0.35,
        durationMs: priority === "critical" ? 1100 : 700,
      });
    }

    playSfx(id, {
      force: opts.force,
      gainScale: opts.gainScale,
    });
  }

  /** Soft exit from combat bed back to menu / explore. */
  async leaveBattle(to: "menu" | "explore" = "menu", regionId?: string) {
    this.combatBedActive = false;
    void musicStems.stop(700);
    if (to === "explore" && regionId) {
      await this.enterMode("explore", { regionId });
    } else {
      await this.enterMode("menu");
    }
  }

  isCombatBedActive() {
    return this.combatBedActive;
  }

  private applyIntensityGains() {
    const i = this.state.intensity;
    if (i > 0.55) {
      audioManager.duck("adaptive:intensity", {
        amount: 0.2 + (i - 0.55) * 0.5,
        durationMs: 800,
        buses: ["ambient"],
      });
    } else {
      audioManager.clearDuck("adaptive:intensity");
    }
  }
}

export const adaptiveAudio = new AdaptiveAudioEngine();

export function enterSoundscape(
  mode: SoundscapeMode,
  opts?: { regionId?: string; fadeMs?: number; switchPlaylist?: boolean },
) {
  return adaptiveAudio.enterMode(mode, opts);
}

export function setSoundscapeIntensity(value: number) {
  adaptiveAudio.setIntensity(value);
}

export function playAdaptiveCue(
  id: SfxEventId,
  opts?: { priority?: AudioPriority; force?: boolean; gainScale?: number },
) {
  adaptiveAudio.playCue(id, opts);
}
