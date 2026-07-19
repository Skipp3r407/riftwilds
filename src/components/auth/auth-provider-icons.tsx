import type { AuthProviderId } from "@/lib/auth/providers";
import { cn } from "@/lib/utils/cn";

/** Simple original mark icons for auth scaffolding (not brand logos). */
export function AuthProviderIcon({
  id,
  className,
}: {
  id: AuthProviderId | string;
  className?: string;
}) {
  const common = cn("h-5 w-5 shrink-0", className);

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
    case "google":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 8.5v7M8.5 12h7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 4.5v1.2M12 18.3V19.5M4.5 12h1.2M18.3 12h1.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case "discord":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none">
          <path
            d="M7.5 17c-.9-.4-1.7-1-2.3-1.7.4 2.1 1.6 3.4 3.2 4.1 1-.4 1.9-.9 2.6-1.5.3.05.7.08 1 .08s.7-.03 1-.08c.7.6 1.6 1.1 2.6 1.5 1.6-.7 2.8-2 3.2-4.1-.6.7-1.4 1.3-2.3 1.7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 9.2C9.4 8.4 10.7 8 12 8s2.6.4 3.8 1.2c.7 1.3 1 2.7.9 4.1-1 .8-2.2 1.3-3.5 1.5h-2.4c-1.3-.2-2.5-.7-3.5-1.5-.1-1.4.2-2.8.9-4.1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="12.2" r="1" fill="currentColor" />
          <circle cx="14" cy="12.2" r="1" fill="currentColor" />
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
