# Awesome AI Tool

> 收录 **322 个 AI 工具官网** 的开源导航站 —— 一个入口，直达全部官网。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087ea4)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Data: LobeHub Icons](https://img.shields.io/badge/icons-LobeHub%20Icons-6e56f8)](https://lobehub.com/icons)

你是否也经历过：想找一个「能做 XX 的 AI 工具」，却在搜索结果、公众号推文和收藏夹之间来回横跳？
**Awesome AI Tool** 把散落各处的 AI 工具整理成一张清晰的地图 —— 按场景分类、支持关键词即时检索、
点击直达官网，不套壳、不跳转、不追踪。

- 图标与品牌数据来自官方的 [LobeHub Icons](https://lobehub.com/icons)，覆盖 **322 个** AI 模型、服务商与应用；
- 视觉与交互参考 [ui.lobehub.com](https://ui.lobehub.com/) 的设计语言，暗色玻璃拟态 + 品牌色微光；
- 全站静态生成（SSG），首屏 JS 约 126 KB，打开即用；
- 数据即代码，新增一个工具 = 改一个 JSON 文件。

---

## 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [技术栈](#技术栈)
- [数据模型](#数据模型)
- [目录结构](#目录结构)
- [规范驱动开发（SDD）](#规范驱动开发sdd)
- [参与贡献](#参与贡献)
- [路线图](#路线图)
- [许可证与版权](#许可证与版权)

---

## 功能特性

| 特性               | 说明                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **全量收录**       | 以 LobeHub Icons 的 `toc` 元数据为权威来源，322 个 AI 品牌全部收录，官网地址随上游同步      |
| **分类浏览**       | 10 个场景分类（对话 / 编程 / 图像 / 视频 / Agent / 搜索 / 写作 / 开源 / 云基础设施 / 模型） |
| **即时检索**       | ⌘K 全局搜索 + 首页实时筛选，支持名称、中文名、标签与简介匹配                                |
| **站点详情**       | 每个工具有独立详情页：官网直达、品牌图标、标签、相关推荐与结构化数据                        |
| **品牌图标**       | 静态 SVG CDN 渲染，unpkg → GitHub → 品牌色占位块三级降级，永不空白                          |
| **SEO 友好**       | 全站 SSG、独立 metadata、sitemap、robots、OG 图与 JSON-LD 结构化数据                        |
| **响应式与无障碍** | 移动单列到桌面六列自适应，WCAG AA 对比度，完整键盘可达                                      |

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/awesome-ai-tool/awesome-ai-tool.git
cd awesome-ai-tool

# 2. 安装依赖（推荐 pnpm 10+）
pnpm install

# 3. 启动开发服务器 → http://localhost:3000
pnpm dev
```

常用命令：

| 命令                        | 作用                                                     |
| --------------------------- | -------------------------------------------------------- |
| `pnpm dev`                  | 本地开发                                                 |
| `pnpm build`                | 生产构建（全量预渲染 340+ 页面）                         |
| `pnpm sync:icons`           | 从上游同步图标元数据，生成 `src/data/icons.generated.ts` |
| `pnpm validate:data`        | 校验数据与 schema（CI 强制门禁）                         |
| `pnpm build:search`         | 生成客户端搜索索引                                       |
| `pnpm test`                 | 运行单元测试                                             |
| `pnpm typecheck`            | TypeScript 类型检查                                      |
| `pnpm lint` / `pnpm format` | 代码检查与格式化                                         |

> 需要 Node.js ≥ 20.11。仓库内不含任何密钥，克隆即可运行。

## 技术栈

| 层    | 选型                                                   |
| ----- | ------------------------------------------------------ |
| 框架  | Next.js 15（App Router）+ React 19 + TypeScript strict |
| 样式  | Tailwind CSS 3.4 + shadcn/ui（CSS 变量设计令牌）       |
| 图标  | `@lobehub/icons` 元数据 + 静态 SVG CDN                 |
| 检索  | Fuse.js（索引按需加载，不进首屏 JS）                   |
| 校验  | Zod（schema 即规范）                                   |
| 质量  | ESLint、Prettier、Husky、Commitlint、Vitest            |
| CI/CD | GitHub Actions + Vercel（PR 预览 + 生产）              |

## 数据模型

数据分两层，由 `src/lib/sites.ts` 合并（详见 [`docs/spec/10-data-model.md`](./docs/spec/10-data-model.md)）：

```
@lobehub/icons toc ──scripts/sync-icons.ts──→ src/data/icons.generated.ts  （自动生成，勿手改）
                                                      │
                                                      ├── left join ──→ Site[]
data/sites/*.json（人工维护的覆盖项）─────────────────┘
```

新增一个工具只需在对应分类文件里加一条：

```json
{
  "iconId": "OpenAI",
  "nameCn": "OpenAI ChatGPT",
  "category": "chat",
  "tags": ["chatbot", "llm", "api"],
  "description": "GPT 系列模型的创造者，提供 ChatGPT 与 OpenAI API 服务。",
  "featured": true,
  "order": 1
}
```

字段规范、校验规则与示例见 [数据模型规格](./docs/spec/10-data-model.md)。

## 目录结构

```
├── data/                     # 人工维护的数据（主要贡献入口）
│   ├── categories.json       # 分类定义与自动归类关键词
│   ├── tags.json             # 标签受控词表
│   └── sites/*.json          # 按分类分片的站点覆盖项
├── docs/
│   ├── spec/                 # SDD 规范：数据 / 架构 / UI / 发布
│   └── adr/                  # 关键架构决策记录
├── scripts/                  # 图标同步、数据校验、索引构建
└── src/
    ├── app/                  # 路由页面（页面私有组件就近放置）
    ├── components/           # 跨路由复用组件（ui / layout / site / search）
    ├── data/                 # schema 与生成数据
    ├── lib/                  # 站点查询、图标、搜索、SEO
    └── types/site.ts         # 全站数据契约
```

## 规范驱动开发（SDD）

本项目采用 **Specification-Driven Development**：规范先于代码，schema 即契约，校验即门禁。

```
① Spec（docs/spec/*.md） → ② Schema（types + Zod） → ③ Implement
                                                        ↓
                        ⑤ Ship（CI 门禁 + 发布） ← ④ Validate（脚本 + 测试）
```

- 任何字段变更必须同步 `docs/spec/10-data-model.md`、`src/types/site.ts`、`src/data/schema.ts`；
- `pnpm validate:data` 是 CI 强制门禁，脏数据无法合入；
- 关键决策以 ADR 形式记录在 [`docs/adr/`](./docs/adr/)（图标渲染、数据分层、部署方案）。

完整的流程、术语表与变更流程见 [`docs/spec/00-overview.md`](./docs/spec/00-overview.md)。

## 参与贡献

我们欢迎任何形式的贡献，尤其是**补充与修正站点信息**（零编程门槛）：

1. 阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)；
2. 使用 [新增站点 Issue 模板](https://github.com/awesome-ai-tool/awesome-ai-tool/issues/new?template=new-site.yml) 或直接改 `data/sites/*.json` 提 PR；
3. PR 会自动生成 Vercel 预览链接，校验通过后由 Maintainer 合并。

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/)，数据类变更推荐使用 `data:` 前缀。

## 路线图

近期计划包括：Cloudflare Pages 镜像部署、多语言（中/英）、工具热度榜与收藏夹（本地存储）、
数据贡献看板。完整规划见 [ROADMAP.md](./ROADMAP.md)。

## 许可证与版权

- 代码与数据：[MIT License](./LICENSE)
- 品牌图标与商标：归各自权利主体所有，本项目仅作导航引用，不主张任何权利。若你是权利人且不希望被收录，请通过 [Issue](https://github.com/awesome-ai-tool/awesome-ai-tool/issues/new?template=bug_report.yml) 联系我们，我们会在 48 小时内处理。
- 图标数据源：[lobehub/lobe-icons](https://github.com/lobehub/lobe-icons)（MIT）
