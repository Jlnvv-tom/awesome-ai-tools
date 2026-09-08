# SDD 规范驱动开发总纲

> Specification-Driven Development（规范驱动开发）
> **规范先于代码，Schema 即契约，校验即门禁。**

## 1. 为什么用 SDD

本项目是「数据密集型 + 社区协作型」的导航站：

- 数据源来自上游 `@lobehub/icons`（322+ 个 AI 品牌），结构不受我们控制；
- 站点信息（官网 URL、分类、标签、简介）由社区贡献者以 PR 形式提交，质量参差；
- 页面完全静态生成（SSG），脏数据会直接发布到线上且难以回滚。

因此本项目把「**数据 schema**」作为全项目的单一事实来源：任何功能先从规格与 schema 出发，再写实现，最后用脚本与 CI 强制校验。

## 2. 五步工作流

```
① Spec（写文档）   →  ② Schema（写类型 + Zod）  →  ③ Implement（写代码）
                                                        ↓
                              ⑤ Ship（CI 门禁 + 发布） ← ④ Validate（脚本校验 + 测试）
```

| 步骤        | 产出物                                       | 负责人            | 完成标准                               |
| ----------- | -------------------------------------------- | ----------------- | -------------------------------------- |
| ① Spec      | `docs/spec/*.md` 对应章节                    | 提案人            | PR 中同时包含 spec 变更与实现          |
| ② Schema    | `src/types/site.ts` + `src/data/schema.ts`   | 提案人            | 类型与 Zod 一一对应，无 `any`          |
| ③ Implement | `src/lib/*`、`src/components/*`、`src/app/*` | 提案人            | 通过 `pnpm typecheck`                  |
| ④ Validate  | `scripts/validate-data.ts`、`*.test.ts`      | 提案人 + Reviewer | `pnpm validate:data`、`pnpm test` 全绿 |
| ⑤ Ship      | CI + Vercel 预览                             | Maintainer        | 预览链接可用后合并                     |

**硬性规则**：新增或修改字段时，若 `docs/spec/10-data-model.md` 未同步更新，Reviewer 应直接 Request Changes。

## 3. 规范文件的层次

```
docs/spec/
├── 00-overview.md      # 本文件：流程、术语、目录职责、变更流程
├── 10-data-model.md    # 数据规格：字段、约束、示例（权威）
├── 20-architecture.md  # 架构规格：数据流、渲染策略、性能预算
├── 30-ui-design.md     # UI 规格：设计令牌、组件清单、响应式与无障碍
└── 40-release.md       # 发布规格：版本号、发布流程、Changelog

docs/adr/               # ADR：不可逆的关键技术决策
```

## 4. 术语表

| 术语             | 含义                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| **IconMeta**     | 上游 `@lobehub/icons` 的图标元数据（id / title / color / group / 官网 URL），由脚本生成 |
| **Site**         | 导航站最终渲染的条目，由 IconMeta + 人工覆盖合并而成                                    |
| **SiteOverride** | 人工维护的覆盖项（分类、标签、中文名、简介、推荐位），存于 `data/sites/*.json`          |
| **Curated**      | 已被人工维护的条目，质量更高，优先展示                                                  |
| **Category**     | 站点分类（如 `chat` / `image`），定义在 `data/categories.json`                          |
| **Tag**          | 受控词表标签，定义在 `data/tags.json`                                                   |
| **Generated**    | 由脚本生成、禁止手改的文件，头部带 `// @generated`                                      |
| **Spec Change**  | 修改 `docs/spec/*` 或数据 schema 的变更，需要 Maintainer 复核                           |

## 5. 目录职责

| 路径                          | 职责                           | 是否可手改      |
| ----------------------------- | ------------------------------ | --------------- |
| `data/sites/*.json`           | 人工维护的站点覆盖数据         | ✅ 主要贡献入口 |
| `data/categories.json`        | 分类定义与自动归类关键词       | ✅              |
| `data/tags.json`              | 标签受控词表                   | ✅              |
| `src/data/icons.generated.ts` | 图标元数据（脚本生成）         | ❌              |
| `src/types/site.ts`           | TypeScript 类型契约            | ✅ 需同步 spec  |
| `src/data/schema.ts`          | Zod 运行时校验                 | ✅ 需同步 spec  |
| `scripts/**`                  | 同步 / 校验 / 索引构建脚本     | ✅              |
| `src/lib/**`                  | 数据查询、图标 URL、搜索、SEO  | ✅              |
| `src/components/**`           | 跨路由复用组件                 | ✅              |
| `src/app/**`                  | 路由页面，页面私有组件就近放置 | ✅              |

## 6. 变更流程（Spec Change）

1. 开 Issue 说明动机（推荐用 `feature_request` 模板）；
2. 提 PR，标题以 `feat:` / `refactor:` 开头，描述中注明 **影响字段** 与 **迁移方式**；
3. PR 必须包含：spec 文档变更 + 类型变更 + Zod 变更 + 受影响的测试；
4. CI 全绿 + 至少一位 Maintainer（见 `.github/CODEOWNERS`）Approve 后合并；
5. 合并后由 Maintainer 在 `CHANGELOG.md` 中记录。

## 7. 本地质量门禁

```bash
pnpm typecheck        # TypeScript 全量类型检查
pnpm lint             # ESLint
pnpm validate:data    # 数据 schema 与一致性校验（CI 强制）
pnpm test             # 单元测试（schema / lib / 组件）
pnpm build            # 生产构建，SSG 全量预渲染
pnpm format:check     # 格式检查
```

提交时由 Husky 自动执行 `lint-staged`（含 `validate:data`），commit message 需符合
[Conventional Commits](https://www.conventionalcommits.org/)，并额外支持 `data:` 类型（纯数据变更）。
