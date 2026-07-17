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
    <footer className="mt-auto border-t border-[var(--stroke)] bg-[rgba(10,10,15,0.92)]">
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
              width={80}
              height={80}
              unoptimized
              className="h-14 w-14 object-contain"
            />
            <Image
              src={brandWordmarkPath}
              alt="Riftwilds"
              width={280}
              height={50}
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
              <Link href="/hatchery" className="hover:text-[var(--cyan)]">
                Claim egg
              </Link>
            </li>
            <li>
              <Link href="/play" className="hover:text-[var(--cyan)]">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/world" className="hover:text-[var(--cyan)]">
                World
              </Link>
            </li>
            <li>
              <Link href="/live-world" className="hover:text-[var(--cyan)]">
                Live World
              </Link>
            </li>
            <li>
              <Link href="/arena" className="hover:text-[var(--cyan)]">
                Arena
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-[var(--cyan)]">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/guilds" className="hover:text-[var(--cyan)]">
                Guilds
              </Link>
            </li>
            <li>
              <Link href="/homestead" className="hover:text-[var(--cyan)]">
                Homestead
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="hover:text-[var(--cyan)]">
                Market
              </Link>
            </li>
            <li>
              <Link href="/memorials" className="hover:text-[var(--cyan)]">
                Memorials
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/about" className="hover:text-[var(--cyan)]">
                About / Story
              </Link>
            </li>
            <li>
              <Link href="/economy" className="hover:text-[var(--cyan)]">
                Economy
              </Link>
            </li>
            <li>
              <Link href="/fairness" className="hover:text-[var(--cyan)]">
                Fairness
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:text-[var(--cyan)]">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/transparency" className="hover:text-[var(--cyan)]">
                Transparency
              </Link>
            </li>
            <li>
              <Link href="/legal/risk" className="hover:text-[var(--cyan)]">
                Risk disclosure
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-[var(--cyan)]">
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
