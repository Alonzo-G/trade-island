import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n";
import { Moon, RefreshCw, Sun } from "lucide-react";
import { useWorldClock } from "../world-clock/useWorldClock";
import { useFxRates } from "../fx-rates/useFxRates";
import { QuoteSection } from "../quoter/QuoteSection";
import { WriterSection } from "./WriterSection";
import { AppLauncherSection } from "../app-launcher/AppLauncherSection";
import type { ZoneView } from "../world-clock/zones";
import "./TradeToolsPanel.css";

/**
 * The trade tools page (trade edition): customer time zones with a "good to message" state,
 * and today's USD rates. One page, two sections; more trade tools join below over time.
 */
export function TradeToolsPanel({ isOpen, onContentHeight, launcherDropPaths }: { isOpen: boolean; onContentHeight?: (height: number) => void; launcherDropPaths: string[] | null }) {
  const t = useTranslation();
  const panelRef = useRef<HTMLElement | null>(null);

  // The island grows to the panel's content height (one report per layout change); the CSS
  // max-height keeps it inside the island while the native height follows.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !onContentHeight) return;
    const report = () => onContentHeight(panel.scrollHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [onContentHeight]);
  const { views } = useWorldClock(isOpen);
  const { snapshot: fx, loading, error, refresh } = useFxRates(isOpen);
  const updated = fx.fetchedAt ? new Date(fx.fetchedAt) : null;

  return (
    <section ref={panelRef} className="trade-panel" aria-label={t.trade.panelLabel}>
      <div className="trade-panel__section" role="group" aria-label={t.trade.clockLabel}>
        <h2 className="trade-panel__heading">{t.trade.clockLabel}</h2>
        <div className="trade-clock__list">
          {views.map((view) => <WorldClockRow key={view.zone} view={view} />)}
        </div>
      </div>
      <div className="trade-panel__section" role="group" aria-label={t.trade.fxLabel}>
        <h2 className="trade-panel__heading">
          {t.trade.fxLabel}
          <button className="icon-button trade-fx__refresh" type="button" aria-label={t.trade.refresh} disabled={loading} onClick={() => void refresh()}>
            <RefreshCw size={13} strokeWidth={1.8} className={loading ? "trade-fx__spin" : ""} />
          </button>
        </h2>
        {error && <p className="trade-fx__error" role="alert">{error}</p>}
        <div className="trade-fx__list">
          {fx.rates.length === 0 && !loading && !error && <p className="trade-fx__empty">{t.trade.fxEmpty}</p>}
          {fx.rates.map(([code, rate]) => (
            <div key={code} className="trade-fx__row">
              <span className="trade-fx__code">{code}</span>
              <span className="trade-fx__value">{rate.toFixed(4)}</span>
              <span className="trade-fx__cny">≈ {(1 / rate).toFixed(4)} USD</span>
            </div>
          ))}
        </div>
        {updated && <p className="trade-fx__updated">{t.trade.fxUpdated(new Date(updated).getTime())}</p>}
      </div>
      <QuoteSection rates={fx.rates} />
      <WriterSection />
      <AppLauncherSection dropPaths={launcherDropPaths} />
    </section>
  );
}

function WorldClockRow({ view }: { view: ZoneView }) {
  const t = useTranslation();
  const state = view.weekend ? "weekend" : view.open ? "open" : "closed";
  return (
    <div className={`trade-clock__row trade-clock__row--${state}`}>
      <span className="trade-clock__country">{view.country || view.label.slice(0, 2).toUpperCase()}</span>
      <span className="trade-clock__city">{view.label}</span>
      <span className="trade-clock__time">{view.time}</span>
      {view.open ? <Sun size={13} strokeWidth={1.8} aria-hidden="true" /> : <Moon size={13} strokeWidth={1.8} aria-hidden="true" />}
      <span className="trade-clock__state">{view.weekend ? t.trade.weekend : view.open ? t.trade.working : t.trade.offHours}</span>
    </div>
  );
}
