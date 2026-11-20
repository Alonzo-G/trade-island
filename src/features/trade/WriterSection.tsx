import { useCallback, useState, type FormEvent } from "react";
import { useTranslation } from "../../i18n";
import { Loader2, Send } from "lucide-react";
import { useTranslationSettings } from "../translation/useTranslationSettings";
import { WRITER_SCENARIOS, composeTradeText, type WriterLanguage, type WriterScenario } from "./api";
import "./WriterSection.css";

type ScenarioKey = "firstOutreach" | "inquiryReply" | "followUp" | "thanks" | "complaintReply";

const SCENARIO_KEYS: Record<WriterScenario, ScenarioKey> = {
  "first-outreach": "firstOutreach",
  "inquiry-reply": "inquiryReply",
  "follow-up": "followUp",
  thanks: "thanks",
  "complaint-reply": "complaintReply",
};

/**
 * The AI writer (trade edition): a scenario, the brief in your own words, and the drafted
 * mail in English or Chinese. Requests reuse the translation service's provider and key.
 */
export function WriterSection() {
  const t = useTranslation();
  const [settings] = useTranslationSettings();
  const [scenario, setScenario] = useState<WriterScenario>("first-outreach");
  const [language, setLanguage] = useState<WriterLanguage>("en");
  const [brief, setBrief] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    const text = brief.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setDraft("");
    try {
      const provider = settings.provider;
      const written = await composeTradeText(scenario, text, language, {
        provider,
        baseUrl: provider === "custom" ? settings.customBaseUrl.trim() : null,
        model: settings.models[provider]?.trim() || null,
      });
      setDraft(written);
    } catch (failure) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }, [brief, busy, language, scenario, settings]);

  const copy = useCallback(async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t.trade.writer.copyFailed);
    }
  }, [draft, t.trade.writer.copyFailed]);

  return (
    <div className="trade-panel__section" role="group" aria-label={t.trade.writer.title}>
      <h2 className="trade-panel__heading">{t.trade.writer.title}</h2>
      <form className="writer-form" onSubmit={(event) => void submit(event)}>
        <div className="writer-form__picks">
          <select aria-label={t.trade.writer.scenario} value={scenario} disabled={busy}
            onChange={(event) => setScenario(event.target.value as WriterScenario)}>
            {WRITER_SCENARIOS.map((candidate) => (
              <option key={candidate} value={candidate}>{t.trade.writer.scenarios[SCENARIO_KEYS[candidate]]}</option>
            ))}
          </select>
          <select aria-label={t.trade.writer.language} value={language} disabled={busy}
            onChange={(event) => setLanguage(event.target.value as WriterLanguage)}>
            <option value="en">{t.trade.writer.english}</option>
            <option value="zh">{t.trade.writer.chinese}</option>
          </select>
        </div>
        <textarea className="writer-form__brief" rows={3} value={brief} disabled={busy}
          placeholder={t.trade.writer.briefHint}
          onChange={(event) => setBrief(event.target.value)} />
        <button className="writer-form__send" type="submit" disabled={busy || !brief.trim()}>
          {busy ? <Loader2 size={14} className="writer-form__spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
          {t.trade.writer.write}
        </button>
      </form>
      {error && <p className="writer-error" role="alert">{error}</p>}
      {draft && (
        <div className="writer-draft">
          <pre>{draft}</pre>
          <button type="button" className="writer-draft__copy" onClick={() => void copy()}>
            {copied ? t.trade.writer.copied : t.trade.writer.copy}
          </button>
        </div>
      )}
    </div>
  );
}
