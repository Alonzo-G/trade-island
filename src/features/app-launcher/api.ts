import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// 与 src-tauri/src/app_launcher/mod.rs 的 LauncherItem 对应。
export type LauncherItem = {
  id: string;
  path: string;
  name: string;
  addedAt: number;
  /** The target was moved, renamed or uninstalled since it was added. */
  missing: boolean;
};

// 与 src-tauri/src/app_launcher/mod.rs 的 LauncherSnapshot 对应。
export type LauncherSnapshot = {
  items: LauncherItem[];
};

export function getAppLauncher() {
  return invoke<LauncherSnapshot>("get_app_launcher");
}

export function addAppLauncherPaths(paths: string[]) {
  return invoke<LauncherSnapshot>("add_app_launcher_paths", { paths });
}

export function removeAppLauncherItems(ids: string[]) {
  return invoke<LauncherSnapshot>("remove_app_launcher_items", { ids });
}

export function reorderAppLauncher(id: string, target: string) {
  return invoke<LauncherSnapshot>("reorder_app_launcher", { id, target });
}

export function startAppLauncherItem(id: string) {
  return invoke<void>("start_app_launcher_item", { id });
}

/** The shortcut's extracted icon as a PNG data URL, or null for the generic icon. */
export function getAppLauncherIcon(id: string) {
  return invoke<string | null>("get_app_launcher_icon", { id });
}

// 与 src-tauri/src/app_launcher/commands.rs 的 CHANGED_EVENT 对应。
const APP_LAUNCHER_CHANGED_EVENT = "app-launcher-changed";

/** Calls `onChange` when any window changed the shortcut list. 调用方负责在卸载时取消。 */
export function listenAppLauncherChanged(onChange: () => void): Promise<UnlistenFn> {
  return listen(APP_LAUNCHER_CHANGED_EVENT, () => onChange());
}
