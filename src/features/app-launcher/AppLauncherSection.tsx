import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n";
import { GripVertical, Play, Plus, Trash2 } from "lucide-react";
import { getAppLauncherIcon, type LauncherItem } from "./api";
import { useAppLauncher } from "./useAppLauncher";
import "./AppLauncherSection.css";

/**
 * The quick-launch grid (快捷应用, trade edition): app shortcuts dropped on this page, one
 * click starts them. Drops of .lnk / .exe / .url files add shortcuts; anything else the
 * native side rejects with a readable message.
 */
export function AppLauncherSection({ dropPaths }: { dropPaths: string[] | null }) {
  const t = useTranslation();
  const { items, error, busy, addPaths, remove, reorder, start } = useAppLauncher(true);
  const [icons, setIcons] = useState<Record<string, string | null>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Icon extraction is per-item and cached by the native side; lazily fill the grid.
  useEffect(() => {
    let didCancel = false;
    for (const item of items) {
      if (icons[item.id] !== undefined) continue;
      void getAppLauncherIcon(item.id).then((url) => {
        if (!didCancel) setIcons((current) => ({ ...current, [item.id]: url }));
      });
    }
    return () => {
      didCancel = true;
    };
  }, [items, icons]);

  // Files dropped on the trade page land here when they look like app shortcuts.
  useEffect(() => {
    if (!dropPaths || dropPaths.length === 0) return;
    void addPaths(dropPaths);
  }, [dropPaths, addPaths]);

  return (
    <div className="trade-panel__section" role="group" aria-label={t.trade.launcher.title}>
      <h2 className="trade-panel__heading">{t.trade.launcher.title}</h2>
      {error && <p className="launcher-error" role="alert">{error}</p>}
      {items.length === 0 ? (
        <div className="launcher-empty" role="status">
          <Plus size={20} strokeWidth={1.6} aria-hidden="true" />
          <span>{t.trade.launcher.emptyHint}</span>
        </div>
      ) : (
        <div className="launcher-grid" role="list">
          {items.map((item) => (
            <LauncherTile
              key={item.id}
              item={item}
              icon={icons[item.id]}
              dragging={draggingId === item.id}
              busy={busy}
              onStart={() => void start(item.id)}
              onRemove={() => void remove([item.id])}
              onDragStart={setDraggingId}
              onDropOn={(target) => {
                if (draggingId && draggingId !== target) void reorder(draggingId, target);
                setDraggingId(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LauncherTile({
  item,
  icon,
  dragging,
  busy,
  onStart,
  onRemove,
  onDragStart,
  onDropOn,
}: {
  item: LauncherItem;
  icon?: string | null;
  dragging: boolean;
  busy: boolean;
  onStart: () => void;
  onRemove: () => void;
  onDragStart: (id: string) => void;
  onDropOn: (target: string) => void;
}) {
  const t = useTranslation();
  return (
    <div
      className={`launcher-tile${item.missing ? " launcher-tile--missing" : ""}${dragging ? " launcher-tile--dragging" : ""}`}
      role="listitem"
      draggable
      onDragStart={(event) => {
        // HTML5 drag for reordering inside the grid (the native file drag is one-way out).
        event.dataTransfer.setData("text/trade-island-launcher", item.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(item.id);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropOn(item.id);
      }}
      onDragEnd={() => onDragStart("")}
    >
      <button
        className="launcher-tile__start"
        type="button"
        disabled={busy || item.missing}
        title={item.missing ? t.trade.launcher.missing : `${item.name} — ${t.trade.launcher.start}`}
        onClick={onStart}
      >
        {icon
          ? <img src={icon} alt="" width={32} height={32} draggable={false} />
          : <Play size={22} strokeWidth={1.6} aria-hidden="true" />}
        <span className="launcher-tile__name">{item.name}</span>
      </button>
      <button
        className="launcher-tile__remove"
        type="button"
        aria-label={t.trade.launcher.remove(item.name)}
        disabled={busy}
        onClick={onRemove}
      >
        <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <GripVertical className="launcher-tile__grip" size={11} strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}
