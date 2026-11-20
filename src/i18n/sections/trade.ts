export type TradeText = {
  panelLabel: string;
  clockLabel: string;
  fxLabel: string;
  refresh: string;
  fxEmpty: string;
  fxUpdated: (at: number) => string;
  working: string;
  offHours: string;
  weekend: string;
};

export const zhCN: TradeText = {
  panelLabel: "外贸工具",
  clockLabel: "客户时区",
  fxLabel: "美元汇率",
  refresh: "刷新汇率",
  fxEmpty: "打开面板时自动获取当天汇率。",
  fxUpdated: (at) => `更新于 ${new Date(at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
  working: "工作中",
  offHours: "非工作时间",
  weekend: "周末",
};

export const en: TradeText = {
  panelLabel: "Trade tools",
  clockLabel: "Customer time zones",
  fxLabel: "USD rates",
  refresh: "Refresh rates",
  fxEmpty: "Rates load for the day when the panel opens.",
  fxUpdated: (at) => `Updated ${new Date(at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`,
  working: "At work",
  offHours: "Off hours",
  weekend: "Weekend",
};
