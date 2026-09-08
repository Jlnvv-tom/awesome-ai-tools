# 架构规格

## 1. 技术栈

| 层   | 选型                                           | 版本约束           |
| ---- | ---------------------------------------------- | ------------------ |
| 框架 | Next.js App Router                             | 15.x，React 19     |
| 语言 | TypeScript strict                              | 5.x                |
| 样式 | Tailwind CSS + shadcn/ui（CSS 变量令牌）       | tailwindcss 3.4.17 |
| 图标 | `@lobehub/icons`（构建期元数据）+ 静态 SVG CDN | 1.x                |
| 搜索 | Fuse.js                                        | 7.x                |
| 校验 | Zod                                            | 3.x                |
| 测试 | Vitest + Testing Library                       | 2.x                |
| 部署 | Vercel（PR 预览 + 生产）                       | —                  |

## 2. 数据流

```
┌────────────────────────┐
│ @lobehub/icons toc     │  （上游权威：322 条，含官网 URL、品牌色、分组）
└───────────┬────────────┘
            │ scripts/sync-icons.ts（remote 优先，local 兜底）
            ▼
   src/data/icons.generated.ts   ← 提交进仓库，构建不依赖网络
            │
            │  lib/sites.ts  left join
            ▼
┌────────────────────────┐
│ data/sites/*.json      │  （人工覆盖：分类/标签/中文名/简介/精选）
└───────────┬────────────┘
            ▼
        Site[]（322+）
            ├─→ app/page.tsx            首页 SSG
            ├─→ app/category/[slug]     分类页 SSG
            ├─→ app/site/[id]           详情页 SSG（generateStaticParams）
            ├─→ app/sitemap.ts / robots.ts
            └─→ 搜索索引（客户端按需加载）
```

## 3. 渲染策略

- **首页**：SSG，`revalidate = 3600`，精选 + 全部分类网格；
- **分类页**：SSG + `generateStaticParams`，按分类 slug 预渲染；
- **详情页**：SSG + `generateStaticParams`，每页独立 metadata 与 JSON-LD；
- **搜索**：纯客户端，索引在客户端按需获取（`/search-index.json` Route Handler），不进入首屏 JS。

## 4. 图标渲染策略（见 ADR-0001）

运行时通过 CDN 静态 SVG 渲染，不打包 322 个 React 组件：

```
https://unpkg.com/@lobehub/icons-static-svg@latest/icons/<id>.svg
        │ 失败降级
        ▼
https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-svg/icons/<id>.svg
        │ 失败降级
        ▼
品牌色首字母占位块（内联 SVG，零网络依赖）
```

## 5. 性能预算

| 指标                | 目标                            |
| ------------------- | ------------------------------- |
| 首页首屏 JS（gzip） | ≤ 180 KB                        |
| LCP                 | ≤ 2.0s（4G）                    |
| CLS                 | ≤ 0.05                          |
| 详情页数量          | 全量预渲染，单页 HTML ≤ 30 KB   |
| 图标请求            | 懒加载 + 固定尺寸占位，禁止 CLS |

约束手段：图标 `loading="lazy"` 且显式 `width/height`；搜索索引按需加载；
长列表增量渲染；禁止在客户端引入图标 React 组件。

## 6. 错误处理与可观测性

- 脚本统一使用 `scripts/utils/log.ts`，仅输出 warn/error 与汇总统计；
- 图标加载失败由 `<BrandIcon>` 的 `onError` 兜底为品牌色占位块，不影响布局；
- 数据缺失（上游无 `desc`）的条目在校验阶段以 warn 提示，并在详情页标注「待补充官网」。

## 7. 安全

- 仓库内不含任何密钥 / Token；
- 外链统一 `rel="noopener noreferrer"` + `target="_blank"`；
- 不引入任何第三方统计脚本（如需，走 Vercel Analytics 且默认关闭）。
