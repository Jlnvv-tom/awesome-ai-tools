---
name: m4-ecosystem-i18n
overview: 完成 ROADMAP 中 M4 · 生态与国际化（v0.4.x）的 5 项迭代：自建轻量 i18n（/[locale] 路由 + 字典，中英双语）、Cloudflare Pages 镜像的 CI 自动部署、开放 API（/api/sites、/api/categories 支持筛选参数）、数据贡献看板（git 贡献者 + 待认领条目）、RSS 订阅源（最近新增工具）。
design:
  architecture:
    framework: react
    component: shadcn
  fontSystem:
    fontFamily: system-ui
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 400
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - '#6E56F8'
      - '#00D4C8'
    background:
      - '#0B0B12'
      - '#14141F'
    text:
      - '#F5F5F7'
      - '#9CA3AF'
    functional:
      - '#22C55E'
      - '#F59E0B'
      - '#EF4444'
todos:
  - id: i18n-infra
    content: 用 [skill:project-structure] 确认落位，新建 src/i18n 字典与 localePath，抽取共享页面组件并接入根布局 RSS 发现标签
    status: completed
  - id: i18n-pages
    content: 用 [subagent:code-explorer] 盘点硬编码文案，完成中文页面双语接入与 /en 英文路由、语言切换入口、sitemap hreflang
    status: completed
    dependencies:
      - i18n-infra
  - id: open-api
    content: 新增 /api/sites 与 /api/categories（revalidate + edge runtime + 筛选参数与缓存头），补 search-index 的 edge 声明并写 docs/api.md
    status: completed
  - id: cf-pages
    content: 新增 @cloudflare/next-on-pages 适配、wrangler.toml 与 cloudflare-pages.yml（secrets 缺失时优雅跳过）及部署文档
    status: completed
    dependencies:
      - open-api
  - id: contributors-board
    content: 新增 build-contributors 幂等脚本（--check）与 /contributors 双语看板页，复用待认领判定
    status: completed
    dependencies:
      - i18n-infra
  - id: rss-feed
    content: 新增 /rss.xml 输出最近新增工具，补充 layout 发现标签、页脚入口并核对 robots 规则
    status: completed
    dependencies:
      - i18n-pages
  - id: docs-validation
    content: 补齐 ADR、CHANGELOG、ROADMAP 勾选，跑通 CI 全链路校验与 next build 多语言预渲染
    status: completed
    dependencies:
      - i18n-pages
      - open-api
      - cf-pages
      - contributors-board
      - rss-feed
---

## 产品概述

完成 ROADMAP「M4 · 生态与国际化（v0.4.x）」的 5 项迭代，在保持纯静态、无后端、无追踪的前提下，把项目从「中文单语导航站」升级为「可双语访问、数据可对外开放、部署可多平台镜像、贡献可度量、内容可订阅」的开源生态。

## 核心特性

1. **中英文双语**：中文站点保持根路由（`/`），英文站点位于 `/en` 前缀；界面文案全部翻译，数据字段按语言选取（站点名称、分类名），未翻译的中文简介优雅回退。顶栏提供语言切换入口。
2. **Cloudflare Pages 镜像**：新增 CF Pages 适配配置与 GitHub Actions 自动部署工作流，改善国内访问；未配置 secrets 时工作流自动跳过而不失败。
3. **开放 API**：新增 `/api/sites`、`/api/categories`，支持 `category` / `limit` / `q` 等筛选参数与缓存头，供第三方复用数据，并提供使用文档。
4. **数据贡献看板**：新增 `/contributors` 页面，展示由 git 历史统计的贡献者与当前待认领条目，数据由幂等脚本生成并入库。
5. **RSS 订阅**：新增 `/rss.xml`，输出最近新增工具的 RSS 2.0 源，并在页面提供发现链接与订阅入口。

## 已确认的实现取向

- i18n 自建轻量方案（字典 + 路由前缀），不引入运行时新依赖。
- 开放 API 采用 Route Handlers 并支持查询参数（需调整静态化策略以读取参数）。
- Cloudflare Pages 采用「接入 CI 自动部署」，secrets 由用户后续在仓库配置。
- 看板与 RSS 同时交付，不做周报归档页。

## 技术栈

沿用现有技术栈，仅新增部署工具链依赖：

- Next.js 15 App Router（全站 SSG / ISR，`revalidate = 3600`）+ React 19 + TypeScript
- Tailwind CSS + shadcn/ui（设计令牌 `glass-card` / `gradient-text` / `animate-aurora-shift`）
- Zod（数据校验）、tsx（脚本运行时）、vitest + jsdom + @testing-library/react（测试）
- 新增 devDependency：`@cloudflare/next-on-pages`（仅用于 CF Pages 构建适配，不进入运行时包）
- 部署：Vercel（主站）+ Cloudflare Pages（镜像）；GitHub Actions

