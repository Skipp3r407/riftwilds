import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, CSSProperties, ReactNode } from "react";
import { buttonSkinPath, type ButtonSkinVariant } from "@/lib/assets/button-skins";
import { cn } from "@/lib/utils/cn";

export type ImageButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "amber"
  | "icon"
  | "tab";

const variantClass: Record<ImageButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
  amber: "btn-amber",
  icon: "btn-icon",
  tab: "btn-tab",
};

type CommonProps = {
  variant?: ImageButtonVariant;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
  /** Optional: force a specific skin asset (defaults follow variant). */
  skin?: ButtonSkinVariant;
  /**
   * Selected / active tab state. Sets `aria-current="page"` unless overridden,
   * and swaps tab skins to the glowing active art.
   */
  selected?: boolean;
};

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type AsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: ComponentProps<typeof Link>["href"];
    disabled?: boolean;
  };

export type ImageButtonProps = AsButton | AsLink;

function skinStyle(skin: ButtonSkinVariant | undefined, selected: boolean): CSSProperties | undefined {
  if (!skin) return undefined;

  if (skin === "tab") {
    return {
      ["--btn-skin" as string]: `url("${buttonSkinPath(selected ? "tab-active" : "tab")}")`,
      ["--btn-skin-hover" as string]: `url("${buttonSkinPath(selected ? "tab-active" : "tab-hover")}")`,
      ["--btn-skin-active" as string]: `url("${buttonSkinPath(selected ? "tab-active" : "tab-hover")}")`,
    };
  }

  return {
    ["--btn-skin" as string]: `url("${buttonSkinPath(skin)}")`,
    ["--btn-skin-hover" as string]: `url("${buttonSkinPath(`${skin}-hover`)}")`,
    ["--btn-skin-active" as string]:
      skin === "primary"
        ? `url("${buttonSkinPath("primary-pressed")}")`
        : `url("${buttonSkinPath(`${skin}-hover`)}")`,
  };
}

/**
 * Accessible page CTA with image button skins.
 * Renders a real `<button>` or Next.js `<Link>` — never a bare clickable `<img>`.
 * Label stays HTML (dynamic / i18n); skin PNGs have no baked text.
 * Site-wide click SFX is handled by HudInteraction.
 */
export function ImageButton(props: ImageButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    skin,
    selected = false,
    ...rest
  } = props;

  const classes = cn(
    variantClass[variant],
    "focus-ring",
    size === "sm" && "btn-sm",
    selected && "is-selected",
    className,
  );
  const style = skinStyle(skin ?? (variant === "tab" ? "tab" : undefined), selected);

  if ("href" in props && props.href != null) {
    const { href, disabled, ...linkRest } = rest as AsLink;
    const { ["aria-current"]: ariaCurrentProp, ...linkAttrs } = linkRest;
    const ariaCurrent = ariaCurrentProp ?? (selected ? ("page" as const) : undefined);
    if (disabled) {
      return (
        <span
          className={classes}
          style={style}
          aria-disabled="true"
          role="link"
          aria-current={ariaCurrent}
        >
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} style={style} {...linkAttrs} aria-current={ariaCurrent}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as AsButton;
  const { ["aria-current"]: ariaCurrentProp, ...buttonAttrs } = buttonRest;
  const ariaCurrent = ariaCurrentProp ?? (selected ? ("page" as const) : undefined);
  return (
    <button type={type} className={classes} style={style} {...buttonAttrs} aria-current={ariaCurrent}>
      {children}
    </button>
  );
}
