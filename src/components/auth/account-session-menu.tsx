"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { ImageButton } from "@/components/ui/image-button";
import {
  accountMenuLabel,
  useAccountSession,
} from "@/hooks/use-account-session";
import { playSfx } from "@/hooks/use-sfx";
import { logoutAccountSession } from "@/lib/auth/logout-client";
import { cn } from "@/lib/utils/cn";

type Variant = "header" | "sidebar" | "drawer" | "inline";

type Props = {
  variant?: Variant;
  className?: string;
  /** Called after a successful logout redirect is about to happen (e.g. close mobile drawer). */
  onAfterAction?: () => void;
};

async function runLogout(
  setBusy: (v: boolean) => void,
  router: ReturnType<typeof useRouter>,
  onAfterAction?: () => void,
) {
  setBusy(true);
  playSfx("ui.click");
  const result = await logoutAccountSession();
  if (!result.ok) {
    setBusy(false);
    return;
  }
  onAfterAction?.();
  router.push("/login");
  router.refresh();
}

/**
 * Sign in / Logout controls for Riftwilds HUD.
 * Hidden while session is loading; guests see Sign in; keepers see Logout.
 */
export function AccountSessionMenu({
  variant = "header",
  className,
  onAfterAction,
}: Props) {
  const router = useRouter();
  const { loading, authenticated, session } = useAccountSession();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const onLogout = useCallback(() => {
    void runLogout(setBusy, router, onAfterAction);
  }, [router, onAfterAction]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return null;
  }

  if (!authenticated) {
    if (variant === "sidebar") {
      return (
        <Link
          href="/login"
          onClick={() => {
            playSfx("ui.nav");
            onAfterAction?.();
          }}
          className={cn("nav-link focus-ring", className)}
        >
          Sign in
        </Link>
      );
    }
    if (variant === "drawer") {
      return (
        <Link
          href="/login"
          className={cn("hud-nav__drawer-link focus-ring", className)}
          onClick={() => {
            playSfx("ui.nav");
            onAfterAction?.();
          }}
        >
          Sign in
        </Link>
      );
    }
    return (
      <ImageButton
        href="/login"
        variant="secondary"
        size="sm"
        className={cn("px-3 py-2 text-xs md:text-sm", className)}
        onClick={() => {
          playSfx("ui.nav");
          onAfterAction?.();
        }}
      >
        Sign in
      </ImageButton>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={onLogout}
        className={cn(
          "nav-link focus-ring w-full text-left text-[var(--amber)]",
          className,
        )}
        data-testid="account-logout"
      >
        {busy ? "Logging out…" : "Logout"}
      </button>
    );
  }

  if (variant === "drawer") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={onLogout}
        className={cn(
          "hud-nav__drawer-link focus-ring w-full text-left text-[var(--amber)]",
          className,
        )}
        data-testid="account-logout"
      >
        {busy ? "Logging out…" : "Logout"}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <ImageButton
        variant="danger"
        size="sm"
        className={cn("px-3 py-2 text-xs md:text-sm", className)}
        disabled={busy}
        onClick={onLogout}
        data-testid="account-logout"
      >
        <span className="inline-flex items-center gap-1.5">
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          {busy ? "Logging out…" : "Logout"}
        </span>
      </ImageButton>
    );
  }

  // Header account menu
  const label = accountMenuLabel(session);
  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("hud-nav__item hud-nav__item--account relative", className)}
    >
      <button
        type="button"
        className={cn(
          "hud-nav__link hud-nav__trigger focus-ring",
          open && "hud-nav__trigger--open",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => {
          playSfx("ui.click");
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
        data-testid="account-menu-trigger"
      >
        <UserRound className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="max-w-[7.5rem] truncate">{label}</span>
        <ChevronDown
          size={14}
          className={cn("hud-nav__chevron", open && "hud-nav__chevron--open")}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Account"
        className={cn(
          "hud-nav__dropdown hud-nav__dropdown--account",
          open && "hud-nav__dropdown--open",
        )}
      >
        <div className="hud-nav__dropdown-inner">
          <Link
            href="/profile"
            role="menuitem"
            className="hud-nav__dropdown-link focus-ring"
            onClick={() => {
              playSfx("ui.nav");
              setOpen(false);
              onAfterAction?.();
            }}
          >
            <span className="hud-nav__dropdown-item">
              <span className="hud-nav__dropdown-item-label">Profile</span>
            </span>
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            className="hud-nav__dropdown-link focus-ring w-full text-left text-[var(--amber)]"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            data-testid="account-logout"
          >
            <span className="hud-nav__dropdown-item">
              <span className="hud-nav__dropdown-item-label inline-flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                {busy ? "Logging out…" : "Logout"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
