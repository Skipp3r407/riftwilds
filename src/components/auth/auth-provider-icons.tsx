import Image from "next/image";
import type { AuthProviderId } from "@/lib/auth/providers";
import { authProviderThumbPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

const PAINTED_PROVIDER_IDS = new Set(["google", "discord", "apple"]);

/** Painted Riftwilds provider thumbs (brand-safe marks — not vendor logos). */
export function AuthProviderIcon({
  id,
  className,
}: {
  id: AuthProviderId | string;
  className?: string;
}) {
  const common = cn("h-5 w-5 shrink-0", className);

  if (PAINTED_PROVIDER_IDS.has(id)) {
    return (
      <Image
        src={authProviderThumbPath(id)}
        alt=""
        width={36}
        height={36}
        className={cn("h-9 w-9 shrink-0 rounded-md object-cover", className)}
        unoptimized
        aria-hidden
      />
    );
  }

  switch (id) {
    case "email":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M4 7.5 12 13l8-5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <path
            d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "wallet_siws":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <rect
            x="3.5"
            y="6.5"
            width="17"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16.2" cy="14" r="1.2" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 8v4l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
