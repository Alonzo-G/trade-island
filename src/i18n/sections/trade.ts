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
  quoter: string;
  unitCost: string;
  margin: string;
  unitsPerPackage: string;
  freight: string;
  insurance: string;
  currency: string;
  fobLabel: string;
  cifLabel: string;
  freightLabel: string;
  packageLabel: string;
  quoteInvalid: string;
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
  quoter: "快速报价",
  unitCost: "单价成本",
  margin: "利润率 %",
  unitsPerPackage: "每箱数量",
  freight: "每箱运费",
  insurance: "保险 %",
  currency: "报价币种",
  fobLabel: "FOB 单价",
  cifLabel: "CIF 单价",
  freightLabel: "运费/件",
  packageLabel: "整箱货值",
  quoteInvalid: "请检查输入：成本、利润率、数量和运费需在有效范围内。",
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
  quoter: "Quick quote",
  unitCost: "Unit cost",
  margin: "Margin %",
  unitsPerPackage: "Units / carton",
  freight: "Freight / carton",
  insurance: "Insurance %",
  currency: "Quote in",
  fobLabel: "FOB / unit",
  cifLabel: "CIF / unit",
  freightLabel: "Freight / unit",
  packageLabel: "Carton value",
  quoteInvalid: "Check the inputs: cost, margin, units and freight must be in range.",
};
