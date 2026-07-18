/**
 * Gamepad / controller binding stubs for emotes.
 * No navigator.getGamepads polling yet — documented mapping for Phase 2.
 */

export type EmoteControllerAction =
  | "openWheel"
  | "openPanel"
  | "selectSlot0"
  | "selectSlot1"
  | "selectSlot2"
  | "selectSlot3"
  | "selectSlot4"
  | "selectSlot5"
  | "selectSlot6"
  | "selectSlot7"
  | "confirm"
  | "cancel"
  | "quickPingHelp"
  | "quickPingReady";

export type EmoteControllerBinding = {
  action: EmoteControllerAction;
  /** Suggested button index / semantic name */
  button: string;
  note: string;
};

/** Suggested DualSense / Xbox-style mapping — not wired to input yet. */
export const EMOTE_CONTROLLER_BINDINGS: EmoteControllerBinding[] = [
  {
    action: "openWheel",
    button: "DPadUp",
    note: "Hold to open emote wheel; release to fire highlighted slot",
  },
  {
    action: "openPanel",
    button: "DPadUp+Options",
    note: "Full emote panel (mirrors Shift+T)",
  },
  {
    action: "confirm",
    button: "A / Cross",
    note: "Confirm highlighted emote",
  },
  {
    action: "cancel",
    button: "B / Circle",
    note: "Close wheel / decline consent",
  },
  {
    action: "quickPingHelp",
    button: "DPadRight",
    note: "Rate-limited Help ping",
  },
  {
    action: "quickPingReady",
    button: "DPadLeft",
    note: "Rate-limited Ready ping",
  },
];

export function listControllerEmoteStubs(): EmoteControllerBinding[] {
  return EMOTE_CONTROLLER_BINDINGS.slice();
}
