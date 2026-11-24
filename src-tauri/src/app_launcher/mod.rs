//! App launcher (快捷应用, trade edition): app shortcuts (.lnk / .exe paths) the user drops on
//! the launcher page, kept as references on disk (`app-launcher.json`) and started with a click.
//! Same shape as the file shelf, far simpler: no sizes, no cleanup rules; the order is the
//! user's, by drag.

use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::PathBuf,
    sync::{Mutex, OnceLock, PoisonError},
};
use tauri::{AppHandle, Manager};

pub(crate) mod commands;
mod icon;

const LAUNCHER_FILE_NAME: &str = "app-launcher.json";
/// How many shortcuts the launcher keeps; reorderable, not growable past this.
pub(super) const MAX_SHORTCUTS: usize = 24;

/// One shortcut. Mirrored by `LauncherItem` in src/features/app-launcher/api.ts.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LauncherItem {
    id: String,
    path: String,
    name: String,
    #[serde(default)]
    added_at: i64,
    /// The target was moved, renamed or uninstalled since it was added.
    #[serde(default)]
    missing: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LauncherSnapshot {
    items: Vec<LauncherItem>,
}

static LAUNCHER: OnceLock<Mutex<LauncherState>> = OnceLock::new();

pub(super) struct LauncherState {
    file: PathBuf,
    items: Vec<LauncherItem>,
}

fn service() -> Result<&'static Mutex<LauncherState>, String> {
    LAUNCHER.get().ok_or_else(|| "The app launcher is not running.".to_string())
}

pub(super) fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub(super) fn item_name(path: &str) -> String {
    std::path::Path::new(path)
        .file_stem()
        .map(|stem| stem.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string())
}

fn load(file: &PathBuf) -> Vec<LauncherItem> {
    let Ok(content) = fs::read_to_string(file) else { return Vec::new() };
    #[derive(Deserialize)]
    struct Stored {
        #[serde(default)]
        items: Vec<LauncherItem>,
    }
    serde_json::from_str::<Stored>(&content).map(|stored| stored.items).unwrap_or_default()
}

pub(super) fn save(file: &PathBuf, items: &[LauncherItem]) -> Result<(), String> {
    #[derive(Serialize)]
    struct StoredRef<'a> {
        items: &'a [LauncherItem],
    }
    let content = serde_json::to_string(&StoredRef { items })
        .map_err(|error| format!("Failed to serialize the shortcuts: {error}"))?;
    fs::write(file, content).map_err(|error| format!("Failed to save the shortcuts: {error}"))
}

pub fn init(app: &AppHandle) -> Result<(), String> {
    if LAUNCHER.get().is_some() {
        return Ok(());
    }
    let file = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve app data directory: {error}"))?
        .join(LAUNCHER_FILE_NAME);
    let items = load(&file);
    let _ = LAUNCHER.set(Mutex::new(LauncherState { file, items }));
    Ok(())
}

pub(super) fn with_state<T>(change: impl FnOnce(&mut LauncherState) -> Result<T, String>) -> Result<T, String> {
    let mutex = service()?;
    let mut state = mutex.lock().unwrap_or_else(PoisonError::into_inner);
    change(&mut state)
}

/// Applies `change` to the items and saves the list; returns the fresh snapshot.
pub(super) fn update(state: &mut LauncherState, change: impl FnOnce(&mut Vec<LauncherItem>)) -> Result<LauncherSnapshot, String> {
    change(&mut state.items);
    save(&state.file, &state.items)?;
    Ok(LauncherSnapshot { items: state.items.clone() })
}


macro_rules! tauri_commands {
    ($next:ident [$($done:tt)*] $($rest:tt)*) => {
        $next!([$($done)*
            crate::app_launcher::commands::get_app_launcher,
            crate::app_launcher::commands::add_app_launcher_paths,
            crate::app_launcher::commands::remove_app_launcher_items,
            crate::app_launcher::commands::reorder_app_launcher,
            crate::app_launcher::commands::start_app_launcher_item,
            crate::app_launcher::commands::get_app_launcher_icon,
        ] $($rest)*)
    };
}

pub(crate) use tauri_commands;
