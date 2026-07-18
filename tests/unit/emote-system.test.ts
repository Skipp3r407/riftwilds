import { describe, expect, it, beforeEach } from "vitest";
import {
  EMOTE_CATALOG,
  STARTER_EMOTE_KEYS,
  getEmoteDef,
  resolveEmoteKey,
  defaultWheelSlots,
} from "@/game/live-world/systems/emotes/catalog";
import { createEmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";
import { createEmoteRuntime } from "@/game/live-world/systems/emotes/runtime";
import { createConsentStore } from "@/game/live-world/systems/emotes/consent";
import {
  DEFAULT_PRIVACY,
  canReceiveSocialRequest,
  blockPlayer,
  mutePlayer,
} from "@/game/live-world/systems/emotes/privacy";
import {
  createPingController,
  parsePingCommand,
  PING_TO_EMOTE,
} from "@/game/live-world/systems/emotes/pings";
import {
  moodFromCare,
  createRiftlingReactionController,
  PET_GREET_COOLDOWN_MS,
} from "@/game/live-world/systems/emotes/riftling-reactions";
import {
  pickAuthoredReaction,
  createNpcReactionController,
} from "@/game/live-world/systems/emotes/npc-reactions";
import {
  createEmoteSystem,
  tryParseEmoteSlash,
} from "@/game/live-world/systems/emotes/emote-system";
import {
  defaultUnlocks,
  isEmoteUnlocked,
  unlockEmoteWithCredits,
  setWheelSlot,
  defaultFavorites,
} from "@/game/live-world/systems/emotes/unlocks";
import { parseSlashCommand, createChatStore } from "@/game/live-world/systems/chat";
import { ACTION_DEFS, defaultKeybinds, findKeyConflicts } from "@/game/live-world/input/keybinds";
import { listControllerEmoteStubs } from "@/game/live-world/systems/emotes/controller-stubs";

describe("emote catalog", () => {
  it("includes starter free set with Ready / Not Ready", () => {
    expect(STARTER_EMOTE_KEYS).toContain("wave");
    expect(STARTER_EMOTE_KEYS).toContain("ready");
    expect(STARTER_EMOTE_KEYS).toContain("not_ready");
    for (const key of STARTER_EMOTE_KEYS) {
      const def = getEmoteDef(key);
      expect(def?.tier).toBe("free");
      expect(def?.tags).toContain("safe");
    }
  });

  it("marks social emotes as consent-required and cosmetic-safe", () => {
    for (const key of ["handshake", "high_five", "hug", "fist_bump", "sync_dance"]) {
      const def = getEmoteDef(key);
      expect(def?.requiresConsent).toBe(true);
      expect(def?.kind).toBe("social");
      expect(def?.tags).toContain("consent");
    }
  });

  it("labels premium as cosmetic-only", () => {
    const premium = getEmoteDef("keeper_flourish");
    expect(premium?.tier).toBe("premium_cosmetic");
    expect(premium?.unlockHint.toLowerCase()).toContain("cosmetic");
  });

  it("resolves aliases", () => {
    expect(resolveEmoteKey("hi")).toBe("wave");
    expect(resolveEmoteKey("rdy")).toBe("ready");
    expect(resolveEmoteKey("ty")).toBe("thanks");
  });

  it("default wheel has 8 slots", () => {
    expect(defaultWheelSlots()).toHaveLength(8);
  });

  it("has no combat advantage tags", () => {
    for (const e of EMOTE_CATALOG) {
      expect(e.tags.join(" ")).not.toMatch(/damage|loot|sol|pvp|stat/i);
    }
  });
});

describe("emote runtime", () => {
  it("plays solo emotes and enforces cooldown", () => {
    const bus = createEmoteEventBus();
    const rt = createEmoteRuntime({ bus, isUnlocked: () => true });
    const a = rt.play("wave", { source: "wheel", now: 1000 });
    expect(a.ok).toBe(true);
    const b = rt.play("wave", { source: "wheel", now: 1100 });
    expect(b.ok).toBe(false);
  });

  it("cancels on walk/combat/portal layers", () => {
    const bus = createEmoteEventBus();
    const events: string[] = [];
    bus.subscribe((e) => events.push(e.type));
    const rt = createEmoteRuntime({ bus, isUnlocked: () => true });
    expect(rt.play("cheer", { source: "wheel", now: 1 }).ok).toBe(true);
    rt.setLayer("walk", 2);
    expect(rt.getState().active).toBeNull();
    expect(events).toContain("cancel");
  });

  it("blocks social without consent source", () => {
    const bus = createEmoteEventBus();
    const rt = createEmoteRuntime({ bus, isUnlocked: () => true });
    const r = rt.play("handshake", { source: "wheel", now: 1 });
    expect(r.ok).toBe(false);
  });

  it("anti-spams global burst", () => {
    const bus = createEmoteEventBus();
    const rt = createEmoteRuntime({ bus, isUnlocked: () => true });
    const keys = ["wave", "nod", "hello", "clap", "laugh", "shrug"];
    let last: { ok: boolean } = { ok: true };
    keys.forEach((k, i) => {
      last = rt.play(k, { source: "wheel", now: 10_000 + i * 500 });
    });
    expect(last.ok).toBe(false);
  });

  it("shortens duration under reduced motion", () => {
    const bus = createEmoteEventBus();
    const rt = createEmoteRuntime({
      bus,
      isUnlocked: () => true,
      prefersReducedMotion: () => true,
    });
    const r = rt.play("dance", { source: "wheel", now: 1 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.endsAt - 1).toBeLessThanOrEqual(600);
    }
  });
});

describe("consent", () => {
  it("requires mutual accept before social play", () => {
    const store = createConsentStore();
    const req = store.request({
      fromId: "a",
      fromLabel: "A",
      toId: "b",
      emoteKey: "high_five",
      targetPrivacy: { ...DEFAULT_PRIVACY },
      now: 1000,
    });
    expect(req.ok).toBe(true);
    if (!req.ok) return;
    const declined = store.resolve(req.request.id, "declined", 1100);
    expect(declined.ok).toBe(true);
    expect(declined.ok && declined.request.status).toBe("declined");
  });

  it("respects block list", () => {
    let privacy = { ...DEFAULT_PRIVACY, mutedPlayerIds: [] as string[], blockedPlayerIds: [] as string[] };
    privacy = blockPlayer(privacy, "toxic");
    expect(canReceiveSocialRequest(privacy, "toxic").ok).toBe(false);
  });

  it("respects mute list", () => {
    let privacy = { ...DEFAULT_PRIVACY, mutedPlayerIds: [] as string[], blockedPlayerIds: [] as string[] };
    privacy = mutePlayer(privacy, "noisy");
    expect(canReceiveSocialRequest(privacy, "noisy").ok).toBe(false);
  });
});

describe("pings", () => {
  it("rate limits identical pings", () => {
    const bus = createEmoteEventBus();
    const pings = createPingController(bus);
    expect(pings.fire("help", { now: 1 }).ok).toBe(true);
    expect(pings.fire("help", { now: 100 }).ok).toBe(false);
    expect(parsePingCommand("follow")).toBe("follow_me");
    expect(PING_TO_EMOTE.ready).toBe("ready");
  });
});

describe("riftling + npc reactions", () => {
  it("maps mood from care stats", () => {
    expect(moodFromCare({ stress: 80 })).toBe("stressed");
    expect(moodFromCare({ energy: 10 })).toBe("tired");
    expect(moodFromCare({ bond: 80, happiness: 80 })).toBe("bonded");
  });

  it("rate limits pet greetings", () => {
    const bus = createEmoteEventBus();
    const pet = createRiftlingReactionController(bus);
    expect(pet.tryPetGreeting("other", { happiness: 80 }, 1).ok).toBe(true);
    expect(pet.tryPetGreeting("other", { happiness: 80 }, 100).ok).toBe(false);
    expect(PET_GREET_COOLDOWN_MS).toBeGreaterThan(1000);
  });

  it("has authored NPC wave-back fallback", () => {
    const r = pickAuthoredReaction("wave", 0);
    expect(r?.emoteKey).toBeTruthy();
    expect(r?.line.length).toBeGreaterThan(0);
    const bus = createEmoteEventBus();
    const npc = createNpcReactionController(bus);
    expect(npc.tryReact({ npcSlug: "mira", playerEmoteKey: "salute", now: 1 }).ok).toBe(true);
  });
});

describe("unlocks + favorites", () => {
  it("keeps starter free unlocked", () => {
    const u = defaultUnlocks();
    expect(isEmoteUnlocked(u, "wave")).toBe(true);
    expect(isEmoteUnlocked(u, "rift_spark")).toBe(false);
  });

  it("unlocks credits cosmetics with clear note", () => {
    const u = defaultUnlocks();
    const r = unlockEmoteWithCredits(u, "rift_spark", 1000);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.note.toLowerCase()).toContain("cosmetic");
  });

  it("assigns wheel slots", () => {
    const next = setWheelSlot(defaultFavorites(), 0, "dance");
    expect(next.wheelSlots[0]).toBe("dance");
  });
});

