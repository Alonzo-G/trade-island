import test from "node:test";
import assert from "node:assert/strict";
import { PLUGINS_ENABLED, MAIL_OTP_ENABLED } from "../../src/features/releaseFlags.ts";
import { SETTINGS_CATEGORIES, SETTINGS_GROUPS, settingsCategoryFor } from "../../src/windows/settings/categories.ts";
import { isPageEnabled, resolveMessageSource } from "../../src/windows/island/features.ts";
import { normalizeSettings } from "../../src/features/appearance/settings.ts";

test("trade edition switches: plugins and market on, mail OTP off; plugin settings route exists", () => {
  assert.equal(MAIL_OTP_ENABLED, false);
  assert.equal(PLUGINS_ENABLED, true);
  assert.equal(SETTINGS_CATEGORIES.includes("plugins"), true);
  assert.equal(SETTINGS_GROUPS.some((group) => group.categories.includes("plugins")), true);
  assert.equal(settingsCategoryFor("plugins"), "plugins");
  const features = { todo: false, music: false, clipboard: false, shelf: false,
    agents: false, translation: false, qq: false, wechat: false, qqMail: false, plugin: true };
  // Plugins now ship on: a plugin with notifications lights the messages page.
  assert.equal(isPageEnabled("qq", features), true);
  // Plugin source is valid now: it resolves to itself, wechat first stays first.
  assert.equal(resolveMessageSource("plugin", { ...features, wechat: true }), "plugin");
  assert.equal(resolveMessageSource("plugin", features), "plugin");
  for (const autoCopyOtp of [true, false]) {
    assert.equal(normalizeSettings({ autoCopyOtp }).autoCopyOtp, autoCopyOtp);
  }
});
