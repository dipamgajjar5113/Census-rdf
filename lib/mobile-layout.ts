"use client";

import { useSyncExternalStore } from "react";

// Keep in sync with mobile.css, including phones rotated into landscape.
export const MOBILE_LAYOUT_QUERY =
  "(max-width: 680px), (max-width: 1000px) and (max-height: 500px) and (pointer: coarse)";

export function isMobileLayout() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(MOBILE_LAYOUT_QUERY).matches
  );
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(MOBILE_LAYOUT_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const serverSnapshot = () => false;

export function useMobileLayout() {
  return useSyncExternalStore(subscribe, isMobileLayout, serverSnapshot);
}
