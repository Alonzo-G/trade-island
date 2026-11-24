// Plugins built into the island's own source. Installing one switches on a feature that lives
// beside the original ones (a message source, an Agent provider); nothing else changes until then.

// Trade edition: the upstream built-in plugins (dingtalk/feishu/wecom/cursor/kimiCode/zcode/
// hermes) are not part of this product; the list stays empty until trade-specific plugins exist.
export type NativePluginId = "dingtalk" | "feishu" | "wecom" | "cursor" | "kimiCode" | "zcode" | "hermes";

/** Where an installed plugin shows up: the Messages page's tabs or the Agent page. */
export type NativePluginKind = "messages" | "agent";

export type NativePlugin = {
  id: NativePluginId;
  kind: NativePluginKind;
  /** Accent used behind the card's icon glow; the brand's own colour. */
  accent: string;
};

export const NATIVE_PLUGINS: readonly NativePlugin[] = [];

export const NATIVE_PLUGIN_IDS: readonly NativePluginId[] = NATIVE_PLUGINS.map((plugin) => plugin.id);

export function isNativePluginId(value: unknown): value is NativePluginId {
  return typeof value === "string" && (NATIVE_PLUGIN_IDS as readonly string[]).includes(value);
}
