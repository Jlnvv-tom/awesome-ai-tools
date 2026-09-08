# UI 设计规格

## 1. 视觉方向

**Dark Glassmorphism + Brand-color Glow**：深空底色 + 大范围柔和光斑渐变 + 半透明毛玻璃卡片 + 1px 内发光描边；
图标以品牌色作为悬停光晕来源。整体克制、高级，动效 150–250ms ease-out。

## 2. 设计令牌（CSS 变量，定义在 `src/app/globals.css`）

| 令牌                                        | 暗色（默认）                               | 亮色                    | 用途      |
| ------------------------------------------- | ------------------------------------------ | ----------------------- | --------- |
| `--background`                              | `240 20% 5%` (#0A0A0F)                     | `220 22% 97%` (#F7F8FA) | 页面底色  |
| `--card`                                    | `240 18% 9%` (#12121A)                     | `0 0% 100%`             | 卡片底色  |
| `--foreground`                              | `240 20% 96%` (#F5F5F7)                    | `240 13% 12%` (#1A1A1F) | 主文本    |
| `--muted-foreground`                        | `240 9% 66%` (#A0A0B0)                     | `240 6% 40%`            | 次要文本  |
| `--primary`                                 | `249 92% 65%` (#6E56F8)                    | 同                      | 主品牌色  |
| `--primary-soft`                            | `247 100% 74%` (#8B7BFF)                   | 同                      | 渐变副色  |
| `--accent`                                  | `177 100% 42%` (#00D4C8)                   | 同                      | 强调/高亮 |
| `--border`                                  | `240 12% 18%`                              | `240 12% 88%`           | 描边      |
| `--glass`                                   | `0 0% 100% / 0.04`                         | `240 20% 100% / 0.6`    | 玻璃层    |
| `--success` / `--warning` / `--destructive` | `142 71% 45%` / `38 92% 50%` / `0 84% 60%` | 同                      | 状态色    |

**禁止**在组件内硬编码颜色值，一律使用令牌或 `bg-card` / `text-muted-foreground` 等语义类。

## 3. 字体

- 字体族：`-apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Segoe UI, Roboto, sans-serif`
- 标题：40px / 700；副标题：20px / 600；正文：14px / 400
- 数字与统计使用等宽字体（`font-mono`）增强对比

## 4. 组件清单

| 组件             | 路径                                        | 职责                                                |
| ---------------- | ------------------------------------------- | --------------------------------------------------- |
| `Button`         | `src/components/ui/button.tsx`              | shadcn 基础按钮（default / outline / ghost / glow） |
| `Card`           | `src/components/ui/card.tsx`                | 玻璃卡片容器                                        |
| `Input`          | `src/components/ui/input.tsx`               | 搜索输入                                            |
| `Badge`          | `src/components/ui/badge.tsx`               | 标签 / 分类徽章                                     |
| `Dialog`         | `src/components/ui/dialog.tsx`              | ⌘K 搜索弹层                                         |
| `SiteHeader`     | `src/components/layout/site-header.tsx`     | 固定顶部导航（吸顶毛玻璃）                          |
| `SiteFooter`     | `src/components/layout/site-footer.tsx`     | 页脚：开源信息 / 贡献入口 / 许可                    |
| `ThemeToggle`    | `src/components/layout/theme-toggle.tsx`    | 亮暗切换                                            |
| `BrandIcon`      | `src/components/site/brand-icon.tsx`        | 品牌图标（CDN + 降级占位）                          |
| `SiteCard`       | `src/components/site/site-card.tsx`         | 站点卡片                                            |
| `SiteGrid`       | `src/components/site/site-grid.tsx`         | 响应式卡片网格                                      |
| `CategoryNav`    | `src/components/site/category-nav.tsx`      | 分类锚点导航                                        |
| `SearchDialog`   | `src/components/search/search-dialog.tsx`   | ⌘K 搜索                                             |
| `SearchProvider` | `src/components/search/search-provider.tsx` | 客户端检索状态                                      |

## 5. 响应式断点

| 断点         | 布局                                   |
| ------------ | -------------------------------------- |
| `< 640px`    | 单列；导航折叠；搜索入口为图标         |
| `640–1024px` | 2–3 列卡片网格                         |
| `> 1280px`   | 4–6 列卡片网格；容器最大宽 1280px 居中 |

顶部导航使用 `fixed`，主内容区以 `pt-16`（64px）避让。

## 6. 无障碍

- 对比度满足 WCAG AA；
- 外链卡片为可聚焦 `<a>`，支持 Tab / Enter，带 `aria-label`；
- 图标为装饰性内容时 `aria-hidden`，站点名始终有文本可见；
- `prefers-reduced-motion: reduce` 时关闭所有动画与光斑位移；
- 搜索弹层支持 `Esc` 关闭、`↑/↓` 选择、`Enter` 打开。

## 7. 交互细节

- 卡片 hover：上浮 2px + 品牌色光晕 + 外链图标浮现（150ms ease-out）；
- 搜索框聚焦：主色发光描边；
- 图片全部 `loading="lazy"`，显式尺寸，避免布局抖动；
- 指针样式：可点击 `cursor-pointer`，禁用态 `cursor-not-allowed`。
