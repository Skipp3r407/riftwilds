/**
 * Voice event bus — slots for narrator / announcer / boss / companion VO.
 * Ships key cues now; remaining matrix documented in the ADD.
 */

import { audioManager } from "@/lib/audio/manager";
import { playSfx, type SfxEventId } from "@/lib/audio/sfx";
import type { AudioPriority } from "@/lib/audio/types";

export type VoiceSlotId =
  | "narrator.line"
  | "announcer.ready"
  | "announcer.victory"
  | "announcer.defeat"
  | "boss.taunt"
  | "boss.phase_vo"
  | "companion.greet"
  | "companion.happy"
  | "companion.angry"
  | "npc.generic";

export type VoiceEvent = {
  slot: VoiceSlotId;
  /** Optional species / character key for future banks */
  characterId?: string;
  /** Optional clip URL override (pre-generated TTS) */
  src?: string;
  priority?: AudioPriority;
  text?: string;
};

type VoiceListener = (event: VoiceEvent) => void;

const SLOT_TO_SFX: Partial<Record<VoiceSlotId, SfxEventId>> = {
  "narrator.line": "voice.narrator_line",
  "announcer.ready": "voice.announcer_ready",
  "announcer.victory": "voice.announcer_victory",
  "announcer.defeat": "combat.lose",
  "boss.taunt": "boss.taunt",
  "boss.phase_vo": "boss.phase",
  "companion.greet": "companion.idle",
  "companion.happy": "companion.happy",
  "companion.angry": "companion.angry",
  "npc.generic": "world.npc_talk",
};

/** Remaining VO matrix — not all ship unique spoken lines this pass. */
export const VO_MATRIX_DEFERRED = [
  { id: "boss.*.intro", note: "Per-boss spoken intros" },
  { id: "boss.*.defeat", note: "Per-boss defeat lines" },
  { id: "companion.*.dialogue", note: "Full dialogue banks beyond cries" },
  { id: "npc.*.quest", note: "Quest-giver VO per region NPC" },
  { id: "announcer.tournament.*", note: "Tournament bracket callouts" },
  { id: "cinematic.opening.*", note: "Opening cinematic full VO track" },
] as const;

class VoiceBus {
  private listeners = new Set<VoiceListener>();
  private lastSlotAt = new Map<VoiceSlotId, number>();
  private el: HTMLAudioElement | null = null;

  subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Fire a voice slot — plays file override or mapped SFX cue. */
  speak(event: VoiceEvent) {
    if (typeof window === "undefined") return;
    if (audioManager.gainFor("voice") <= 0) return;

    const now = performance.now();
    const last = this.lastSlotAt.get(event.slot) ?? 0;
    if (now - last < 180) return;
    this.lastSlotAt.set(event.slot, now);

    for (const l of this.listeners) l(event);

    if (event.src) {
      void this.playUrl(event.src);
      return;
    }

    const sfxId = SLOT_TO_SFX[event.slot];
    if (sfxId) {
      playSfx(sfxId, { force: event.priority === "critical" });
    }
  }

  private async playUrl(src: string) {
    await audioManager.unlock();
    if (!this.el) this.el = new Audio();
    this.el.src = src;
    this.el.volume = Math.max(0.0001, audioManager.gainFor("voice"));
    try {
      await this.el.play();
    } catch {
      /* autoplay / missing file */
    }
  }
}

export const voiceBus = new VoiceBus();

export function speakVoice(event: VoiceEvent) {
  voiceBus.speak(event);
}
