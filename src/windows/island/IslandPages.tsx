import type { SessionRemoval } from "../../features/agent-status/useHiddenSessions";
import type { ReactNode } from "react";
import { MessagesPanel } from "../../features/messages/Messages";
import type { useQQNotifications } from "../../features/messages/qq-notifications/QQNotifications";
import type { useWeChatReminders } from "../../features/messages/wechat/WeChatReminders";
import type { useMail } from "../../features/messages/mail/MailPanel";
import { TodoNotebook } from "../../features/todos/TodoNotebook";
import type { useTodos } from "../../features/todos/useTodos";
import { openSettingsWindow } from "../settings/api";
import { SettingsPanel } from "../settings/SettingsPanel";
import "../settings/IslandSettingsPage.css";
import { TranslationPanel } from "../../features/translation/TranslationPanel";
import { AgentSessionsPanel } from "../../features/agent-status/AgentSessionsPanel";
import type { AgentSessionSummary } from "../../features/agent-status/api";
import type { UnseenSessions } from "../../features/agent-status/useUnseenSessions";
import type { AgentUsages } from "../../features/agent-status/usage";
import type { IslandSettings } from "../../features/appearance/types";
import { ClipboardHistoryPanel } from "../../features/clipboard/ClipboardHistoryPanel";
import type { useClipboardHistory } from "../../features/clipboard/useClipboardHistory";
import { FileShelfPanel } from "../../features/file-shelf/FileShelfPanel";
import type { useFileShelf } from "../../features/file-shelf/useFileShelf";
import { TradeToolsPanel } from "../../features/trade/TradeToolsPanel";
import { AppLauncherSection } from "../../features/app-launcher/AppLauncherSection";
import { getTodoScrollStartRows } from "./layout";
import type { useIslandAgentAlerts } from "./useIslandAgentAlerts";
import type { useIslandFeatures } from "./useIslandFeatures";
import type { useIslandNavigation } from "./useIslandNavigation";
import type { useMessageView } from "./useMessageView";

type MessageView = ReturnType<typeof useMessageView>;
type AgentAlerts = ReturnType<typeof useIslandAgentAlerts>;

type IslandPagesProps = {
  page: ReturnType<typeof useIslandNavigation>["page"];
  mode: ReturnType<typeof useIslandNavigation>["mode"];
  settings: IslandSettings;
  onSettingsChange: (settings: IslandSettings | ((current: IslandSettings) => IslandSettings)) => void;
  /** Whether settings open in their own window (then this page is not used). */
  detachedSettings: boolean;
  onDetachedSettingsChange: (detached: boolean) => void;
  /** The height the open settings page needs (useSettingsPageHeight). */
  onSettingsHeight: (height: number) => void;
  features: ReturnType<typeof useIslandFeatures>["features"];
  qqMail: ReturnType<typeof useMail>;
  qqNotifications: ReturnType<typeof useQQNotifications>;
  wechatReminders: ReturnType<typeof useWeChatReminders>;
  messageSource: MessageView["messageSource"];
  openMessages: MessageView["openMessages"];
  clipboard: ReturnType<typeof useClipboardHistory>;
  agentSessions: AgentSessionSummary[];
  unseenAgentSessions: UnseenSessions;
  agentRemoval: SessionRemoval;
  alertedSession: AgentAlerts["alertedSession"];
  agentApprovals: AgentAlerts["approvals"];
  agentUsages: AgentUsages;
  fileShelf: ReturnType<typeof useFileShelf>;
  isShelfDropping: boolean;
  notebookProps: ReturnType<typeof useTodos>["notebookProps"];
  /** Reports the trade page's content height; the island sizes itself to it. */
  onTradeHeight: (height: number) => void;
};

/** The expanded island's page panels; the one for `page` shows. */
export function IslandPages({
  page,
  mode,
  settings,
  onSettingsChange,
  detachedSettings,
  onDetachedSettingsChange,
  onSettingsHeight,
  features,
  qqMail,
  qqNotifications,
  wechatReminders,
  messageSource,
  openMessages,
  clipboard,
  agentSessions,
  unseenAgentSessions,
  agentRemoval,
  alertedSession,
  agentApprovals,
  agentUsages,
  fileShelf,
  isShelfDropping,
  notebookProps,
  onTradeHeight,
}: IslandPagesProps): ReactNode {
  const {
    clipboardHistory,
    copyClipboardHistoryItem,
    toggleClipboardHistoryFavorite,
    updateClipboardHistoryItemNote,
    deleteClipboardHistoryItem,
    deleteClipboardHistoryItems,
  } = clipboard;
  return (
    <>
      {page === "settings" && (
        <div className="island-settings">
          <SettingsPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            qqNotifications={qqNotifications}
            wechatReminders={wechatReminders}
            detached={detachedSettings}
            onDetachedChange={onDetachedSettingsChange}
            onContentHeight={onSettingsHeight}
          />
        </div>
      )}
      {page === "apps" && (
        <div className="apps-page">
          <AppLauncherSection dropPaths={null} standalone />
        </div>
      )}
      {page === "qq" && (
        <div className="message-panel">
          <MessagesPanel qqMail={qqMail} qqNotifications={qqNotifications} wechatReminders={wechatReminders} source={messageSource} enabledSources={features} onSourceChange={openMessages} onOpenMailSettings={() => openSettingsWindow("mail")} />
        </div>
      )}
      {page === "clipboard" && (
        <ClipboardHistoryPanel
          snapshot={clipboardHistory}
          onCopyItem={copyClipboardHistoryItem}
          onToggleFavorite={(id) => void toggleClipboardHistoryFavorite(id)}
          onUpdateNote={updateClipboardHistoryItemNote}
          onDeleteItem={(id) => void deleteClipboardHistoryItem(id)}
          onDeleteItems={deleteClipboardHistoryItems}
        />
      )}
      {page === "agents" && <AgentSessionsPanel sessions={agentSessions} view={settings.agentSessionView} sort={settings.agentSessionSort} group={settings.agentSessionGroup} archiveMotion={settings.agentArchiveMotion} cardEffects={settings.agentCardEffects} hostDisplay={settings.agentHostDisplay} showElapsed={settings.agentShowElapsed} showModel={settings.agentShowModel} showActivity={settings.agentShowActivity} unseen={unseenAgentSessions} removal={agentRemoval} reveal={alertedSession} showUsage={settings.agentShowUsage} usages={agentUsages} approvals={agentApprovals} />}
      {page === "translation" && <TranslationPanel isOpen={mode === "expanded"} onOpenSettings={() => openSettingsWindow("translation")} />}
      {page === "shelf" && <FileShelfPanel shelf={fileShelf} isDropTarget={isShelfDropping} revealOnDoubleClick={settings.shelfDoubleClick === "reveal"} />}
      {page === "trade" && (
        <div className="trade-page">
          <TradeToolsPanel isOpen={mode === "expanded"} onContentHeight={onTradeHeight} />
        </div>
      )}
      {page === "todo" && (
        <TodoNotebook
          {...notebookProps}
          enableTodoReorder={settings.enableTodoReorder}
          scrollStartRows={getTodoScrollStartRows(settings.maxPanelHeight)}
        />
      )}
    </>
  );
}
