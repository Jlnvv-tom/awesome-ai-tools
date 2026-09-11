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

### Added（M3 · 体验增强）

- 收藏夹：卡片收藏按钮、顶栏收藏入口（数量徽标）、`/favorites` 收藏页、⌘K 搜索内「只看收藏」筛选
- 「我的常用」区块：基于本地访问与收藏的加权排序，仅本人可见，无数据时自动隐藏
- 详情页元信息徽标：定价、是否开源、是否支持中文（未填写显示「待补充」）
- `?` 键键盘快捷键总览弹窗
- 列表 / 网格视图切换：首页、分类页、收藏页共用，选择持久化到 localStorage
- 跳转到主内容的键盘入口（无障碍）
- 无障碍走查报告 `docs/a11y/accessibility-audit.md`

### Changed（M3 · 体验增强）

- 新增元信息字段 `pricing` / `openSource` / `chineseSupport`，三处定义同步，并由 `migrate:meta` 从 `free` / `open-source` / `chinese` 标签迁移初值
- 标签词表 50 → 47（移除已由结构化字段承载的三个标签）
- `SiteCard` 重构为「容器 + 覆盖式链接」结构，避免交互元素嵌套
- 分类页列表视图由「卡片堆叠」改为真正的紧凑行式布局

### Added（M4 · 生态与国际化）

- 中英文双语：`/` 中文、`/en` 英文，自建字典（`src/i18n`）与共享视图，顶栏语言切换入口
- 开放 API：`/api/sites`（category / tag / q / featured / limit / offset）、`/api/categories`（含条目数），带 CORS 与 CDN 缓存头，文档见 `docs/api.md`
- 数据贡献看板 `/contributors`（中英双语）：git 历史统计的贡献者 + 待认领进度
- RSS 订阅源 `/rss.xml`（最近新增 20 条），页脚与 `<link rel="alternate">` 提供入口
- Cloudflare Pages 镜像部署：`wrangler.toml` + `cloudflare-pages.yml`（未配置 secrets 时跳过）
- 生成脚本 `build:contributors`（幂等 + `--check`）与生成文件 `contributors.generated.ts`

### Changed（M4 · 生态与国际化）

- 路由结构调整为路由组 `(zh)` + `en` 分支，根布局只保留外壳与 Providers
- 站点/分类展示名按语言选取（`nameCn ?? name` / `nameEn`），英文站简介回退中文原文
- `sitemap.xml` 输出中英双份 URL 并互相声明 hreflang；详情页与分类页补充 canonical
- API 路由统一声明 Edge Runtime（兼容 Vercel 与 Cloudflare Pages）
