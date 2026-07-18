/**
 * Gamepad stubs for fullscreen / HUD — not wired to navigator.getGamepads yet.
 */

export type ImmersiveControllerAction =
  | "toggleFullscreen"
  | "cycleHudMode"
  | "revealHud"
  | "togglePhotoMode"
  | "focusRiftling"
  | "exitImmersive";

export type ImmersiveControllerBinding = {
  action: ImmersiveControllerAction;
  button: string;
  note: string;
};

export const IMMERSIVE_CONTROLLER_BINDINGS: ImmersiveControllerBinding[] = [
  {
    action: "toggleFullscreen",
    button: "View / Select (hold)",
    note: "Toggle browser fullscreen or viewport expand",
  },
  {
    action: "cycleHudMode",
    button: "View + DPadUp",
    note: "Cycle Standard → Minimal → Immersive → Cinematic",
  },
  {
    action: "revealHud",
    button: "Any face button (while hidden)",
    note: "Reveal auto-hidden HUD chrome",
  },
  {
    action: "togglePhotoMode",
    button: "View + A",
    note: "Enter / exit photo mode stub",
  },
  {
    action: "focusRiftling",
    button: "View + X",
    note: "Toggle camera focus onto companion",
  },
  {
    action: "exitImmersive",
    button: "B / Circle",
    note: "Exit photo / cinematic overlays — never traps input",
  },
];

export function listImmersiveControllerStubs(): ImmersiveControllerBinding[] {
  return IMMERSIVE_CONTROLLER_BINDINGS.slice();
}
