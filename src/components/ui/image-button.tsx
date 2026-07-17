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
  | "icon";

const variantClass: Record<ImageButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
  amber: "btn-amber",
  icon: "btn-icon",
};

type CommonProps = {
  variant?: ImageButtonVariant;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
  /** Optional: force a specific skin asset (defaults follow variant). */
  skin?: ButtonSkinVariant;
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

function skinStyle(skin: ButtonSkinVariant | undefined): CSSProperties | undefined {
  if (!skin) return undefined;
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
 */
export function ImageButton(props: ImageButtonProps) {
  const { variant = "primary", size = "md", className, children, skin, ...rest } = props;

  const classes = cn(variantClass[variant], "focus-ring", size === "sm" && "btn-sm", className);
  const style = skinStyle(skin);

  if ("href" in props && props.href != null) {
    const { href, disabled, ...linkRest } = rest as AsLink;
    if (disabled) {
      return (
        <span className={classes} style={style} aria-disabled="true" role="link">
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} style={style} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as AsButton;
  return (
    <button type={type} className={classes} style={style} {...buttonRest}>
      {children}
    </button>
  );
}
