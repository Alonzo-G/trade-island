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
  launcher: {
    title: string;
    emptyHint: string;
    missing: string;
    start: string;
    remove: (name: string) => string;
  };
  writer: {
    title: string;
    scenario: string;
    language: string;
    briefHint: string;
    write: string;
    copy: string;
    copied: string;
    copyFailed: string;
    english: string;
    chinese: string;
    scenarios: {
      firstOutreach: string;
      inquiryReply: string;
      followUp: string;
      thanks: string;
      complaintReply: string;
    };
  };
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
  launcher: {
    title: "快捷应用",
    emptyHint: "把 .lnk / .exe 快捷方式拖到这里，随时一键启动",
    missing: "目标已移动或卸载",
    start: "启动",
    remove: (name) => `移除 ${name}`,
  },
  writer: {
    title: "AI 写作助手",
    scenario: "场景",
    language: "写作语言",
    briefHint: "用中文写要点：产品、客户情况、这封邮件要达成什么（如： Bluetooth speaker，客户上周询价 2000 件，回复报 FOB 价并要 PI 资料）",
    write: "生成邮件",
    copy: "复制",
    copied: "已复制",
    copyFailed: "无法访问剪贴板。",
    english: "英文",
    chinese: "中文",
    scenarios: {
      firstOutreach: "开发信",
      inquiryReply: "询盘回复",
      followUp: "跟进催复",
      thanks: "订单致谢",
      complaintReply: "投诉处理",
    },
  },
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
  launcher: {
    title: "Quick apps",
    emptyHint: "Drop .lnk / .exe shortcuts here to start them with one click",
    missing: "Target moved or uninstalled",
    start: "Start",
    remove: (name) => `Remove ${name}`,
  },
  writer: {
    title: "AI writer",
    scenario: "Scenario",
    language: "Language",
    briefHint: "Key points in any language: product, customer context, what this mail should achieve",
    write: "Draft mail",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Clipboard is unavailable.",
    english: "English",
    chinese: "Chinese",
    scenarios: {
      firstOutreach: "First outreach",
      inquiryReply: "Inquiry reply",
      followUp: "Follow-up",
      thanks: "Order thanks",
      complaintReply: "Complaint reply",
    },
  },
};
