"use client";

import Image from "next/image";
import Link from "next/link";
import { SHARE_MOMENTS } from "@/content/fan-kit";
import { ShareButton, CopyLinkButton } from "@/components/fan-kit/share-button";

type Props = {
  issueTitle: string;
  issueSlug: string;
};

export function ComicEndShare({ issueTitle, issueSlug }: Props) {
  const comicMoment = SHARE_MOMENTS.find((m) => m.id === "moment-comics") ?? SHARE_MOMENTS[0]!;
  const issuePath = `/comics/${issueSlug}`;

  return (
    <section
      className="panel overflow-hidden border-[var(--stroke-amber)]"
      aria-label="Share this issue"
    >
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[180px] bg-[rgba(10,18,32,0.9)] md:min-h-[220px]">
          <Image
            src={comicMoment.imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-5">
          <p className="page-kicker">Shareable moment</p>
          <h2 className="font-display text-xl text-white">Finished {issueTitle}?</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Send a friend the issue link or grab a Fan Kit moment card. Wallpapers and stickers live
            in the Fan Kit.
          </p>
          <div className="flex flex-wrap gap-2">
            <ShareButton
              title={`Riftwilds — ${issueTitle}`}
              text="I just read a Legends of the Rift comic in Riftwilds."
              path={issuePath}
              label="Share issue"
            />
            <CopyLinkButton path={issuePath} />
            <Link href="/fan-kit#share" className="btn-secondary focus-ring text-sm">
              Fan Kit cards
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
