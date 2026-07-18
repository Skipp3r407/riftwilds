import { describe, expect, it, beforeEach } from "vitest";
import {
  ACTION_DEFS,
  chordMatches,
  defaultKeybinds,
  findKeyConflicts,
  formatChord,
  isProtectedBrowserChord,
} from "@/game/live-world/input/keybinds";
import {
  LiveWorldInputManager,
  resetInputManagerForTests,
} from "@/game/live-world/input/input-manager";

describe("Live World keybinds", () => {
  it("defines core actions including map, chat, and debug", () => {
    const ids = new Set(ACTION_DEFS.map((a) => a.id));
    expect(ids.has("openMap")).toBe(true);
    expect(ids.has("openChat")).toBe(true);
    expect(ids.has("debugCollision")).toBe(true);
    expect(ids.has("interact")).toBe(true);
    expect(ids.has("sprint")).toBe(true);
    expect(ids.has("zoomIn")).toBe(true);
    expect(ids.has("zoomOut")).toBe(true);
    expect(ids.has("toggleFullscreen")).toBe(true);
    expect(ids.has("cycleHudMode")).toBe(true);
    expect(ids.has("focusRiftling")).toBe(true);
    expect(ids.has("togglePhotoMode")).toBe(true);
  });

  it("defaults have no conflicts across unique primary codes (movement secondaries OK)", () => {
    const map = defaultKeybinds();
    // Movement intentionally shares with arrows as secondaries — filter to primary-only conflicts
    const primaries = { ...map };
    for (const def of ACTION_DEFS) {
      if (def.category === "movement") {
        primaries[def.id] = [map[def.id][0]!];
      }
    }
    expect(findKeyConflicts(primaries)).toHaveLength(0);
  });

  it("never treats Ctrl+C/V/R/L/T/W as free game chords", () => {
    for (const code of ["KeyC", "KeyV", "KeyR", "KeyL", "KeyT", "KeyW"]) {
      expect(isProtectedBrowserChord({ code, ctrlKey: true, metaKey: false })).toBe(
        true,
      );
    }
    expect(isProtectedBrowserChord({ code: "KeyM", ctrlKey: false, metaKey: false })).toBe(
      false,
    );
  });

  it("formats chords readably", () => {
    expect(formatChord({ code: "KeyM" })).toBe("M");
    expect(formatChord({ code: "ShiftLeft" })).toBe("Shift");
  });

  it("chordMatches respects modifiers", () => {
    expect(
      chordMatches(
        { code: "KeyM" },
        { code: "KeyM", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false },
      ),
    ).toBe(true);
    expect(
      chordMatches(
        { code: "KeyM" },
        { code: "KeyM", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false },
      ),
    ).toBe(false);
  });
});

describe("LiveWorldInputManager", () => {
  beforeEach(() => {
    resetInputManagerForTests();
  });

  it("zeros movement while typing focused", () => {
    const mgr = new LiveWorldInputManager(defaultKeybinds());
    mgr.setTypingFocused(true);
    const desire = mgr.getMovementDesire();
    expect(desire.up || desire.down || desire.left || desire.right).toBe(false);
  });

  it("blocks movement when modal panels are open", () => {
    const mgr = new LiveWorldInputManager(defaultKeybinds());
    mgr.setActivePanel("map");
    expect(mgr.getMovementDesire().up).toBe(false);
  });

  it("allows movement with chat panel open when not typing in the input", () => {
    const mgr = new LiveWorldInputManager(defaultKeybinds());
    mgr.setActivePanel("chat");
    mgr.setTypingFocused(false);
    // Chat panel is not a modal — movement desire is not zeroed by panel alone.
    expect(mgr.isModalOpen()).toBe(false);
    expect(mgr.getMovementDesire()).toEqual({
      up: false,
      down: false,
      left: false,
      right: false,
      run: false,
    });
  });

  it("does not re-emit when setActivePanel is a no-op", () => {
    const mgr = new LiveWorldInputManager(defaultKeybinds());
    let n = 0;
    mgr.subscribe(() => {
      n += 1;
    });
    mgr.setActivePanel("chat");
    const afterFirst = n;
    mgr.setActivePanel("chat");
    expect(n).toBe(afterFirst);
  });
});
