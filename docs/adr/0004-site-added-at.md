# ADR 0004：站点收录时间字段 `addedAt`

- 状态：已接受
- 日期：2026-09-09
- 关联：`docs/spec/10-data-model.md`、`scripts/backfill-added-at.ts`

## 背景

M2 需要首页「本周新增工具」区块，但数据模型中没有任何时间维度：
`Site` 只描述条目是什么，不描述它何时进入导航。

同时存在一个约束：`curated` 由「是否存在覆盖项」派生
（`curated: Boolean(override)`）。若为了记录收录时间而给 163 条未维护条目
补一个只含 `iconId + addedAt` 的覆盖项，会把它们全部误判为「已人工维护」，
直接破坏 M2「降低未维护条目数量」的统计口径。

## 决策

1. 新增 `Site.addedAt`（必填，`YYYY-MM-DD`）与 `SiteOverride.addedAt`（可选，用于人工覆盖），
   三处定义同步：类型、Zod schema、数据模型规格文档。
2. 收录时间不写入覆盖项，而是落在**独立的生成文件**
   `src/data/added-at.generated.ts`（`Record<iconId, 日期>`），由 `pnpm backfill:added-at`
   按 git 历史生成并入库。
3. 合并优先级：`override.addedAt` > 回填映射 > 兜底日期（最近一次图标同步时间）。
4. 尚未提交的新同步条目取 `ICON_SYNCED_AT`，因此「刚同步进来的新图标」会自然进入本周新增。

## 后果

### 正面

- `curated` 语义保持不变，维护进度统计不受污染。
- 收录时间可重复生成（相同 git 历史 → 相同输出），并能用 `--check` 在 CI 中校验。
- 生成文件入库，SSG 构建无需访问 git 历史（Vercel 是浅克隆，运行时读 git 不可靠）。

### 负面

- 新增一个生成文件，数据改动后需要重新执行回填脚本（历史条目日期基本不变，改动面很小）。
- 历史条目缺少精确的「首次收录」时间（仓库早期只有一个提交），回填结果集中在同一天；
  随时间推移，新条目的日期会越来越精确。
