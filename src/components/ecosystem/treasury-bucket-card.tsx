import Image from "next/image";
import type { TreasuryBucket } from "@/lib/ecosystem/treasury";
import { TREASURY_BUCKET_ART } from "@/lib/ecosystem/treasury-art";

type TreasuryBucketCardProps = {
  bucket: TreasuryBucket;
  priority?: boolean;
};

/** Illustrated treasury bucket with navy scrims so N/A labels stay readable. */
export function TreasuryBucketCard({ bucket, priority = false }: TreasuryBucketCardProps) {
  const art = TREASURY_BUCKET_ART[bucket.key];

  return (
    <article className="panel relative min-h-[11.5rem] overflow-hidden p-0 sm:min-h-[12.5rem]">
      {art ? (
        <Image
          src={art.imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
          aria-hidden
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.96)] via-[rgba(6,12,24,0.78)] to-[rgba(6,12,24,0.42)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.55)] via-transparent to-[rgba(6,12,24,0.2)]"
        aria-hidden
      />
      {art ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90"
          style={{
            background: `linear-gradient(90deg, transparent, ${art.accent}, transparent)`,
          }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-start gap-3">
          {art ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.25)] bg-[rgba(6,12,24,0.55)] shadow-[0_0_18px_rgba(61,231,255,0.12)] sm:h-14 sm:w-14">
              <Image
                src={art.iconSrc}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                aria-hidden
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg text-white drop-shadow-sm">{bucket.label}</h2>
            <p className="mt-1 text-xs text-[rgba(220,230,245,0.88)] drop-shadow-sm">
              {bucket.description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <p className="font-display text-2xl text-white drop-shadow-sm">{bucket.balanceLabel}</p>
          <p className="mt-1 text-[10px] text-[rgba(180,198,220,0.85)]">
            {bucket.asset}
            {bucket.isDemo ? " · demo / awaiting ledger" : ""}
            {bucket.verified ? " · verified" : ""}
          </p>
        </div>
      </div>
    </article>
  );
}
