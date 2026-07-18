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
import { TokenPriceChip } from "@/components/shared/token-price-chip";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { markOriginStorySeen } from "@/lib/origin-story";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";
import {
  bumpSiteNavActivity,
  createSiteNavAutohideState,
  isLiveWorldPath,
  setSiteNavHovering,
  setSiteNavPinned,
  siteNavChromeVisible,
  tickSiteNavAutohide,
  type SiteNavAutohideState,
} from "@/game/live-world/systems/immersive/site-nav-autohide";

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
    <div
      ref={rootRef}
      className="hud-nav__item"
      onMouseEnter={openMenu}
    >
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
        /* Hover opens via CSS + mouseEnter; click toggles sticky open for touch/keyboard. */
        onClick={() => setOpenId(open ? null : group.id)}
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

export function SiteHeader(_props: Props = {}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navState, setNavState] = useState<SiteNavAutohideState>(() =>
    createSiteNavAutohideState(),
  );
  const mobileToggleRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const homeActive = linkActive(pathname, "/");
  const liveWorldRoute = isLiveWorldPath(pathname);
  const navVisible = siteNavChromeVisible(navState, liveWorldRoute);

  useEffect(() => {
    if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
    setMobileOpen(false);
    setOpenId(null);
    setNavState(createSiteNavAutohideState());
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenId(null);
      if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
      setMobileOpen(false);
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

  // Keep nav pinned while a desktop dropdown or mobile drawer is open.
  useEffect(() => {
    const pinned = !!openId || mobileOpen;
    setNavState((prev) => setSiteNavPinned(prev, pinned));
  }, [openId, mobileOpen]);

  // Idle auto-hide on Live World routes.
  useEffect(() => {
    if (!liveWorldRoute) return;
    const id = window.setInterval(() => {
      setNavState((prev) => tickSiteNavAutohide(prev, true));
    }, 200);
    return () => window.clearInterval(id);
  }, [liveWorldRoute]);

  // Body flag so layout can reclaim top space under the overlay nav.
  useEffect(() => {
    document.documentElement.dataset.liveWorldNav = liveWorldRoute ? "1" : "0";
    document.documentElement.dataset.liveWorldNavHidden =
      liveWorldRoute && !navVisible ? "1" : "0";
    return () => {
      delete document.documentElement.dataset.liveWorldNav;
      delete document.documentElement.dataset.liveWorldNavHidden;
    };
  }, [liveWorldRoute, navVisible]);

  const closeMobile = () => {
    if (mobileToggleRef.current) mobileToggleRef.current.checked = false;
    setMobileOpen(false);
  };

  const onNavPointerEnter = () => {
    if (!liveWorldRoute) return;
    setNavState((prev) => setSiteNavHovering(prev, true));
  };

  const onNavPointerLeave = () => {
    if (!liveWorldRoute) return;
    setNavState((prev) => setSiteNavHovering(prev, false));
  };

  return (
    <>
      {liveWorldRoute && !navVisible ? (
        <button
          type="button"
          className="hud-nav__hotzone"
          aria-label="Show site navigation"
          title="Show navigation"
          data-testid="site-nav-hotzone"
          onPointerEnter={() => setNavState((prev) => bumpSiteNavActivity(prev))}
          onFocus={() => setNavState((prev) => bumpSiteNavActivity(prev))}
          onClick={() => setNavState((prev) => bumpSiteNavActivity(prev))}
        />
      ) : null}
      <header
        className={cn(
          "shell-topbar hud-nav z-50",
          liveWorldRoute ? "hud-nav--live-world fixed inset-x-0 top-0" : "sticky top-0",
          liveWorldRoute && !navVisible && "hud-nav--autohide-hidden",
        )}
        data-testid="site-header"
        data-live-world-nav={liveWorldRoute ? "1" : "0"}
        data-nav-visible={navVisible ? "1" : "0"}
        onPointerEnter={onNavPointerEnter}
        onPointerLeave={onNavPointerLeave}
        onFocusCapture={() => {
          if (liveWorldRoute) setNavState((prev) => bumpSiteNavActivity(prev));
        }}
      >
      {/* Checkbox toggle keeps the mobile drawer working without React state. */}
      <input
        ref={mobileToggleRef}
        id="hud-nav-mobile-toggle"
        type="checkbox"
        className="hud-nav__mobile-toggle"
        aria-controls="mobile-nav"
        onChange={(e) => setMobileOpen(e.target.checked)}
      />

      <div className="hud-nav__bar">
        <div className="hud-nav__accent" aria-hidden="true" />
        <div className="hud-nav__rail" aria-hidden="true" />

        <div className="hud-nav__row mx-auto flex w-full max-w-[100rem] items-center px-4 py-2.5 md:px-6 md:py-3">
          <Link
            href="/"
            onClick={() => {
              playSfx("ui.nav");
              markOriginStorySeen();
            }}
            className="hud-nav__brand focus-ring flex shrink-0 items-center gap-1.5 md:gap-2"
            aria-label={projectConfig.PROJECT_NAME}
          >
            <Image
              src={brandMarkPath}
              alt=""
              width={512}
              height={512}
              priority
              unoptimized
              className="hud-nav__brand-mark h-12 w-12 shrink-0 object-contain object-left md:h-14 md:w-14 xl:h-16 xl:w-16"
            />
            <Image
              src={brandWordmarkPath}
              alt="Riftwilds"
              width={491}
              height={140}
              priority
              unoptimized
              className="hud-nav__brand-wordmark h-6 w-auto shrink-0 object-contain object-left sm:h-7 md:h-7 xl:h-7"
            />
          </Link>

          <nav
            data-nav-root="desktop"
            className="hud-nav__links min-w-0 flex-1 items-center"
            aria-label="Primary"
            onMouseLeave={() => setOpenId(null)}
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
            {/* HELP stays in the primary link cluster — after Community, before tickers/wallet */}
            <Link
              href="/academy"
              onClick={() => playSfx("ui.nav")}
              className={cn(
                "hud-nav__link hud-nav__help focus-ring",
                linkActive(pathname, "/academy") && "hud-nav__link--active",
              )}
            >
              Help
            </Link>
            <Link
              href="/feedback"
              onClick={() => playSfx("ui.nav")}
              className={cn(
                "hud-nav__link focus-ring",
                linkActive(pathname, "/feedback") && "hud-nav__link--active",
              )}
            >
              Feedback
            </Link>
          </nav>

          <div className="hud-nav__actions flex shrink-0 items-center justify-end">
            <div className="hud-nav__tickers" aria-label="Market tickers">
              <SolPriceChip className="hud-nav__sol" />
              <TokenPriceChip className="hud-nav__token" />
            </div>
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
              playSfx("ui.nav");
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

          <div className="hud-nav__drawer-section">
            <p className="hud-nav__drawer-label">Help</p>
            <Link
              href="/academy"
              className={cn(
                "hud-nav__drawer-link focus-ring",
                linkActive(pathname, "/academy") && "hud-nav__drawer-link--active",
              )}
              onClick={() => {
                playSfx("ui.nav");
                closeMobile();
              }}
            >
              Academy / Help
            </Link>
            <Link
              href="/feedback"
              className={cn(
                "hud-nav__drawer-link focus-ring",
                linkActive(pathname, "/feedback") && "hud-nav__drawer-link--active",
              )}
              onClick={() => {
                playSfx("ui.nav");
                closeMobile();
              }}
            >
              Feedback / Bug Report
            </Link>
          </div>
        </nav>
      </div>
    </header>
    </>
  );
}