## 实现方案

### 1. i18n：中文在根、英文在 `/en`

采用「静态前缀目录 + 共享页面组件」而非 `[locale]` 动态段 + middleware 重写：

- 中文页面保持在 `src/app/` 根（`page.tsx`、`site/[id]`、`category/[slug]`、`about`、`favorites`、`contributors`）；
- 英文页面位于 `src/app/en/`（同构目录，`en/page.tsx`、`en/site/[id]/page.tsx` 等）；
- 页面仅做「取 locale → 取字典 → 渲染共享组件」的薄封装，业务逻辑与 UI 抽到共享组件，避免两套实现漂移。

选择理由：无需 middleware 重写、不产生 `/zh` 与 `/` 的重复内容、canonical 与 sitemap 语义清晰；若将来需要第三种语言，可平滑迁移到 `[locale]` 动态段。

关键实现点：

- `src/i18n/dictionaries.ts`：`zh` / `en` 两份字典，类型由 `zh` 推导，保证英文缺失 key 在编译期报错；
- `src/i18n/config.ts`：`LOCALES`、`DEFAULT_LOCALE`、`localePath(locale, path?)`（生成带前缀的链接，中文不加前缀）；
- 根 `layout.tsx` 的 `html lang` 固定 `zh-CN`，新增 `src/app/en/layout.tsx` 输出 `lang="en"`（英文分支独立根布局）；
- metadata 双语：各页面 `generateMetadata` 按 locale 返回标题/描述，并配置 `alternates.languages`（zh/en）与 canonical；
- `sitemap.ts` 输出中英文两套 URL 并写入 `alternates.languages`；
- 数据字段按语言选取：站点名 `nameCn ?? name`（中文）/ `name`（英文），分类名 `name` / `nameEn`；站点简介暂无英文，英文站回退中文并在页面注明「简介暂为中文」，不新增 `descriptionEn` 字段（避免本轮改动数据模型）。

### 2. 开放 API：`force-static` 与查询参数的冲突处理（关键）

现有 `/api/search-index` 使用 `export const dynamic = 'force-static'`，**静态化后运行期读不到查询参数**。因此新增的两个 API 采用：

```ts
export const revalidate = 3600;          // ISR 缓存，而非构建期完全静态
export const runtime = 'edge';           // 兼容 Cloudflare Pages
export function GET(request: Request) {  // 从 request.url 解析查询参数
  const { searchParams } = new URL(request.url);
  ...
}
```

同时为兼容 CF Pages，把 `/api/search-index` 也补上 `runtime = 'edge'`（保持 `force-static`，无参数）。

接口约定：

- `/api/sites`：`category`、`tag`、`featured`、`q`、`limit`、`offset`，返回 `{ total, limit, offset, items }`；
- `/api/categories`：返回分类及条目数（可带 `slug` 参数查单个）；
- 统一：JSON 响应、`cache-control` 缓存头、非法参数降级为忽略并计入 `warnings`、404 与 400 的结构化错误体；
- 文档：`docs/api.md` 说明参数、示例与限流/缓存策略；`robots.ts` 保持 `disallow: ['/api/']`。

### 3. Cloudflare Pages 镜像

- 新增 `wrangler.toml`（`pages_build_output_dir = ".vercel/output/static"` 或按 next-on-pages 产物配置）与 `.dev.vars` 示例；
- `package.json` 增加 `pages:build` 脚本（`npx @cloudflare/next-on-pages@1`）；
- 新增 `.github/workflows/cloudflare-pages.yml`：监听 master 推送与 `workflow_dispatch`，当 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 缺失时**打印提示并优雅退出**（避免未配置时 CI 变红），存在时执行构建并用 `cloudflare/wrangler-action` 部署；
- 在 `docs/adr/` 补充部署 ADR，说明主站 Vercel + 镜像 CF Pages 的关系、域名与 canonical 策略（canonical 统一指向主站，避免 SEO 重复）。

### 4. 数据贡献看板

- 新增 `scripts/build-contributors.ts`：用 `git log --pretty=format:%an|%ae|%aI --numstat` 统计贡献者（提交数、首次/最近提交、主要涉及 `data/` 目录次数），生成 `src/data/contributors.generated.ts`（入库，支持 `--check`，与 `backfill-added-at` 同样的幂等约定）；
- 待认领条目复用 `audit-curation` 的判定逻辑（抽为共享函数 `collectUncurated()`，脚本与页面共用）；
- 新增 `/contributors`（中文）与 `/en/contributors`（英文）页面：贡献者卡片墙（GitHub 头像走外链，遵守「无追踪」原则不引入第三方统计）+ 待认领条目按分类统计；
- 隐私：默认只展示用户名（不含邮箱），头像使用 GitHub 头像 URL。

### 5. RSS

