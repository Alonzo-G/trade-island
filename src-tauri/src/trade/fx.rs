//! Trade tools (外贸工具坞): currency rates for the fx ring and world-clock helpers.
//!
//! Rates come from open.er-api.com's free endpoint (no key, updated daily). The response is
//! cached in memory; the frontend asks again after the cache's day rolls over. Commands follow
//! the repository rules: thin, async for network work, `Result<T, String>` with readable errors.

use std::sync::OnceLock;
use std::time::{Duration, Instant};

use serde::Serialize;

static CACHE: OnceLock<FxCache> = OnceLock::new();

/// The endpoint's own refresh cadence is one day; refetching sooner is wasted requests.
const RATE_TTL: Duration = Duration::from_secs(6 * 3600);
const ENDPOINT: &str = "https://open.er-api.com/v6/latest/USD";

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FxRates {
    /// Unix ms when the rates were fetched (0 for the snapshot's epoch on failure).
    fetched_at: i64,
    /// Next fetch is meaningful after this (Unix ms).
    next_update_at: i64,
    base: String,
    /// Currency code → units per 1 USD ("CNY" → 6.69). Only the codes the frontend asks for.
    rates: Vec<(String, f64)>,
}

struct FxCache {
    rates: FxRates,
    at: Instant,
}

#[tauri::command]
pub async fn get_fx_rates(currencies: Option<Vec<String>>) -> Result<FxRates, String> {
    let wanted: Vec<String> = currencies.unwrap_or_else(|| ["CNY", "EUR", "GBP", "JPY"].iter().map(|c| c.to_string()).collect());
    if wanted.len() > 12 {
        return Err("一次最多查询 12 种货币。".to_string());
    }
    for code in &wanted {
        if code.len() != 3 || !code.chars().all(|c| c.is_ascii_alphabetic()) {
            return Err(format!("货币代码无效：{code}"));
        }
    }
    if let Some(cache) = CACHE.get() {
        if cache.at.elapsed() < RATE_TTL {
            return Ok(filter_rates(&cache.rates, &wanted));
        }
    }
    let fresh = fetch_rates().await?;
    let _ = CACHE.set(FxCache { rates: fresh.clone(), at: Instant::now() });
    Ok(filter_rates(&fresh, &wanted))
}

fn filter_rates(snapshot: &FxRates, wanted: &[String]) -> FxRates {
    let rates = snapshot.rates.iter()
        .filter(|(code, _)| wanted.iter().any(|w| w.eq_ignore_ascii_case(code)))
        .cloned()
        .collect();
    FxRates { fetched_at: snapshot.fetched_at, next_update_at: snapshot.next_update_at, base: snapshot.base.clone(), rates }
}

async fn fetch_rates() -> Result<FxRates, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|error| format!("无法创建汇率请求：{error}"))?;
    let response = client.get(ENDPOINT).send().await
        .map_err(|error| format!("汇率服务请求失败：{error}"))?;
    if !response.status().is_success() {
        return Err(format!("汇率服务返回 HTTP {}。", response.status()));
    }
    let value: serde_json::Value = response.json().await
        .map_err(|error| format!("无法读取汇率结果：{error}"))?;
    let result = value.get("result").and_then(|v| v.as_str()).unwrap_or("");
    if result != "success" {
        return Err("汇率服务返回异常结果。".to_string());
    }
    let now = now_ms();
    let next_update_at = value.get("time_next_update_unix").and_then(|v| v.as_i64()).map(|s| s * 1000).unwrap_or(now + RATE_TTL.as_millis() as i64);
    let mut rates = Vec::new();
    if let Some(map) = value.get("rates").and_then(|v| v.as_object()) {
        for (code, rate) in map {
            if let Some(rate) = rate.as_f64() {
                rates.push((code.clone(), rate));
            }
        }
    }
    if rates.is_empty() {
        return Err("汇率服务未返回任何汇率。".to_string());
    }
    Ok(FxRates { fetched_at: now, next_update_at, base: "USD".to_string(), rates })
}

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

macro_rules! tauri_commands {
    ($next:ident [$($done:tt)*] $($rest:tt)*) => {
        $next!([$($done)*
            crate::trade::fx::get_fx_rates,
        ] $($rest)*)
    };
}

pub(crate) use tauri_commands;
