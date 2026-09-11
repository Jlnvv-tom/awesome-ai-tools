# ADR 0005：中英文双语的实现策略

- 状态：已接受
- 日期：2026-09-11
- 关联：`src/i18n/`、`src/app/(zh)/`、`src/app/en/`

## 背景

站点需要中英双语。项目约束：纯静态（SSG/ISR）、不引入新的运行时依赖、SEO 需要清晰
的 canonical 与 hreflang、数据层（322 条站点）不适合为翻译而改动模型。

可选方案：

1. `[locale]` 动态段 + middleware 重写 / 重定向（业界常见）；
2. 引入 `next-intl` 等库；
3. 静态前缀目录 + 共享页面组件（中文在根路径、英文在 `/en`）。

## 决策

采用**方案 3**：

- 中文页面位于 `src/app/(zh)/`（路由组，不产生路径前缀，即 `/`）；
- 英文页面位于 `src/app/en/`（`/en/*`）；
- 页面文件只做薄封装（取 locale → 渲染共享视图），UI 与业务逻辑放在 `src/app/*-view.tsx`
  与 `src/components/*`，两种语言复用同一套实现；
- 文案集中在 `src/i18n/dictionaries.ts`，英文结构由中文类型推导
  （`const en: typeof zh`），缺失 key 会在 `typecheck` 阶段暴露；
- 内部链接统一走 `localePath(locale, path)`，禁止硬编码 `/en`；
- 站点名按语言取（中文 `nameCn ?? name`、英文 `name`），分类名取 `name` / `nameEn`；
- 站点简介暂无英文，英文站回退中文原文，不新增数据字段（避免本轮改动数据模型）。

根布局只声明 `<html>`（Next.js 限制），各语言分支通过 `HtmlLang` 组件在挂载后
把 `document.documentElement.lang` 纠正为对应语言。

## 后果

### 正面

- 不需要 middleware，路由与缓存语义简单，`/` 与 `/en` 各自独立可缓存；
- 中文保持在根路径，不产生 `/zh` 这类重复内容；
- 双语共用组件，避免两套实现漂移；
- 未来若新增第三种语言，可平滑迁移到 `[locale]` 动态段。

### 负面

- 每个页面需要两份薄封装文件（成本低，且逻辑不重复）；
- 首屏 HTML 的 `lang` 固定为 `zh-CN`，英文页在 hydration 后才纠正，
  对极端场景（禁用 JS 的读屏用户）不够精确；
- 数据层的中文简介会出现在英文站，属于已知取舍（已在看板/详情页说明）。
