# Trade Island（外贸工具岛）

Windows 桌面外贸工作台岛：邮件、客户消息雷达（WhatsApp / Telegram 等系统通知）、跟进待办、
商务翻译、时区 / 汇率 / 报价、物流追踪、AI 写作助手——收在屏幕顶部一座小岛里，需要时展开，用完收起。

基于开源项目 [fly-island](https://github.com/flyl1u/fly-island)（GPL-3.0）深度改造，岛壳与交互框架归原作者，
外贸功能层的改造同样以 GPL-3.0 开源。

## 改造路线

见仓库根目录的《改造规划.md》（工作区文档）。阶段：

- Phase 0 ✅ 换名 trade-island、封存歌词在线源与插件市场、更新端点指向自有仓库、GitHub Actions 打包流水线
- Phase 1 邮件强化 · 客户消息雷达 · 商务翻译 · 待办改跟进 CRM
- Phase 2 世界时钟 · 汇率环 · 快速报价器 · AI 写作助手 · 物流追踪 · 节假日 / 展会 · 搜客接入
- Phase 3 收起态轮播 · 设置重组 · 换肤

## 开发

```powershell
pnpm install
pnpm tauri dev     # 需要 Rust + VS C++ Build Tools（本地没装就推 GitHub 用 CI 编译）
pnpm check         # 类型检查 + 回归页类型 + lint + 行数 + 单测
pnpm test:regression
```

打包发布：推 `v*` 标签或手动触发 GitHub Actions 的 **Release** workflow，安装包在 Release 附件里。
