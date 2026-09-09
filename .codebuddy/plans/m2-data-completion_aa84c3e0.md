---
name: m2-data-completion
overview: 完成 ROADMAP 中 M2 · 数据完善（v0.2.x）的 5 项迭代：待认领清单脚本 + AI 补全热门条目中文名与简介、标签同义收敛、官网可达性巡检脚本与每周 CI、分类关键词优化、「本周新增工具」区块（新增 addedAt 字段并同步 SDD 三处定义）。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - 玻璃拟态
    - 深色渐变
    - 极简克制
    - 微动效
  fontSystem:
    fontFamily: PingFang SC
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
  - id: extend-addedat-field
    content: 扩展 addedAt 数据模型并新增回填脚本：同步 types、Zod 与 docs/spec，生成 src/data/added-at.generated.ts，合并进 getAllSites 并补单测
    status: completed
  - id: audit-scripts
    content: 使用 [subagent:code-explorer] 统计待补条目与标签分布，新增 audit-curation、audit-categories、audit-tags 三个审计脚本
    status: completed
    dependencies:
      - extend-addedat-field
  - id: tag-consolidation
    content: 依据审计结果收敛 data/tags.json 同义标签，批量更新 data/sites/*.json 的标签并跑 validate:data
    status: completed
    dependencies:
      - audit-scripts
  - id: backfill-popular-sites
    content: 依据待认领清单，为 50–80 条热门条目补全中文名、简介与标签，写入对应分类分片并校验
    status: completed
    dependencies:
      - tag-consolidation
  - id: link-check-ci
    content: 新增 scripts/check-links.ts 巡检脚本与每周定时 workflow link-check.yml，输出报告且不阻断构建
    status: completed
  - id: category-keyword-tuning
    content: 依据归类审计补充 data/categories.json 的 keywords，并回归对比分类分布确认准确率提升
    status: completed
    dependencies:
      - audit-scripts
  - id: home-new-arrivals
    content: 新增 getRecentSites 与首页「本周新增工具」服务端区块组件，复用 SiteCard 并处理空态降级
    status: completed
    dependencies:
      - extend-addedat-field
  - id: final-validation-docs
    content: 跑全量校验与 build:search，同步 ROADMAP 勾选、CHANGELOG 与必要的 ADR
    status: completed
    dependencies:
      - extend-addedat-field
      - audit-scripts
      - tag-consolidation
      - backfill-popular-sites
      - link-check-ci
      - category-keyword-tuning
      - home-new-arrivals
---

## 产品概述

完成 ROADMAP 中「M2 · 数据完善（v0.2.x）」的 5 项迭代，目标是让「未人工维护」的条目数量持续下降，并让数据质量可度量、可巡检、可持续贡献。

现状：图标元数据 322 条，`data/sites/*.json` 已人工维护 159 条，待补 163 条（与路线图的 ~160 吻合）。

## 核心特性

1. **待认领清单与进度审计**：新增脚本按分类输出未维护条目清单（无中文名、简介仍为派生兜底文案），并输出全站维护进度统计，供社区按分类认领。
2. **热门条目内容补全**：依据清单，为知名度较高的 50–80 个条目补全中文名、简介与标签，其余留待社区认领。
3. **标签体系收敛**：统计标签使用频次，识别同义/近似标签并合并，同步更新受控词表与既有条目数据。
4. **官网可达性巡检**：新增巡检脚本检测 404 / 重定向 / 超时，并接入每周定时 CI，只出报告、不阻断构建。
5. **分类关键词优化**：输出疑似错分条目（兜底归类、仅命中泛化词）清单，据此补充分类关键词并回归验证归类分布。
6. **首页「本周新增工具」区块**：新增收录时间维度，展示最近 7 天新增条目，时间窗口内无新增时降级展示「最近收录」。

## 已确认的实现取向

- 内容补全采用「工具 + 人工/AI 补热门」混合方式，不一次性全量生成。
- 收录时间通过新增 `addedAt` 字段实现，并同步类型、Zod 与数据模型规格三处定义；历史条目按 git 回填，新条目由贡献者/同步脚本填写。
- 巡检脚本以「本地可运行 + 每周定时 CI 出报告」形态交付，不阻断构建。
- 标签收敛由执行方分析后直接改写词表与条目数据，并同步校验。

## 技术栈

沿用项目现有技术栈，不引入新依赖：

- Next.js 15 App Router（SSG，`revalidate = 3600`）+ React 19 + TypeScript
- Tailwind CSS + shadcn/ui（现有设计令牌：`glass-card` / `gradient-text` / `animate-aurora-shift`）
- Zod（`src/data/schema.ts` 运行时校验）、tsx（脚本运行时）、vitest（单测）
- pnpm 11.21.0（由 `packageManager` 决定）、Node 22、GitHub Actions

## 实现方案

### 1. 收录时间字段 `addedAt`（SDD 三处同步）

核心矛盾：`curated: Boolean(override)`。若为 163 条未维护条目新建「只含 iconId + addedAt」的覆盖项，会将其误判为已人工维护，直接破坏 M2 的统计目标。

**方案**：`addedAt` 不写入覆盖项来「撑」条目，而是落在独立的生成文件 `src/data/added-at.generated.ts`（`Record<iconId, 'YYYY-MM-DD'>`，由脚本按 git 历史生成并入库）。合并优先级：

```
override.addedAt ?? ADDED_AT[iconId] ?? 兜底日期（仓库首个 commit 日期）
```

`curated` 语义保持不变（仅由是否存在覆盖项决定），已维护条目仍可在覆盖项中用 `addedAt` 精确覆盖。

回填算法（`scripts/backfill-added-at.ts`）：

- 覆盖项条目：`git log --diff-filter=A --format=%aI -- data/sites/<分片>.json` 定位该 iconId 首次出现日期（需在该提交中确认含此 iconId，避免同批误判）；
- 从未进入覆盖项的条目：取 `src/data/icons.generated.ts` 首次包含该 iconId 的提交日期；
- 均缺失：回退仓库首个 commit 日期。
- 产物为生成文件，入库；脚本可重复执行且结果稳定（同输入同输出）。

**必须同步三处**：`src/types/site.ts`（`Site.addedAt` / `SiteOverride.addedAt`）、`src/data/schema.ts`（`SiteOverrideSchema` 为 `.strict()`，漏改会导致既有数据校验失败）、`docs/spec/10-data-model.md`（第 3/4 节字段表 + 第 7 节校验规则）。

### 2. 标签收敛

`scripts/audit-tags.ts` 统计每个标签在覆盖项中的使用频次，输出：零使用标签、仅 1 次使用的低频标签、疑似同义组（如 `directory`/`aggregator`、`ai-search`/`search-engine`、`tts`/`speech-to-text`、`voice`/`audio`、`notes`/`notebook` 等，最终以实际数据分布判定）。

执行顺序：产出映射表 → 改写 `data/tags.json` 词表 → 批量替换 `data/sites/*.json` 中的旧标签（保持数组去重、顺序稳定）→ 跑校验与测试。映射表落盘到 `docs/` 便于追溯。

### 3. 审计脚本（待认领清单 + 归类审计）

- `scripts/audit-curation.ts`：未维护判定 = `curated === false` 或 `description` 仍为 `deriveDescription()` 兜底文案；按分类分组输出图标 id、名称、官网，并输出总条目 / 已维护 / 待认领 / 各分类完成率。
- `scripts/audit-categories.ts`：输出「走 group 兜底归类」与「仅命中泛化关键词（model/cloud/image 等）」的疑似错分条目，作为补充 `data/categories.json` keywords 的依据；改关键词后对比分类分布做回归，防止既有正确归类被改坏。

两个脚本统一复用 `scripts/utils/log.ts` 的 logger（只输出 warn/error/汇总，禁止打印整表），支持 `--json` 输出。

### 4. 官网可达性巡检

`scripts/check-links.ts`：

- 并发池 8（322 个站点，单请求超时 8s，整体约 1 分钟内完成）；
- `HEAD` 优先，405/501 时回退 `GET`；自定义 User-Agent；单次重试；
- 结果分类：`ok` / `redirect`（记录 301/302/307/308 的 Location）/ `not_found` / `blocked`（403/429 反爬，归为「需人工确认」而非死链）/ `server_error` / `timeout` / `dns_error`；
- **退出码始终为 0**，不阻断 CI；支持 `--limit` / `--category` / `--json`；报告写入文件。
- 新增 `.github/workflows/link-check.yml`（复用 `sync-icons.yml` 结构：每周定时 + `workflow_dispatch`，与同步任务错开时间），报告以 artifact 上传。

### 5. 首页「本周新增工具」区块

- 数据层：`src/lib/sites.ts` 新增 `getRecentSites({ days = 7, limit })`，按 `addedAt` 倒序、同日按 `order`/名称排序。
- 区块为**服务端组件**（放在 Hero 与 Explorer 之间），避免受 `HomeExplorer` 客户端筛选状态影响；复用 `SiteCard` 与现有响应式网格（`1 / 2 / 3 / 4` 列）。
- 降级：最近 7 天无新增时，展示「最近收录」的 N 条；`addedAt` 全部缺失时不渲染区块。
- SSG 时间基准：区块在构建/ISR 时计算，配合现有 `revalidate = 3600`。
- 单测：`src/lib/sites.test.ts` 补充 `getRecentSites` 与 `addedAt` 合并优先级用例。

### 6. 数据管线

```mermaid
flowchart LR
  A[icons.generated.ts<br/>322 条, 生成] --> C[getAllSites 合并]
  B[data/sites/*.json<br/>人工覆盖项] --> C
  D[added-at.generated.ts<br/>git 历史回填, 生成] --> C
  C --> E[Site[]]
  E --> F[首页 / 分类页 / 详情页]
  E --> G[search-index.generated.ts]
  E --> H[审计与巡检脚本]
```

## 实现注意事项

- 生成文件（`icons.generated.ts` / `search-index.generated.ts` / 新增的 `added-at.generated.ts`）**必须入库**；任何数据改动后执行 `pnpm build:search`，CI 有 `git diff --exit-code` 门禁。
- `icons.generated.ts` 由 `sync:icons` 生成，禁止手改。
- 补全文案约束：`nameCn` ≤ 30 字符、`description` 10–80 字符且陈述事实、禁止营销话术与「最/第一」等绝对表述；`tags` 必须取自收敛后的受控词表且 ≤ 8 个。
- 新增分类关键词需防止跨分类冲突，改动后对比分类分布回归验证。
- 新增覆盖项只写入对应 `data/sites/<category>.json` 分片，若新增分片需同步登记到 `src/data/registry.ts`。
- 脚本日志遵循现有约定：只用 `logger.warn/error/summary`，禁止打印整张数据表。
- 提交前全量校验：`format:check` → `lint` → `typecheck` → `validate:data` → `test` → `build:search`。

## 目录结构

```
项目根/
├── src/
│   ├── types/site.ts                 # [MODIFY] 新增 Site.addedAt 与 SiteOverride.addedAt（SDD 类型层）
│   ├── data/
│   │   ├── schema.ts                 # [MODIFY] SiteOverrideSchema 新增 addedAt（strict 模式必须同步）
│   │   ├── registry.ts               # [MODIFY] 导出 ADDED_AT 映射（新增生成文件需在注册表中登记）
│   │   ├── added-at.generated.ts     # [NEW] 收录时间映射（Record<iconId, 日期>），由脚本生成并入库
│   │   └── search-index.generated.ts # [MODIFY] 数据改动后由 build:search 重新生成
│   ├── lib/
│   │   ├── sites.ts                  # [MODIFY] 合并 addedAt、新增 getRecentSites()
│   │   └── sites.test.ts             # [MODIFY] 补充 addedAt 合并与 getRecentSites 单测
│   └── app/
│       ├── page.tsx                  # [MODIFY] 插入「本周新增工具」区块
│       └── home-new-arrivals.tsx     # [NEW] 服务端区块组件：最近新增条目 + 日期徽标 + 空态降级
├── scripts/
│   ├── backfill-added-at.ts          # [NEW] 按 git 历史回填收录时间，生成 added-at.generated.ts
│   ├── audit-curation.ts             # [NEW] 待认领清单与维护进度统计（按分类，支持 --json）
│   ├── audit-categories.ts           # [NEW] 归类审计：兜底归类 / 泛化关键词命中清单
│   ├── audit-tags.ts                 # [NEW] 标签频次与同义分析，输出映射与建议
│   └── check-links.ts                # [NEW] 官网可达性巡检（并发/超时/重定向/403 归类，退出码 0）
├── data/
│   ├── tags.json                     # [MODIFY] 收敛同义标签、清理零使用标签
│   ├── categories.json               # [MODIFY] 依据归类审计补充 keywords
│   └── sites/*.json                  # [MODIFY] 批量更新标签；补全 50–80 条热门条目中文名/简介/标签
├── .github/workflows/
│   └── link-check.yml                # [NEW] 每周定时巡检，报告作为 artifact 上传，不阻断构建
└── docs/
    ├── spec/10-data-model.md         # [MODIFY] 新增 addedAt 字段定义与校验规则（权威定义必须同步）
    ├── adr/                          # [NEW 可选] 收录时间字段的 Spec Change 决策记录
    └── ROADMAP.md / CHANGELOG.md     # [MODIFY] 勾选 M2 完成项、记录 v0.2.x 变更
```

## 关键代码结构

```ts
// src/types/site.ts —— 新增字段（其余字段保持不变）
export interface Site {
  // ...既有字段
  /** 收录日期 YYYY-MM-DD；来自覆盖项或回填映射，均缺失时取项目初始化日期 */
  addedAt: string;
}

