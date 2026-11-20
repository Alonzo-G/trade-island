import { invoke } from "@tauri-apps/api/core";

// 与 src-tauri/src/trade/fx.rs 中返回给前端的结构对应。
export type FxRates = {
  /** Unix ms when the rates were fetched. */
  fetchedAt: number;
  /** Unix ms after which asking again may return fresher data. */
  nextUpdateAt: number;
  base: string;
  /** Currency code → units per 1 USD ("CNY" → 6.69). */
  rates: [string, number][];
};

export function getFxRates(currencies: string[]) {
  return invoke<FxRates>("get_fx_rates", { currencies });
}
