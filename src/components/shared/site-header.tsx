"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
} from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { brandMarkPath, brandWordmarkPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import { headerNavGroups, type NavGroup } from "@/lib/config/nav";
import { SolPriceChip } from "@/components/shared/sol-price-chip";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { markOriginStorySeen } from "@/lib/origin-story";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type Props = {
  variant?: "marketing" | "game";
};

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => linkActive(pathname, item.href));
}

type NavDropdownProps = {
  group: NavGroup;
  pathname: string;
  openId: string | null;
  setOpenId: Dispatch<SetStateAction<string | null>>;
};

function NavDropdown({ group, pathname, openId, setOpenId }: NavDropdownProps) {
  const open = openId === group.id;
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const active = groupActive(pathname, group);

  const close = useCallback(() => setOpenId(null), [setOpenId]);
  const openMenu = useCallback(() => setOpenId(group.id), [group.id, setOpenId]);

  const focusItem = (index: number) => {
    const items = itemRefs.current.filter(Boolean);
    if (!items.length) return;
    const next = ((index % items.length) + items.length) % items.length;
    items[next]?.focus();
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
      requestAnimationFrame(() => focusItem(0));
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      close();
    }
  };

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter(Boolean);
    const current = items.findIndex((el) => el === document.activeElement);

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(current < 0 ? 0 : current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(current < 0 ? items.length - 1 : current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(items.length - 1);
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div ref={rootRef} className="hud-nav__item">
      <button
        type="button"
        className={cn(
          "hud-nav__link hud-nav__trigger focus-ring",
          active && "hud-nav__link--active",
          open && "hud-nav__trigger--open",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        /* CSS :hover/:focus-within opens the panel; click syncs aria + sticky open. */
        onClick={openMenu}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{group.label}</span>
        <ChevronDown
          size={14}
          className={cn("hud-nav__chevron", open && "hud-nav__chevron--open")}
          aria-hidden="true"
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={group.label}
        className={cn("hud-nav__dropdown", open && "hud-nav__dropdown--open")}
        onKeyDown={onMenuKeyDown}
      >
        <div className="hud-nav__dropdown-inner">
          {group.items.map((item, index) => {
            const itemActive = linkActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={cn(
                  "hud-nav__dropdown-link focus-ring",
                  itemActive && "hud-nav__dropdown-link--active",
                )}
                onClick={() => {
                  playSfx("ui.nav");
                  close();
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ variant = "marketing" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const mobileToggleRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const homeActive = linkActive(pathname, "/");

  useEffect(() => {
    if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenId(null);
      if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!openId) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const root = document.querySelector(`[data-nav-root="desktop"]`);
      if (root && !root.contains(target)) setOpenId(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openId]);

  const closeMobile = () => {
    if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
  };

  return (
    <header className="shell-topbar hud-nav sticky top-0 z-50">
      {/* Checkbox toggle keeps the mobile drawer working without React state. */}
      <input
        ref={mobileToggleRef}
        id="hud-nav-mobile-toggle"
        type="checkbox"
        className="hud-nav__mobile-toggle"
        aria-controls="mobile-nav"
      />

      <div className="hud-nav__bar">
        <div className="hud-nav__accent" aria-hidden="true" />
        <div className="hud-nav__rail" aria-hidden="true" />

        <div className="hud-nav__row mx-auto flex max-w-7xl items-center px-4 py-2.5 md:px-6 md:py-3">
          <Link
            href="/"
            onClick={() => {
              playSfx("ui.nav");
              markOriginStorySeen();
            }}
            className="hud-nav__brand focus-ring relative z-[2] flex shrink-0 items-center gap-2 md:gap-2.5"
            aria-label={projectConfig.PROJECT_NAME}
          >
            <Image
              src={brandMarkPath}
              alt=""
              width={160}
              height={160}
              priority
              unoptimized
              className="h-14 w-14 shrink-0 object-contain object-left md:h-16 md:w-16 lg:h-[4.5rem] lg:w-[4.5rem]"
            />
            <Image
              src={brandWordmarkPath}
              alt="Riftwilds"
              width={392}
              height={70}
              priority
              unoptimized
              className="h-7 w-auto shrink-0 object-contain object-left sm:h-8 md:h-9"
            />
          </Link>

          <nav
            data-nav-root="desktop"
            className="hud-nav__links relative z-[3] min-w-0 flex-1 items-center justify-end"
            aria-label="Primary"
          >
            <Link
              href="/"
              onClick={() => {
                playSfx("ui.nav");
                markOriginStorySeen();
              }}
              className={cn("hud-nav__link focus-ring", homeActive && "hud-nav__link--active")}
            >
              Home
            </Link>
            {headerNavGroups.map((group) => (
              <NavDropdown
                key={group.id}
                group={group}
                pathname={pathname}
                openId={openId}
                setOpenId={setOpenId}
              />
            ))}
          </nav>

          <div className="hud-nav__actions relative z-[5] flex shrink-0 items-center justify-end">
            {variant === "game" ? (
              <span className="status-chip status-chip--info hud-nav__network-chip">Solana</span>
            ) : null}
            <SolPriceChip className="hud-nav__sol" />
            <WalletConnectButton />
            <label
              htmlFor="hud-nav-mobile-toggle"
              className="hud-nav__menu-btn focus-ring"
            >
              <Menu size={22} className="hud-nav__menu-icon hud-nav__menu-icon--open" aria-hidden="true" />
              <X size={22} className="hud-nav__menu-icon hud-nav__menu-icon--close" aria-hidden="true" />
              <span className="sr-only">Toggle menu</span>
            </label>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className="hud-nav__drawer relative z-[1] border-t border-[var(--stroke)] lg:hidden"
      >
        <nav className="flex flex-col gap-4 px-4 py-4" aria-label="Mobile">
          <Link
            href="/"
            className={cn(
              "hud-nav__drawer-link focus-ring",
              homeActive && "hud-nav__drawer-link--active",
            )}
            onClick={() => {
              markOriginStorySeen();
              closeMobile();
            }}
          >
            Home
          </Link>

          {headerNavGroups.map((group) => {
            const sectionActive = groupActive(pathname, group);
            return (
              <div key={group.id} className="hud-nav__drawer-section">
                <p
                  className={cn(
                    "hud-nav__drawer-label",
                    sectionActive && "hud-nav__drawer-label--active",
                  )}
                >
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = linkActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "hud-nav__drawer-link focus-ring",
                          active && "hud-nav__drawer-link--active",
                        )}
                        onClick={() => {
                          playSfx("ui.nav");
                          closeMobile();
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