describe("chat slash emotes", () => {
  it("parses /wave and /emote dance", () => {
    expect(tryParseEmoteSlash("/wave")?.kind).toBe("emote");
    expect(tryParseEmoteSlash("/emote dance")?.key).toBe("dance");
    const wave = parseSlashCommand("/wave");
    expect(wave?.kind).toBe("emote");
    if (wave?.kind === "emote") expect(wave.emoteKey).toBe("wave");
  });

  it("parses /ping help", () => {
    const ping = parseSlashCommand("/ping help");
    expect(ping?.kind).toBe("ping");
  });

  it("submit returns emoteKey without requiring WASD", () => {
    const store = createChatStore();
    const r = store.submit("/nod", { from: "Keeper" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.emoteKey).toBe("nod");
  });

  it("keeps /me text when not a single emote token", () => {
    const r = parseSlashCommand("/me looks around curiously");
    expect(r?.kind).toBe("message");
  });
});

describe("emote system orchestration", () => {
  beforeEach(() => {
    // localStorage may be absent in some runners — system still constructs
  });

  it("plays solo and publishes bus event", () => {
    const sys = createEmoteSystem();
    const types: string[] = [];
    sys.bus.subscribe((e) => types.push(e.type));
    expect(sys.playSolo("wave").ok).toBe(true);
    expect(types).toContain("play");
  });

  it("social request then accept plays", () => {
    const sys = createEmoteSystem();
    const req = sys.requestSocial({ emoteKey: "handshake", toId: "friend-1" });
    expect(req.ok).toBe(true);
    if (!req.ok) return;
    const resolved = sys.resolveConsent(req.request.id, "accepted");
    expect(resolved.ok).toBe(true);
    expect(sys.runtime.getState().active?.emoteKey).toBe("handshake");
  });
});

describe("keybinds + controller stubs", () => {
  it("binds T to emote wheel and Shift+T to panel", () => {
    const ids = new Set(ACTION_DEFS.map((a) => a.id));
    expect(ids.has("openEmoteWheel")).toBe(true);
    expect(ids.has("openEmotePanel")).toBe(true);
    const map = defaultKeybinds();
    expect(map.openEmoteWheel[0]?.code).toBe("KeyT");
    expect(map.openEmotePanel[0]).toMatchObject({ code: "KeyT", shift: true });
    const primaries = { ...map };
    for (const def of ACTION_DEFS) {
      if (def.category === "movement") primaries[def.id] = [map[def.id][0]!];
    }
    expect(findKeyConflicts(primaries)).toHaveLength(0);
  });

  it("exposes controller binding stubs", () => {
    expect(listControllerEmoteStubs().length).toBeGreaterThan(3);
  });
});
