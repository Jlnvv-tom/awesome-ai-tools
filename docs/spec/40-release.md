# 发布规格

## 1. 版本策略

采用 [Semantic Versioning](https://semver.org/) `MAJOR.MINOR.PATCH`：

| 变更类型                               | 版本位 | 示例                  |
| -------------------------------------- | ------ | --------------------- |
| 数据 schema 不兼容变更、页面结构重构   | MAJOR  | 字段删除、路由变更    |
| 新增分类 / 新增页面 / 新增贡献能力     | MINOR  | 新增「AI 编程」分类页 |
| 数据增补、文案修正、样式微调、依赖升级 | PATCH  | 新增 20 个站点        |

数据类 PR 使用 `data:` commit 类型，合并后自动进入下一个 PATCH。

## 2. 分支模型

- `main`：始终可发布，受保护，只能通过 PR 合入；
- `feat/*`、`fix/*`、`data/*`、`docs/*`：工作分支；
- PR 由 Vercel 自动生成预览链接，预览通过后才可合并。

## 3. 发布流程

1. PR 合入 `main` → CI 全绿 → Vercel 自动部署生产环境；
2. Maintainer 在 `CHANGELOG.md` 追加本次变更条目；
3. 若涉及 schema 变更，同步更新 `docs/spec/10-data-model.md` 并在 CHANGELOG 标注 `Breaking`；
4. 打 tag：`git tag -a v0.x.y -m "v0.x.y"` 并推送，触发 GitHub Release。

## 4. Changelog 规范

遵循 [Keep a Changelog](https://keepachangelog.com/)：

```md
## [0.2.0] - 2026-09-14

### Added

- 新增「AI 编程」分类与 38 个编程类站点 (#42)

### Changed

- 首页卡片改为品牌色光晕交互 (#51)

### Fixed

- 修复暗色模式下分类标签对比度不足 (#55)
```

## 5. 上游图标同步

`.github/workflows/sync-icons.yml` 每周一 03:00 UTC 执行：

1. `pnpm sync:icons` 拉取上游最新 toc；
2. 若有差异，自动开 PR（标题 `chore(data): sync icons from lobehub/lobe-icons`）；
3. PR 描述中列出新增 / 变更 / 移除的图标统计；
4. Maintainer 复核后合并。

## 6. 回滚

Vercel 保留历史部署，可在 Dashboard 一键 Promote 到任意历史版本；
数据类错误优先用 `visible: false` 隐藏条目，再做正式修复。
