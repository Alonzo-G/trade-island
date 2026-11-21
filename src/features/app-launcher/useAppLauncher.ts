import { useCallback, useEffect, useState } from "react";
import {
  addAppLauncherPaths,
  getAppLauncher,
  listenAppLauncherChanged,
  removeAppLauncherItems,
  reorderAppLauncher,
  startAppLauncherItem,
  type LauncherSnapshot,
} from "./api";

/** The shortcut list, plus the actions the launcher page offers. */
export function useAppLauncher(isOpen: boolean) {
  const [snapshot, setSnapshot] = useState<LauncherSnapshot>({ items: [] });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await getAppLauncher();
      // A null answer (no native service, or a regression mock without this command) means
      // no shortcuts; never propagate it as a crash.
      setSnapshot(result && Array.isArray(result.items) ? result : { items: [] });
    } catch (failure) {
      setError(String(failure));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void refresh();
    let didCancel = false;
    let unlisten: (() => void) | null = null;
    void listenAppLauncherChanged(() => {
      void refresh();
    }).then((next) => {
      if (didCancel) next();
      else unlisten = next;
    });
    return () => {
      didCancel = true;
      unlisten?.();
    };
  }, [isOpen, refresh]);

  const guard = useCallback(async (action: () => Promise<LauncherSnapshot | void>) => {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (result && "items" in result) setSnapshot(result);
    } catch (failure) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }, []);

  const addPaths = useCallback(
    (paths: string[]) => guard(() => addAppLauncherPaths(paths)),
    [guard],
  );

  const remove = useCallback(
    (ids: string[]) => guard(() => removeAppLauncherItems(ids)),
    [guard],
  );

  const reorder = useCallback(
    (id: string, target: string) => guard(() => reorderAppLauncher(id, target)),
    [guard],
  );

  const start = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await startAppLauncherItem(id);
      } catch (failure) {
        setError(String(failure));
      }
    },
    [],
  );

  return { items: snapshot.items, error, busy, refresh, addPaths, remove, reorder, start };
}
