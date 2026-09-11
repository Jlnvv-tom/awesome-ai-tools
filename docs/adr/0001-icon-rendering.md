# ADR-0001：图标渲染采用 CDN 静态 SVG 而非 React 组件

- 状态：Accepted
- 日期：2026-09-07

## 背景

`@lobehub/icons` 提供 322+ 个 AI 品牌图标，既可 `import { OpenAI } from '@lobehub/icons'`
使用 React 组件，也可通过静态 SVG/PNG/WebP CDN 引用。

## 决策

构建期只取 `toc` **元数据**，运行时通过 CDN 静态 SVG 渲染。

## 理由

1. **包体**：全量静态导入 322 个组件会让客户端 JS 急剧膨胀，且破坏 code splitting；
2. **依赖**：`@lobehub/icons` 的 React 组件依赖 `@lobehub/ui` / `antd-style` / `antd`，与本项目 Tailwind + shadcn/ui 技术栈冲突；
3. **需求匹配**：我们只需要图标图像本身，不需要组件的交互能力；
4. **可缓存**：静态 SVG 由 CDN 长期缓存，跨页面复用。

## 代价与缓解

| 代价               | 缓解措施                                                                               |
| ------------------ | -------------------------------------------------------------------------------------- |
| 依赖外网可用性     | unpkg → GitHub raw → 品牌色首字母占位块，三级降级                                      |
| 首次访问有网络请求 | 懒加载 + 固定尺寸占位，避免 CLS                                                        |
| 无法随主题自动变色 | 已被 [ADR-0008](./0008-icon-theming.md) 解决：mono 变体改为 mask + `currentColor` 渲染 |

## 备选方案

- 全量本地化到 `public/icons/`（322 个文件）：零外部依赖，但仓库体积增大且需自行同步；
  后续若访问稳定性不达标，可切到此方案（脚本 `scripts/fetch-icons.ts` 预留）。
