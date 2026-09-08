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
