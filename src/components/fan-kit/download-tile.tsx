import Image from "next/image";
import type { FanKitAsset } from "@/content/fan-kit";

type Props = {
  asset: FanKitAsset;
};

export function DownloadTile({ asset }: Props) {
  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-[rgba(10,18,32,0.85)]">
        <Image
          src={asset.thumbSrc}
          alt=""
          fill
          className="object-contain p-3"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">{asset.kind}</p>
        <h3 className="font-display text-base text-white">{asset.title}</h3>
        <p className="text-xs text-[var(--text-muted)]">{asset.description}</p>
        <a
          href={asset.href}
          download={asset.downloadName}
          className="btn-secondary focus-ring mt-auto text-sm"
        >
          Download
        </a>
      </div>
    </article>
  );
}
