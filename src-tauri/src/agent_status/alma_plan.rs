//! Alma plan provider (trade edition): mirrors Alma's workspace task graph
//! (`<workspace>/.alma/plan.json`) as an Agent session on the island.
//!
//! Mapping: the graph has open blocks → "running"; every block done → "completed"; no plan
//! file → no session. Alma itself has no per-session lifecycle hooks (it is a resident app,
//! not a CLI agent), so the plan file's mtime is the "updated at" signal.

use std::path::Path;

use super::sessions::AgentSessionSummary;

const PROVIDER: &str = "alma";
const SESSION_ID: &str = "alma-plan";
/// A plan whose file has not changed for this long no longer counts as "running".
const STALE_MS: i64 = 30 * 60 * 1_000;

#[derive(Deserialize)]
struct PlanFile {
    #[serde(default)]
    title: Option<String>,
    #[serde(default)]
    progress: Option<PlanProgress>,
}

#[derive(Deserialize)]
struct PlanProgress {
    #[serde(default)]
    done: u32,
    #[serde(default)]
    total: u32,
}

/// Reads `<workspace>/.alma/plan.json` and maps it to one session; `None` when there is no
/// plan or the file is unreadable. `workspace` comes from the island's todo save directory
/// setting (the workspace Alma runs in).
pub(super) fn list_alma_session(workspace: Option<&Path>, now: i64) -> Option<AgentSessionSummary> {
    let workspace = workspace?;
    let plan = workspace.join(".alma").join("plan.json");
    let Ok(content) = std::fs::read_to_string(&plan) else { return None };
    let Ok(parsed) = serde_json::from_str::<PlanFile>(&content) else { return None };
    let Ok(meta) = std::fs::metadata(&plan) else { return None };
    let updated_at = meta
        .modified()
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(now);

    let (done, total) = parsed.progress.map(|p| (p.done, p.total)).unwrap_or((0, 0));
    let phase = if total > 0 && done >= total {
        "completed"
    } else if now - updated_at > STALE_MS {
        "stale"
    } else {
        "running"
    };
    let title = parsed.title.unwrap_or_else(|| "Alma 任务图".to_string());
    let last_message = (total > 0).then(|| format!("{done}/{total} 任务完成"));

    Some(AgentSessionSummary {
        cwd: workspace.to_str().map(|s| s.to_string()),
        title: Some(title),
        phase,
        last_message,
        updated_at,
        ..AgentSessionSummary::blank(PROVIDER, SESSION_ID.to_string())
    })
}