export interface SiteOverride {
  iconId: string;
  // ...既有可选字段
  /** 覆盖自动回填的收录日期（新收录条目由贡献者/同步脚本填写） */
  addedAt?: string;
}
```

```ts
// src/lib/sites.ts —— 新增查询（合并优先级：override.addedAt > ADDED_AT 映射 > 兜底日期）
export function getRecentSites(options?: { days?: number; limit?: number }): Site[];
```

## 设计定位

仅新增首页「本周新增工具」区块，沿用站点现有的「深色玻璃拟态 + 渐变光斑」设计语言，与 Hero、编辑精选、分类网格保持视觉一致，不引入新的设计体系。

## 区块设计（自上而下）

1. **区块标题行**：左侧 lucide 图标（Sparkles/Clock）+ 标题「本周新增」+ 副标题「最近 7 天收录的工具」；右侧展示新增数量徽标（Badge outline），与主内容基线对齐。
2. **卡片网格**：复用 `SiteCard`，响应式 `1 / 2 / 3 / 4` 列，间距与分类网格一致；每张卡片右上角叠加收录日期徽标（相对时间，如「3 天前」），移动端同样可见。
3. **空态降级**：时间窗口内无新增时，标题自动切换为「最近收录」并展示最近 N 条，避免出现空白区块。
4. **动效与交互**：卡片沿用现有 hover 抬升与发光描边；日期徽标使用极轻的入场淡入，不使用大幅动画，保持静态站点的性能与克制感。

## Agent Extensions

### SubAgent

- **code-explorer**
  - Purpose: 统计 163 条待补条目的分布、标签使用频次与各分类归类命中情况，定位需要改写的 `data/sites/*.json` 分片与标签位置
  - Expected outcome: 输出待补条目清单、标签频次表、疑似错分条目清单，作为脚本与数据改动的输入

### Skill

- **project-structure**
  - Purpose: 确认新增脚本（`scripts/`）、生成数据文件（`src/data/`）与首页区块组件（`src/app/`）的放置是否符合现有约定
  - Expected outcome: 文件落位与已有 `scripts/`、`src/data/`、`src/app/` 就近组织惯例一致，不引入新的目录范式
