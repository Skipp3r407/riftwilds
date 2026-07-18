"use client";

import Image from "next/image";
import Link from "next/link";
import { brandMarkPath, brandWordmarkPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import { markOriginStorySeen } from "@/lib/origin-story";
import { useState } from "react";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);

  return (
    <footer className="site-footer-hud mt-auto border-t border-[var(--stroke)] bg-[rgba(10,10,15,0.92)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Link
            href="/"
            onClick={markOriginStorySeen}
            className="focus-ring inline-flex items-center gap-2"
            aria-label={projectConfig.PROJECT_NAME}
          >
            <Image
              src={brandMarkPath}
              alt=""
              width={512}
              height={512}
              unoptimized
              className="h-14 w-14 object-contain"
            />
            <Image
              src={brandWordmarkPath}
              alt="Riftwilds"
              width={497}
              height={140}
              unoptimized
              className="h-6 w-auto object-contain"
            />
          </Link>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
            Hatch a {projectConfig.CREATURE_NAME} in {projectConfig.UNIVERSE_NAME}. Care for it, duel
            in Arena, equip original gear, and follow public revenue allocation. Not financial advice
            — crypto values move.
          </p>
          {projectConfig.TOKEN_MINT_ADDRESS !== "COMING_SOON" ? (
            <button
              type="button"
              className="focus-ring panel-inset mt-4 px-3 py-2 text-left text-xs text-[var(--text-muted)]"
              onClick={async () => {
                await navigator.clipboard.writeText(projectConfig.TOKEN_MINT_ADDRESS);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              Mint: {projectConfig.TOKEN_MINT_ADDRESS}
              <span className="ml-2 text-[var(--cyan)]">{copied ? "Copied" : "Copy"}</span>
            </button>
          ) : (
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Token mint publishes when the launch checklist is complete.
            </p>
          )}
        </div>

        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white">Play</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/hatchery" className="footer-link">
                Claim egg
              </Link>
            </li>
            <li>
              <Link href="/play" className="footer-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/world" className="footer-link">
                World
              </Link>
            </li>
            <li>
              <Link href="/live-world" className="footer-link">
                Live World
              </Link>
            </li>
            <li>
              <Link href="/arena" className="footer-link">
                Arena
              </Link>
            </li>
            <li>
              <Link href="/shop" className="footer-link">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/guilds" className="footer-link">
                Guilds
              </Link>
            </li>
            <li>
              <Link href="/homestead" className="footer-link">
                Homestead
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="footer-link">
                Market
              </Link>
            </li>
            <li>
              <Link href="/memorials" className="footer-link">
                Memorials
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/about" className="footer-link">
                About / Story
              </Link>
            </li>
            <li>
              <Link href="/comics" className="footer-link">
                Comics
              </Link>
            </li>
            <li>
              <Link href="/fan-kit" className="footer-link">
                Fan Kit
              </Link>
            </li>
            <li>
              <Link href="/coloring" className="footer-link">
                Coloring
              </Link>
            </li>
            <li>
              <Link href="/press" className="footer-link">
                Press / Streamers
              </Link>
            </li>
            <li>
              <Link href="/creators" className="footer-link">
                Creator Hub
              </Link>
            </li>
            <li>
              <Link href="/economy" className="footer-link">
                Economy
              </Link>
            </li>
            <li>
              <Link href="/fairness" className="footer-link">
                Fairness
              </Link>
            </li>
            <li>
              <Link href="/academy" className="footer-link">
                Academy / Help
              </Link>
            </li>
            <li>
              <Link href="/docs" className="footer-link">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/transparency" className="footer-link">
                Transparency
              </Link>
            </li>
            <li>
              <Link href="/legal/risk" className="footer-link">
                Risk disclosure
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="footer-link">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--stroke)] px-4 py-4 text-center text-xs text-[var(--text-dim)] md:px-6">
        © {new Date().getFullYear()} {projectConfig.PROJECT_NAME}. Digital entertainment — not a
        promise of profit or guaranteed rewards.
      </div>
    </footer>
  );
}
