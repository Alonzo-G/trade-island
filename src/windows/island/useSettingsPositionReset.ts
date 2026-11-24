import { useEffect, useRef } from "react";
import {
  ISLAND_POSITION_CENTER_STORAGE_KEY,
  ISLAND_POSITION_RESET_STORAGE_KEY,
  isFreshPositionReset,
  requestIslandPositionCenter,
} from "../settings/storage";

/** Runs `reset` when the settings window's Position > Reset button asks for it. */
export function useSettingsPositionReset(reset: () => void) {
  const resetRef = useRef(reset);

  useEffect(() => {
    resetRef.current = reset;
  }, [reset]);

  useEffect(() => {
    const handleRequest = (event: StorageEvent) => {
      if (event.key === ISLAND_POSITION_RESET_STORAGE_KEY && isFreshPositionReset(event.newValue)) {
        resetRef.current();
      }
    };
    window.addEventListener("storage", handleRequest);
    return () => window.removeEventListener("storage", handleRequest);
  }, []);
}

/** Trade edition: centers the island when Settings > Position > Center asks for it. */
export function useSettingsPositionCenter(center: () => void) {
  const centerRef = useRef(center);

  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  useEffect(() => {
    const handleRequest = (event: StorageEvent) => {
      if (event.key === ISLAND_POSITION_CENTER_STORAGE_KEY && event.newValue !== null) {
        centerRef.current();
        // Same freshness trick as the reset: make every request a new value.
        requestIslandPositionCenter();
      }
    };
    window.addEventListener("storage", handleRequest);
    return () => window.removeEventListener("storage", handleRequest);
  }, []);
}