- 新增 `src/app/rss.xml/route.ts`（`force-static`，无参数）：按 `addedAt` 倒序取最近 20 条，输出 RSS 2.0（title / link / description / pubDate / guid），并包含 channel 级别的 `language` 与自描述链接；
- `layout.tsx` 增加 `<link rel="alternate" type="application/rss+xml">` 发现标签；
- footer 增加「RSS 订阅」入口；
- 核对 `robots.ts` 未屏蔽 `/rss.xml`（当前仅 disallow `/api/`）。

## 实现注意事项

- **force-static 冲突**：两个新 API 必须用 `revalidate` + `runtime='edge'` 组合，禁止写成 `force-static`（否则参数失效）；`search-index` 保持 `force-static` 但补 `runtime='edge'`。
- **双语一致性**：字典 key 由中文推导类型，英文缺失会在 typecheck 阶段报错；新增文案必须同时补两份。
- **链接生成**：所有内部跳转统一走 `localePath()`，禁止硬编码 `/en`，否则语言切换后跳转错乱。
- **sitemap 与 canonical**：中英文页面互为 `hreflang`，canonical 指向自身语言版本；CF 镜像域名不得作为 canonical。
- **数据模型**：本轮不新增数据字段（英文简介走回退），若后续要补 `descriptionEn` 需走三处同步 + 迁移脚本流程。
- **生成文件**：`contributors.generated.ts` 必须入库并提供 `--check`，CI 需纳入门禁（与 `backfill:added-at --check` 同级）。
- **无追踪约束**：贡献者头像等外链资源不得引入统计脚本；API 也不记录任何请求日志到第三方。
- **提交前校验**：`format:check` → `lint` → `typecheck` → `validate:data` → `test` → `backfill:added-at --check` → `build:contributors --check` → `build:search`（生成文件入库）→ `next build`（含中英文页面预渲染）。

## 架构设计

```mermaid
flowchart TB
  subgraph SSG["静态生成层"]
    A[getAllSites / getRecentSites] --> B[中文页面 /]
    A --> C[英文页面 /en]
    D[contributors.generated.ts] --> E[/contributors]
    F[addedAt 倒序] --> G[/rss.xml]
  end

  subgraph API["开放 API（edge runtime）"]
    H[/api/sites] --> I[筛选: category/tag/q/limit]
    J[/api/categories] --> K[分类 + 条目数]
    L[/api/search-index] --> M[搜索索引 force-static]
  end

  subgraph Deploy["部署"]
    N[Vercel 主站] --> O[canonical 主域]
    P[Cloudflare Pages 镜像] --> O
  end

  B --> H
  C --> H
```

数据分层与 SSG 策略保持不变，i18n 只影响「文案与字段选取」，API 与 RSS 为新增只读出口，均不引入服务端状态。

## 目录结构

```
项目根/
├── src/
│   ├── i18n/
│   │   ├── config.ts                     # [NEW] LOCALES / DEFAULT_LOCALE / localePath 链接生成
│   │   └── dictionaries.ts               # [NEW] 中英文字典（英文 key 由中文类型推导）
│   ├── app/
│   │   ├── layout.tsx                    # [MODIFY] 注入 RSS 发现标签、保持中文 lang
│   │   ├── page.tsx                      # [MODIFY] 接入 locale 与共享首页组件
│   │   ├── site/[id]/page.tsx            # [MODIFY] 按 locale 取名字段与 metadata
│   │   ├── category/[slug]/page.tsx      # [MODIFY] 同上
│   │   ├── about/page.tsx                # [MODIFY] 双语
│   │   ├── favorites/page.tsx            # [MODIFY] 双语
│   │   ├── contributors/page.tsx         # [NEW] 贡献看板（贡献者 + 待认领条目）
│   │   ├── en/
│   │   │   ├── layout.tsx                # [NEW] 英文根布局（lang="en"）
│   │   │   ├── page.tsx                  # [NEW] 英文首页
│   │   │   ├── site/[id]/page.tsx        # [NEW] 英文详情页
│   │   │   ├── category/[slug]/page.tsx  # [NEW] 英文分类页
│   │   │   ├── about/page.tsx            # [NEW] 英文关于页
│   │   │   └── contributors/page.tsx     # [NEW] 英文贡献看板
│   │   ├── api/
│   │   │   ├── sites/route.ts            # [NEW] /api/sites（筛选参数 + edge）
│   │   │   ├── categories/route.ts       # [NEW] /api/categories
│   │   │   └── search-index/route.ts     # [MODIFY] 补 runtime='edge'
│   │   ├── rss.xml/route.ts              # [NEW] RSS 2.0 输出
│   │   ├── sitemap.ts                    # [MODIFY] 输出中英文两套 URL + hreflang
│   │   └── robots.ts                     # [MODIFY] 确认不屏蔽 /rss.xml
│   ├── components/
│   │   ├── layout/
│   │   │   ├── site-header.tsx           # [MODIFY] 新增语言切换入口
│   │   │   └── site-footer.tsx           # [MODIFY] 新增 RSS 订阅入口
│   │   ├── site/
│   │   │   ├── site-meta-badges.tsx      # [MODIFY] 徽标文案按 locale 取
│   │   │   └── locale-switcher.tsx       # [NEW] 语言切换组件
│   │   └── search/search-dialog.tsx      # [MODIFY] 分类名与提示文案按 locale
│   ├── data/
│   │   └── contributors.generated.ts     # [NEW] 贡献者统计（脚本生成，入库）
│   └── lib/
│       ├── curation.ts                   # [NEW] 抽出的「待认领」判定（脚本与页面共用）
│       └── sites.ts                      # [MODIFY] 按 locale 取展示名/描述的辅助函数
├── scripts/
│   └── build-contributors.ts             # [NEW] git 历史统计贡献者（幂等 + --check）
├── .github/workflows/
│   └── cloudflare-pages.yml              # [NEW] CF Pages 部署（secrets 缺失则跳过）
├── wrangler.toml                         # [NEW] CF Pages 配置
├── docs/
│   ├── api.md                            # [NEW] 开放 API 使用文档
│   ├── adr/0005-i18n.md                  # [NEW] i18n 方案决策
│   ├── adr/0006-open-api.md              # [NEW] 开放 API 决策
│   ├── ROADMAP.md                        # [MODIFY] 勾选 M4
│   └── CHANGELOG.md                      # [MODIFY] 记录 v0.4.x
└── package.json                          # [MODIFY] 新增 pages:build / build:contributors 脚本
```

