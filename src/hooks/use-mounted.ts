"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True after hydration; false during SSR / first server render. */
export function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
