//! The launcher's Tauri commands. The list lives in the parent module's `tauri_commands!`
//! (子模块的命令也列在顶层模块里, per the repository rules).

use tauri::Emitter;

use super::{with_state, LauncherItem, LauncherSnapshot, MAX_SHORTCUTS};

const CHANGED_EVENT: &str = "app-launcher-changed";

fn notify(window: &tauri::WebviewWindow) {
    let _ = window.emit(CHANGED_EVENT, ());
}

/// Whether `path` looks like a launchable app reference (.lnk / .exe / .url).
fn is_launchable(path: &str) -> bool {
    let lower = path.to_lowercase();
    lower.ends_with(".lnk") || lower.ends_with(".exe") || lower.ends_with(".url")
}

fn next_id(items: &[LauncherItem]) -> String {
    let mut n = items.len() + 1;
    while items.iter().any(|item| item.id == format!("app-{n}")) {
        n += 1;
    }
    format!("app-{n}")
}

fn refresh_missing(items: &mut [LauncherItem]) -> bool {
    let mut changed = false;
    for item in items {
        let missing = !std::path::Path::new(&item.path).exists();
        if item.missing != missing {
            item.missing = missing;
            changed = true;
        }
    }
    changed
}

#[tauri::command]
pub async fn get_app_launcher() -> Result<LauncherSnapshot, String> {
    with_state(|state| {
        let changed = refresh_missing(&mut state.items);
        if changed {
            super::save(&state.file, &state.items)?;
        }
        Ok(LauncherSnapshot { items: state.items.clone() })
    })
}

/// Adds dropped paths as shortcuts. Duplicates (same path) are skipped; paths that are not
/// app references are rejected with a readable error, because the launcher page is for apps.
#[tauri::command]
pub async fn add_app_launcher_paths(
    window: tauri::WebviewWindow,
    paths: Vec<String>,
) -> Result<LauncherSnapshot, String> {
    let mut rejected = 0usize;
    let snapshot = with_state(|state| {
        let result = super::update(state, |items| {
            for path in &paths {
                if !is_launchable(path) {
                    rejected += 1;
                    continue;
                }
                if items.iter().any(|item| item.path.eq_ignore_ascii_case(path)) || items.len() >= MAX_SHORTCUTS {
                    continue;
                }
                items.push(LauncherItem {
                    id: next_id(items),
                    path: path.clone(),
                    name: super::item_name(path),
                    added_at: super::now_ms(),
                    missing: false,
                });
            }
        });
        result
    })?;
    notify(&window);
    let added = snapshot.items.len();
    if added == 0 && rejected > 0 {
        return Err("只能添加应用快捷方式（.lnk / .exe / .url）。".to_string());
    }
    Ok(snapshot)
}

#[tauri::command]
pub async fn remove_app_launcher_items(
    window: tauri::WebviewWindow,
    ids: Vec<String>,
) -> Result<LauncherSnapshot, String> {
    let snapshot = with_state(|state| {
        super::update(state, |items| {
            items.retain(|item| !ids.contains(&item.id));
        })
    })?;
    notify(&window);
    Ok(snapshot)
}

/// Moves `id` to where `target` sits; the rest keeps its order.
#[tauri::command]
pub async fn reorder_app_launcher(
    window: tauri::WebviewWindow,
    id: String,
    target: String,
) -> Result<LauncherSnapshot, String> {
    let snapshot = with_state(|state| {
        super::update(state, |items| {
            let Some(from) = items.iter().position(|item| item.id == id) else { return };
            let Some(to) = items.iter().position(|item| item.id == target) else { return };
            let item = items.remove(from);
            items.insert(to, item);
        })
    })?;
    notify(&window);
    Ok(snapshot)
}

/// Starts the shortcut's target through the shell, so .lnk resolves to its app and .exe runs.
#[tauri::command]
pub async fn start_app_launcher_item(id: String) -> Result<(), String> {
    let path = with_state(|state| {
        let path = state.items.iter().find(|item| item.id == id)
            .map(|item| item.path.clone())
            .ok_or_else(|| "The shortcut was removed.".to_string())?;
        Ok((path, LauncherSnapshot { items: state.items.clone() }))
    })?.0;
    if !std::path::Path::new(&path).exists() {
        return Err(format!("找不到 {path}，它可能已被移动或卸载。"));
    }
    tauri_plugin_opener::open_path(&path, None::<&str>)
        .map_err(|error| format!("无法启动 {path}：{error}"))
}

/// The shortcut's icon as a PNG data URL, extracted from the .lnk / .exe; null falls back to
/// the front end's generic app icon.
#[tauri::command]
pub async fn get_app_launcher_icon(id: String) -> Result<Option<String>, String> {
    let path = with_state(|state| {
        let path = state.items.iter().find(|item| item.id == id)
            .map(|item| item.path.clone())
            .ok_or_else(|| "The shortcut was removed.".to_string())?;
        Ok((path, LauncherSnapshot { items: state.items.clone() }))
    })?.0;
    Ok(super::icon::extract_icon_data_url(&path))
}
