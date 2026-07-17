/** Bump when button skins are regenerated. */
export const BUTTON_SKIN_V = "btn1";

export type ButtonSkinId =
  | "primary"
  | "primary-hover"
  | "primary-pressed"
  | "primary-sm"
  | "secondary"
  | "secondary-hover"
  | "secondary-sm"
  | "danger"
  | "danger-hover"
  | "success"
  | "success-hover"
  | "ghost"
  | "ghost-hover"
  | "amber"
  | "amber-hover"
  | "icon"
  | "icon-hover";

/** Base skins (no state suffix) usable as ImageButton `skin` overrides. */
export type ButtonSkinVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost"
  | "amber"
  | "icon";

export function buttonSkinPath(id: string): string {
  return `/assets/ui/buttons/${id}.webp?v=${BUTTON_SKIN_V}`;
}

export function buttonSkinPngPath(id: ButtonSkinId | ButtonSkinVariant): string {
  return `/assets/ui/buttons/${id}.png?v=${BUTTON_SKIN_V}`;
}

export const BUTTON_SKIN_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
  amber: "btn-amber",
  icon: "btn-icon",
} as const;
