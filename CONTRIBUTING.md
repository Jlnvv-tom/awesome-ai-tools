# 贡献指南

感谢你愿意让这个项目变得更好。本文会带你完成从「本地跑起来」到「PR 被合并」的全过程。
**补充一个 AI 工具只需要改一个 JSON 文件，不需要写一行代码。**

## 目录

- [行为准则](#行为准则)
- [快速开始](#快速开始)
- [贡献方式一：新增 / 修正站点数据](#贡献方式一新增--修正站点数据)
- [贡献方式二：提交代码](#贡献方式二提交代码)
- [数据字段规范](#数据字段规范)
- [本地校验](#本地校验)
- [提交信息规范](#提交信息规范)
- [PR 流程与评审标准](#pr-流程与评审标准)
- [常见问题](#常见问题)

## 行为准则

参与本项目即视为同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。
请保持友善、耐心与建设性。

## 快速开始

```bash
git clone https://github.com/Jlnvv-tom/awesome-ai-tools.git
cd awesome-ai-tools
pnpm install
pnpm dev          # http://localhost:3000
```

> 需要 Node.js ≥ 20.11、pnpm ≥ 9。没有 pnpm 可执行 `npm i -g pnpm`。

## 贡献方式一：新增 / 修正站点数据

### 场景 A：为已有图标补充信息（最常见）

1. 打开 `data/sites/` 下与目标分类同名的文件（例如对话类 → `chat.json`）；
2. 新增一条记录（`iconId` 必须来自图标库，见下方说明）：

```json
{
  "iconId": "Perplexity",
  "nameCn": "Perplexity",
  "category": "search",
  "tags": ["ai-search", "chatbot"],
  "description": "带引用来源的 AI 搜索引擎，答案可追溯原文链接。",
  "featured": true,
  "order": 1
}
```

3. 运行 `pnpm validate:data`，确认无 error；
4. 提交 PR，标题建议使用 `data: 补充 Perplexity 站点信息`。

### 场景 B：收录一个图标库还没有的工具（自主收录）

不必再等图标库收录 —— 直接加入 `data/catalog/tools.json`：

```json
{
  "id": "metaso",
  "name": "Metaso",
  "nameCn": "秘塔AI搜索",
  "url": "https://metaso.cn",
  "category": "search",
  "tags": ["ai-search"],
  "description": "无广告的中文 AI 搜索引擎，支持全网检索、学术模式与结构化结果输出。",
  "color": "#6e56f8",
  "addedAt": "2026-09-12",
  "pricing": "freemium",
  "openSource": "no",
  "chineseSupport": "yes"
}
```

1. `id` 用 kebab-case 且全局唯一（不得与图标库派生条目冲突，`validate:data` 会拦截）；
2. `color` 是图标加载前兜底块与卡片辉光的颜色，取自官网 logo 主色；
3. 运行 `pnpm fetch:favicons` 抓取官网图标（增量写入 `public/icons/`，失败会保持兜底块）；
4. 运行 `pnpm validate:data` 与 `pnpm audit:catalog` 确认无 error；
5. 若该工具后来被图标库收录，在条目上补 `"iconId": "Xxx"` 即可切换为官方图标。

> 开源工具可以额外填 `"github": "owner/repo"`，维护者会定期运行 `pnpm sync:metrics`
> 同步 Star 数（只使用公开客观数据，不接入任何流量估计）。

> 查询某个图标是否存在：在 `src/data/icons.generated.ts` 中搜索品牌名，或查看
> [lobehub.com/icons](https://lobehub.com/icons)。`iconId` 为 PascalCase，如 `OpenAI`、`AdobeFirefly`。

### 场景 C：批量导入（成批收录时推荐）

把清单整理成 CSV 后一次导入：

```csv
id,name,nameCn,url,category,tags,description,color,addedAt,pricing,openSource,chineseSupport,github
xfyun-zhiwen,Zhiwen,讯飞智文,https://zhiwen.xfyun.cn,writing,productivity,"科大讯飞推出的 AI 文档工具，支持一键生成 PPT 与 Word 文稿。",,2026-09-13,freemium,no,yes,
```

```bash
pnpm import:catalog data/catalog/batch.csv           # 预览校验结果（不写文件）
pnpm import:catalog data/catalog/batch.csv --apply   # 写入 data/catalog/tools.json
pnpm fetch:favicons                                  # 抓取官网图标
pnpm validate:data                                   # 复核
```

说明：

- `tags` 用 `|` 分隔（如 `ai-search|community`），取值须已在 `data/tags.json` 登记；
- `category` 可以填二级分类（如 `inference`、`image-design`、`agent-framework`），完整清单见 `data/categories.json`；
- `color` 留空会使用默认品牌色，`pnpm audit:catalog` 会提示需要校正的条目；
- 脚本会拦截四类问题并逐条给出原因：schema 不合法、id 冲突（含图标库派生条目）、
  URL 已被占用、分类或标签未登记；
- 同一批次内的重复 id / URL 也会被拦截。

### 场景 D：修正错误信息

直接修改对应的 `data/sites/*.json`，并在 PR 描述中说明修改原因与信息来源（建议附官网截图或链接）。

## 贡献方式二：提交代码

1. 先开 Issue 讨论（新特性 / 重构必做，小修小补可直接提 PR）；
2. 从 `main` 切分支：`feat/xxx`、`fix/xxx`、`data/xxx`、`docs/xxx`；
3. 涉及数据字段变更时，必须同步更新：
   - `docs/spec/10-data-model.md`（规范）
   - `src/types/site.ts`（类型）
   - `src/data/schema.ts`（Zod 校验）
   - 受影响的测试
4. 提交前自检（见下节）；
5. 提 PR 并关联 Issue。

## 数据字段规范

| 字段          | 必填 | 规则                                                                   |
| ------------- | ---- | ---------------------------------------------------------------------- |
| `iconId`      | ✅   | 必须存在于 `src/data/icons.generated.ts`                               |
| `nameCn`      | ➖   | ≤ 30 字符，中文常用名                                                  |
| `url`         | ➖   | 仅在上游地址错误时填写；必须 `https://`，**禁止** utm / ref 等追踪参数 |
| `category`    | ➖   | 必须是 `data/categories.json` 中的 slug，不填则自动归类                |
| `tags`        | ➖   | 必须是 `data/tags.json` 中登记的标签，建议 1–4 个                      |
| `description` | ➖   | 10–80 字符，陈述事实，避免「最强 / 第一」等营销表述                    |
| `featured`    | ➖   | 是否进入首页「编辑精选」                                               |
| `order`       | ➖   | 0–9999，越小越靠前                                                     |
| `visible`     | ➖   | 设为 `false` 可临时隐藏某条目                                          |

新增标签请先登记到 `data/tags.json`。完整规则见 [`docs/spec/10-data-model.md`](./docs/spec/10-data-model.md)。

## 本地校验

提交前请确认全部通过（Husky 会在 commit 时自动执行前两项）：

```bash
pnpm validate:data   # 数据 schema 与一致性
pnpm typecheck       # TypeScript
pnpm lint            # ESLint
pnpm test            # 单元测试
pnpm build           # 生产构建（可选，CI 会跑）
pnpm format          # Prettier 格式化
```

## 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>
```

常用 type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `ci` / `chore` / `revert`，
以及本项目特有的 **`data`（纯数据变更）**。

```
data(sites): 补充 Perplexity 与 Exa 的中文简介
feat(search): 支持按标签过滤搜索结果
docs(spec): 补充 description 字段的长度约束
```

## PR 流程与评审标准

1. Fork 仓库并创建分支；
2. 完成修改并通过本地校验；
3. 提交 PR，填写模板中的检查清单，附上必要的截图或数据来源；
4. CI 全绿 + Vercel 预览可用；
5. 至少一位 Maintainer（见 `.github/CODEOWNERS`）Approve 后合并。

**评审关注点**：数据准确性（官网可达、描述客观）、是否遵循 schema、
是否引入不必要的依赖、是否影响首屏性能与 SEO。

## 常见问题

**Q：我找不到某个工具的 `iconId`？**
A：在 `src/data/icons.generated.ts` 里搜索品牌英文名（如 `Midjourney`）。找不到说明图标库尚未收录，请先去上游申请图标。

**Q：`validate:data` 报「使用了未登记的标签」？**
A：把新标签加进 `data/tags.json` 后再提交。

**Q：为什么我加的工具没有出现在首页精选？**
A：首页「编辑精选」只展示 `featured: true` 的条目，其余条目仍会出现在对应分类中。

**Q：可以提交我自己做的工具吗？**
A：可以，请在 PR 中明确标注你与该项目的关系，并保持描述客观。
