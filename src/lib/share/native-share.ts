/**
 * Web Share API + clipboard fallback for Attract / Fan Kit moments.
 */

export type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export async function shareOrCopy(payload: SharePayload): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload.url);
      return "copied";
    }
  } catch {
    return "failed";
  }

  return "failed";
}

export function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http")) return path;
  const base = window.location.origin;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
