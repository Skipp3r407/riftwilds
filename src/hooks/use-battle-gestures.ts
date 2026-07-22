"use client";

import { useEffect, useRef } from "react";

const SWIPE_MIN_PX = 56;
const SWIPE_MAX_OFF_AXIS = 72;
const EDGE_ZONE_PX = 28;

export type BattleGestureHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** When false, gestures are ignored (e.g. while dragging a card). */
  enabled?: boolean;
};

/**
 * Edge / board swipe gestures for compact battle:
 * - Left → Event Feed drawer
 * - Right → Match Intel drawer
 * - Up → expand hand
 * - Down → collapse hand / cancel selection
 *
 * Ignores swipes that start on interactive controls (buttons, inputs, cards).
 */
export function useBattleGestures(
  targetRef: React.RefObject<HTMLElement | null>,
  handlers: BattleGestureHandlers,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let edgeH = false;
    let edgeV = false;

    const isBlockedTarget = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return true;
      if (t.closest("button, a, input, textarea, select, [role='button'], [draggable='true']")) {
        return true;
      }
      if (t.closest(".battle-hand-card, .battle-board-card, .battle-mobile-dock, .battle-drawer")) {
        return true;
      }
      return false;
    };

    const onStart = (e: TouchEvent) => {
      if (handlersRef.current.enabled === false) return;
      if (e.touches.length !== 1) return;
      if (isBlockedTarget(e.target)) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;
      edgeH = startX <= EDGE_ZONE_PX || startX >= w - EDGE_ZONE_PX;
      edgeV = startY >= h - EDGE_ZONE_PX * 3 || startY <= EDGE_ZONE_PX * 2;
      tracking = edgeH || edgeV || Boolean(el.contains(e.target as Node));
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      if (handlersRef.current.enabled === false) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < SWIPE_MIN_PX && absY < SWIPE_MIN_PX) return;

      if (absX >= absY && absY <= SWIPE_MAX_OFF_AXIS) {
        if (dx < 0) handlersRef.current.onSwipeLeft?.();
        else handlersRef.current.onSwipeRight?.();
        return;
      }
      if (absY > absX && absX <= SWIPE_MAX_OFF_AXIS) {
        if (dy < 0) handlersRef.current.onSwipeUp?.();
        else handlersRef.current.onSwipeDown?.();
      }
    };

    const onCancel = () => {
      tracking = false;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [targetRef]);
}
