import { invoke } from "@tauri-apps/api/core";

// 与 src-tauri/src/trade/writer.rs 的 compose_trade_text 参数对应。
export const WRITER_SCENARIOS = [
  "first-outreach",
  "inquiry-reply",
  "follow-up",
  "thanks",
  "complaint-reply",
] as const;

export type WriterScenario = (typeof WRITER_SCENARIOS)[number];
export type WriterLanguage = "en" | "zh";

export function composeTradeText(
  scenario: WriterScenario,
  brief: string,
  language: WriterLanguage,
  service: { provider: string; baseUrl: string | null; model: string | null },
) {
  return invoke<string>("compose_trade_text", { scenario, brief, language, ...service });
}
