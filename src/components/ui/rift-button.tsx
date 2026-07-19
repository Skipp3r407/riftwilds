import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

export type RiftButtonTone = "gold" | "arcane" | "obsidian" | "ghost";
export type RiftButtonSize = "sm" | "md" | "lg";

type Common = {
  tone?: RiftButtonTone;
  size?: RiftButtonSize;
  className?: string;
  children: ReactNode;
};

type AsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type AsLink = Common &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: ComponentProps<typeof Link>["href"];
    disabled?: boolean;
  };

export type RiftButtonProps = AsButton | AsLink;

const toneClass: Record<RiftButtonTone, string> = {
  gold: "rift-btn--gold",
  arcane: "rift-btn--arcane",
  obsidian: "rift-btn--obsidian",
  ghost: "rift-btn--ghost",
};

const sizeClass: Record<RiftButtonSize, string> = {
  sm: "rift-btn--sm",
  md: "rift-btn--md",
  lg: "rift-btn--lg",
};

/**
 * Premium CTA / secondary control with material bevel (not flat web buttons).
 */
export const RiftButton = forwardRef<HTMLButtonElement, RiftButtonProps>(
  function RiftButton(props, ref) {
    const { tone = "gold", size = "md", className, children, ...rest } = props;
    const classes = cn("rift-btn", toneClass[tone], sizeClass[size], className);

    if ("href" in props && props.href != null) {
      const { href, disabled, ...linkRest } = rest as AsLink;
      if (disabled) {
        return (
          <span className={cn(classes, "rift-btn--disabled")} aria-disabled="true">
            {children}
          </span>
        );
      }
      return (
        <Link href={href} className={classes} {...linkRest}>
          {children}
        </Link>
      );
    }

    const buttonRest = rest as AsButton;
    return (
      <button type="button" ref={ref} className={classes} {...buttonRest}>
        {children}
      </button>
    );
  },
);