## 关键代码结构

```ts
// src/i18n/config.ts —— 语言与链接生成（内部跳转统一走这里）
export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

/** 生成带语言前缀的链接：中文不加前缀，英文加 /en */
export function localePath(locale: Locale, path = '/'): string;
```

```ts
// src/i18n/dictionaries.ts —— 字典（英文结构必须与中文 key 一致）
export const dictionaries = { zh, en } satisfies Record<Locale, typeof zh>;
export function getDictionary(locale: Locale): typeof zh;
```

```ts
// src/app/api/sites/route.ts —— 注意：不能用 force-static，否则读不到查询参数
export const revalidate = 3600;
export const runtime = 'edge';

export function GET(request: Request): Response;
// 支持 category / tag / featured / q / limit / offset，返回 { total, limit, offset, items, warnings }
```

## 设计定位

M4 只在现有「深色玻璃拟态 + 渐变光斑」设计语言内新增入口与页面，不引入新设计体系。新增元素（语言切换、RSS 入口、贡献看板）在间距、圆角、hover 抬升与发光描边上与 Hero、卡片网格保持一致。

## 分块设计

1. **语言切换入口（顶栏）**：位于搜索按钮与收藏入口之间，地球图标 + 当前语言短标识（中/EN），点击在 `/` 与 `/en` 当前路径间切换；使用 ghost 图标按钮与顶栏其他按钮同尺寸，带 aria-label 与可见焦点环。
2. **RSS 订阅入口（页脚）**：在页脚链接区新增一行「RSS 订阅」外链，橙色 RSS 小图标 + 文字，hover 转主色，与页脚既有链接样式一致。
3. **贡献看板页（`/contributors`）**：标题区（标题 + 说明 + 统计徽标：贡献者数、待认领数）；贡献者卡片墙使用与站点卡片相同的 glass-card 网格（1/2/3/4 列），每张含 GitHub 头像、用户名、提交数、最近提交日期；下方为「待认领条目」区块，按分类以列表行展示数量与进度条，引导点击去认领。
4. **英文站视觉**：与中文站完全一致，仅文案与字段替换；分类名使用 `nameEn`，站点名使用英文原名 `name`。

## 动效

沿用 hover 抬升 0.5、图标缩放、发光描边；语言切换为即时跳转无额外动画；全部动效在 `prefers-reduced-motion: reduce` 下自动降级（globals.css 已全局声明）。

## Agent Extensions

### Skill

- **project-structure**
  - Purpose: 确认 i18n 字典、`/en` 英文路由、API 路由、贡献看板页面与生成脚本的落位符合现有就近组织惯例
  - Expected outcome: 目录组织与既有 `src/lib`、`src/components/site`、`src/app` 约定一致，不引入新的目录范式

### SubAgent

- **code-explorer**
  - Purpose: 盘点全站硬编码中文文案的位置（页面、客户端组件、搜索面板分类映射、元信息徽标），以及所有内部 `Link` 跳转点，供 i18n 改造不遗漏
  - Expected outcome: 输出需翻译的文案清单与需改用 `localePath()` 的跳转点清单（含文件与行号）
