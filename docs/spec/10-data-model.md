# 数据模型规格（权威）

> 本文件是数据字段的**唯一权威定义**。
> `src/types/site.ts`（TypeScript）与 `src/data/schema.ts`（Zod）必须与本文保持一致，三处不一致视为 Bug。

## 1. 数据来源与合并规则

```
@lobehub/icons toc (322 条)
        │  scripts/sync-icons.ts
        ▼
IconMeta[]  ──┐
              ├─ left join（以 iconId 为键）─→  Site[]
SiteOverride[]│                                （未覆盖的字段取派生默认值）
（data/sites/*.json）
```

**合并优先级**：`SiteOverride` > 派生默认值（来自 `IconMeta`）。

**派生规则**（未被覆盖时）：

| 字段          | 派生值                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `IconMeta.id` 转 kebab-case，如 `OpenAI` → `openai`                                                                                   |
| `iconId`      | `IconMeta.id`                                                                                                                         |
| `name`        | `IconMeta.fullTitle`                                                                                                                  |
| `url`         | `IconMeta.url`（toc.desc）                                                                                                            |
| `category`    | 按 `data/categories.json` 的 `keywords` 匹配 name/url；未命中则按 group 兜底（`model`/`provider` → `model`，`application` → `agent`） |
| `tags`        | 空数组（等社区补充）                                                                                                                  |
| `description` | `IconMeta.fullTitle` + 分组说明（简短兜底文案）                                                                                       |
| `featured`    | `false`                                                                                                                               |
| `order`       | `9999`                                                                                                                                |
| `color`       | `IconMeta.color`                                                                                                                      |
| `hasColor`    | `IconMeta.param.hasColor`（决定是否存在 `-color.svg`，**不可覆盖**）                                                                  |
| `curated`     | `false`                                                                                                                               |

## 2. IconMeta（生成，禁止手改）

| 字段        | 类型                                     | 必填 | 说明                                                     |
| ----------- | ---------------------------------------- | ---- | -------------------------------------------------------- |
| `id`        | string                                   | ✅   | PascalCase 唯一标识，如 `OpenAI`；同时是 CDN slug 的来源 |
| `title`     | string                                   | ✅   | 短名                                                     |
| `fullTitle` | string                                   | ✅   | 完整展示名，如 `Firefly (Adobe)`                         |
| `color`     | string                                   | ✅   | 品牌主色，小写 hex，如 `#d97757`                         |
| `group`     | `'model' \| 'provider' \| 'application'` | ✅   | 上游分组                                                 |
| `url`       | string                                   | ✅   | 官网地址，来自 `toc.desc`                                |
| `docsUrl`   | string                                   | ✅   | lobehub.com/icons 文档路径                               |
| `param`     | `IconVariantFlags`                       | ✅   | 可用图标变体标记                                         |

## 3. Site（最终渲染对象）

| 字段             | 类型     | 必填 | 约束                                                                            |
| ---------------- | -------- | ---- | ------------------------------------------------------------------------------- |
| `id`             | string   | ✅   | `^[a-z0-9]+(-[a-z0-9]+)*$`，全局唯一                                            |
| `iconId`         | string   | ✅   | 必须存在于 `icons.generated.ts`                                                 |
| `name`           | string   | ✅   | 1–60 字符                                                                       |
| `nameCn`         | string   | ➖   | ≤ 30 字符                                                                       |
| `url`            | string   | ✅   | 必须是 `https://` 开头的可解析 URL；**禁止**带 `utm_*`、`ref`、`aff` 等追踪参数 |
| `category`       | string   | ✅   | 必须存在于 `data/categories.json` 的 `slug`                                     |
| `tags`           | string[] | ✅   | 每个标签必须存在于 `data/tags.json`；建议 1–4 个                                |
| `description`    | string   | ✅   | 10–80 字符，陈述事实，禁止营销话术与「最/第一」等绝对表述                       |
| `featured`       | boolean  | ✅   | 是否进入首页精选                                                                |
| `order`          | number   | ✅   | 0–9999，越小越靠前                                                              |
| `color`          | string   | ✅   | 小写 hex                                                                        |
| `hasColor`       | boolean  | ✅   | 是否存在彩色变体；纯派生字段，不进 SiteOverride / Zod                           |
| `curated`        | boolean  | ✅   | 是否人工维护                                                                    |
| `addedAt`        | string   | ✅   | 收录日期 `YYYY-MM-DD`；`override.addedAt` > git 回填映射 > 兜底日期             |
| `pricing`        | enum     | ✅   | 定价模式：`free` / `freemium` / `paid` / `unknown`（缺省 `unknown` 表示待补充） |
| `openSource`     | enum     | ✅   | 是否开源：`yes` / `no` / `unknown`（缺省 `unknown`）                            |
| `chineseSupport` | enum     | ✅   | 是否支持中文：`yes` / `no` / `unknown`（缺省 `unknown`）                        |

