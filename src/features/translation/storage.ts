import {
  DEFAULT_TRANSLATION_PROVIDER,
  LEGACY_TRANSLATION_PROVIDER,
  isTranslationProvider,
  type TranslationProvider,
} from "./providers.ts";

export type Direction = "auto" | "zh-en" | "en-zh";
/** How the translation should sound; "plain" is the wording-focused default. */
export type TranslationTone = "plain" | "business-formal" | "business-friendly";
export const TRANSLATION_TONES: readonly TranslationTone[] = ["plain", "business-formal", "business-friendly"];
export type TranslationSettings = {
  shortcut: string;
  /** Off releases the global shortcut while translation itself stays on. */
  shortcutEnabled: boolean;
  direction: Direction;
  provider: TranslationProvider;
  /** Base URL of the OpenAI-compatible service used by the "custom" provider. */
  customBaseUrl: string;
  /** Model per provider; an empty or missing entry uses the provider's default. */
  models: Partial<Record<TranslationProvider, string>>;
  /** Fill an empty source from the clipboard when the translation window opens. */
  pasteClipboardOnOpen: boolean;
  /** Translate after the source has stopped changing, while the window is open. */
  autoTranslate: boolean;
  /** The register the translation aims for; trade correspondence picks a business one. */
  tone: TranslationTone;
};
export const STORAGE_KEY = "focusd-island-translation-settings";
const LEGACY_DEFAULT_SHORTCUTS = new Set(["Alt+Space", "Alt+C"]);

export const DEFAULT_SETTINGS: TranslationSettings = {
  shortcut: "Ctrl+Shift+F",
  shortcutEnabled: true,
  direction: "auto",
  provider: DEFAULT_TRANSLATION_PROVIDER,
  customBaseUrl: "",
  models: {},
  pasteClipboardOnOpen: true,
  autoTranslate: false,
  tone: "plain",
};

function normalizeModels(value: unknown): TranslationSettings["models"] {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [TranslationProvider, string] =>
        isTranslationProvider(entry[0]) && typeof entry[1] === "string",
    ),
  );
}

export function normalizeTranslationSettings(stored: unknown): TranslationSettings {
  if (typeof stored !== "object" || stored === null) return DEFAULT_SETTINGS;
  const value = stored as Record<string, unknown>;
  const shortcut = typeof value.shortcut === "string" ? value.shortcut : DEFAULT_SETTINGS.shortcut;
  return {
    // Earlier defaults move to the current one; a shortcut the user picked is kept.
    shortcut: LEGACY_DEFAULT_SHORTCUTS.has(shortcut) ? DEFAULT_SETTINGS.shortcut : shortcut,
    // Saved before the switch existed: the shortcut was always on.
    shortcutEnabled: value.shortcutEnabled !== false,
    direction: value.direction === "zh-en" || value.direction === "en-zh" ? value.direction : "auto",
    provider: isTranslationProvider(value.provider) ? value.provider : LEGACY_TRANSLATION_PROVIDER,
    customBaseUrl: typeof value.customBaseUrl === "string" ? value.customBaseUrl : "",
    models: normalizeModels(value.models),
    // No longer settings: pasting the clipboard on open and translating as you type keep their defaults.
    pasteClipboardOnOpen: DEFAULT_SETTINGS.pasteClipboardOnOpen,
    autoTranslate: DEFAULT_SETTINGS.autoTranslate,
    tone: TRANSLATION_TONES.includes(value.tone as TranslationTone) ? value.tone as TranslationTone : DEFAULT_SETTINGS.tone,
  };
}

export function loadSettings(): TranslationSettings {
  try {
    return normalizeTranslationSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveTranslationSettings(settings: TranslationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
