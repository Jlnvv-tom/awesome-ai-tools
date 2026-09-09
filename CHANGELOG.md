# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [未发布]

### Added

- 项目基础架构：Next.js 15 + React 19 + Tailwind + shadcn/ui
- 图标元数据同步脚本 `sync:icons`（对接 LobeHub Icons，322 条）
- 数据分层：上游元数据 + 人工覆盖（`data/sites/*.json`，159 条已人工维护）
- 首页：Hero 数据统计、实时筛选、分类网格与编辑精选
- 分类页（10 个）、站点详情页（322 个），全量静态生成
- ⌘K 全局搜索与客户端索引按需加载
- SEO：metadata、sitemap、robots、OG 图、JSON-LD 结构化数据
- SDD 规范文档（`docs/spec/*`）与 3 篇 ADR
- 开源文档：README、CONTRIBUTING、ROADMAP、行为准则、安全策略
- CI 门禁（lint / typecheck / test / validate-data / build）与 Vercel PR 预览

### Added（M2 · 数据完善）

- 数据审计脚本：`audit:curation`（待认领清单与维护进度）、`audit:categories`（归类置信度）、`audit:tags`（标签频次与同义收敛）
- 官网可达性巡检脚本 `check:links` 与每周定时工作流 `link-check.yml`（只出报告，不阻断构建）
- 站点收录时间字段 `addedAt` 与回填脚本 `backfill:added-at`（按 git 历史生成 `src/data/added-at.generated.ts`）
- 首页「本周新增工具」区块（窗口内无新增时自动降级为「最近收录」）

### Changed（M2 · 数据完善）

- 标签体系收敛：受控词表 63 → 50（合并 8 组同义标签，移除 3 个零使用标签）
- 分类关键词扩充：兜底归类条目 71 → 1，疑似错分条目 82 → 2
- 人工维护条目 159 → 243（完成率 75.5%），剩余 79 条开放社区认领
- 收录时间纳入数据模型（`src/types/site.ts` + `src/data/schema.ts` + `docs/spec/10-data-model.md` 三处同步）
