import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "../../i18n";
import { quote, type QuoterResult } from "./quoter";
import { loadQuoterSettings, saveQuoterSettings, type QuoterSettings } from "./storage";
import "./QuoteSection.css";

/**
 * The quick quote form (trade edition): cost + margin + freight → FOB / CIF in the picked
 * currency, converted with the fx snapshot the panel already holds. Settings persist; the
 * result never guesses from invalid numbers.
 */
export function QuoteSection({ rates }: { rates: [string, number][] }) {
  const t = useTranslation();
  const [settings, setSettings] = useState<QuoterSettings>(loadQuoterSettings);

  const update = useCallback((patch: Partial<QuoterSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveQuoterSettings(next);
      return next;
    });
  }, []);

  const rate = useMemo(() => {
    const entry = rates.find(([code]) => code === settings.currency);
    return entry ? 1 / entry[1] : null; // units of `currency` per 1 working-currency unit
  }, [rates, settings.currency]);

  const digits = settings.currency === "JPY" ? 0 : 2;
  const result: QuoterResult | null = rate !== null
    ? quote({ ...settings, rate, digits })
    : null;

  const field = (label: string, key: "unitCost" | "marginPercent" | "unitsPerPackage" | "freightPerPackage" | "insurancePercent", step: number, min: number) => (
    <label className="quote-row">
      <span className="quote-row__label">{label}</span>
      <input className="quote-row__input" type="number" step={step} min={min}
        value={String(settings[key])}
        onChange={(event) => update({ [key]: Number(event.target.value) } as Partial<QuoterSettings>)} />
    </label>
  );

  return (
    <div className="trade-panel__section" role="group" aria-label={t.trade.quoter}>
      <h2 className="trade-panel__heading">{t.trade.quoter}</h2>
      <div className="quote-grid">
        {field(t.trade.unitCost, "unitCost", 0.1, 0)}
        {field(t.trade.margin, "marginPercent", 1, 1)}
        {field(t.trade.unitsPerPackage, "unitsPerPackage", 1, 1)}
        {field(t.trade.freight, "freightPerPackage", 1, 0)}
        {field(t.trade.insurance, "insurancePercent", 0.5, 0)}
        <label className="quote-row">
          <span className="quote-row__label">{t.trade.currency}</span>
          <select className="quote-row__input" value={settings.currency}
            onChange={(event) => update({ currency: event.target.value })}>
            {rates.map(([code]) => <option key={code} value={code}>{code}</option>)}
          </select>
        </label>
      </div>
      {result ? (
        <div className="quote-result">
          <div className="quote-result__row quote-result__row--fob">
            <span>{t.trade.fobLabel}</span>
            <strong>{result.fob.toFixed(digits)} {settings.currency}</strong>
          </div>
          <div className="quote-result__row">
            <span>{t.trade.cifLabel}</span>
            <strong>{result.cif.toFixed(digits)} {settings.currency}</strong>
          </div>
          <div className="quote-result__row">
            <span>{t.trade.freightLabel}</span>
            <span>{result.freightPerUnit.toFixed(digits + 2)} {settings.currency}</span>
          </div>
          <div className="quote-result__row">
            <span>{t.trade.packageLabel}</span>
            <span>{result.packageValue.toFixed(digits)} {settings.currency}</span>
          </div>
        </div>
      ) : (
        <p className="quote-invalid" role="status">{t.trade.quoteInvalid}</p>
      )}
    </div>
  );
}
