/**
 * Browser Fullscreen API helpers with graceful viewport-expand fallback.
 * Does not trap the user — exit always available via API, Esc (browser), or UI.
 */

export type FullscreenCapability = {
  apiAvailable: boolean;
  /** True when document is in native fullscreen. */
  nativeActive: boolean;
};

export type EnterFullscreenResult =
  | { ok: true; mode: "native" }
  | { ok: true; mode: "viewport-expand"; reason: string }
  | { ok: false; reason: string };

export function getFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return (
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

export function isNativeFullscreen(): boolean {
  return getFullscreenElement() != null;
}

export function isFullscreenApiAvailable(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen
  );
}

export async function requestNativeFullscreen(
  element?: HTMLElement | null,
): Promise<EnterFullscreenResult> {
  if (typeof document === "undefined") {
    return { ok: false, reason: "No document" };
  }
  const target =
    element ??
    (document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    });

  const req =
    target.requestFullscreen?.bind(target) ??
    (
      target as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      }
    ).webkitRequestFullscreen?.bind(target) ??
    (
      target as HTMLElement & {
        msRequestFullscreen?: () => Promise<void> | void;
      }
    ).msRequestFullscreen?.bind(target);

  if (!req) {
    return {
      ok: true,
      mode: "viewport-expand",
      reason: "Fullscreen API unavailable — using viewport expand",
    };
  }

  try {
    await Promise.resolve(req());
    return { ok: true, mode: "native" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fullscreen request denied";
    return { ok: true, mode: "viewport-expand", reason: message };
  }
}

export async function exitNativeFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  if (!isNativeFullscreen()) return;
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };
  const exit =
    document.exitFullscreen?.bind(document) ??
    doc.webkitExitFullscreen?.bind(document) ??
    doc.msExitFullscreen?.bind(document);
  if (!exit) return;
  try {
    await Promise.resolve(exit());
  } catch {
    /* already exited */
  }
}

/**
 * Decide whether a keyboard event should toggle fullscreen.
 * F11 is browser-owned in many agents — we still report it so UI can sync.
 */
export function isFullscreenShortcut(e: {
  code: string;
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}): "f" | "alt-enter" | "f11" | null {
  if (e.ctrlKey || e.metaKey) return null;
  if (e.code === "F11" || e.key === "F11") return "f11";
  if (e.altKey && (e.code === "Enter" || e.key === "Enter")) return "alt-enter";
  return null;
}

export function describeFullscreenLabel(active: boolean): string {
  return active ? "Exit fullscreen" : "Enter fullscreen";
}