> `hasColor` 与 `curated` 同属派生字段：它由 `IconMeta.param.hasColor` 派生，不可人工覆盖，
> 且必须经服务端下传给客户端 —— 客户端自行查表会把 322 条图标元数据打进 bundle。

## 4. SiteOverride（人工维护，全部字段可选）

存储位置：`data/sites/<category>.json`，数组形式。

| 字段              | 类型     | 说明                                                   |
| ----------------- | -------- | ------------------------------------------------------ |
| `iconId`          | string   | **必填**，关联到 IconMeta.id                           |
| `name` / `nameCn` | string   | 覆盖展示名                                             |
| `url`             | string   | 覆盖官网地址（上游 `desc` 缺失或错误时使用）           |
| `category`        | string   | 覆盖自动归类结果                                       |
| `tags`            | string[] | 覆盖标签                                               |
| `description`     | string   | 覆盖简介                                               |
| `featured`        | boolean  | 是否精选                                               |
| `order`           | number   | 排序权重                                               |
| `visible`         | boolean  | `false` 表示从导航中隐藏该条目                         |
| `addedAt`         | string   | 覆盖回填的收录日期（`YYYY-MM-DD`），新收录条目建议填写 |
| `pricing`         | enum     | 定价模式，取值同 `Site.pricing`                        |
| `openSource`      | enum     | 是否开源，取值同 `Site.openSource`                     |
| `chineseSupport`  | enum     | 是否支持中文，取值同 `Site.chineseSupport`             |

### 示例

```json
[
  {
    "iconId": "OpenAI",
    "nameCn": "OpenAI",
    "category": "chat",
    "tags": ["chatbot", "llm", "api"],
    "description": "GPT 系列模型的创造者，提供 ChatGPT 与 OpenAI API。",
    "featured": true,
    "order": 1
  },
  {
    "iconId": "Midjourney",
    "nameCn": "Midjourney",
    "category": "image",
    "tags": ["image-generation"],
    "description": "以艺术表现力著称的图像生成服务，通过 Discord 与网页端使用。",
    "featured": true,
    "order": 2
  }
]
```

## 5. Category

| 字段          | 类型     | 约束                                     |
| ------------- | -------- | ---------------------------------------- |
| `slug`        | string   | 唯一，`^[a-z0-9-]+$`                     |
| `name`        | string   | 中文名                                   |
| `nameEn`      | string   | 英文名                                   |
| `description` | string   | 一句话描述，≤ 60 字符                    |
| `icon`        | string   | lucide-react 图标名（PascalCase）        |
| `color`       | string   | 分类主题色 hex                           |
| `order`       | number   | 排序权重                                 |
| `keywords`    | string[] | 自动归类关键词（小写），命中即归入该分类 |

## 6. Tag（受控词表）

`data/tags.json` 为字符串数组。新增标签需在此登记后才能在站点数据中使用，
`validate:data` 会拦截未登记的标签。

## 7. 校验规则（scripts/validate-data.ts）

| 级别     | 规则                                                  |
| -------- | ----------------------------------------------------- |
| ❌ error | Zod schema 校验失败（字段缺失 / 类型错误 / 格式非法） |
| ❌ error | `site.iconId` 在图标元数据中不存在                    |
| ❌ error | `site.category` 不在 `categories.json`                |
| ❌ error | `site.tags` 存在未登记标签                            |
| ❌ error | `site.id` 重复                                        |
| ❌ error | `categories.json` 中 `slug` 重复                      |
| ⚠️ warn  | 同一 `url` 被多个条目引用                             |
| ⚠️ warn  | 条目缺少中文名或简介仍为派生兜底文案                  |
| ❌ error | `site.addedAt` 缺失或格式非法（必须为 `YYYY-MM-DD`）  |
| ⚠️ warn  | 图标元数据中未被任何站点引用（新收录图标，待补信息）  |

> error 会导致进程以非 0 退出并阻断 CI；warn 仅提示，不阻断。
