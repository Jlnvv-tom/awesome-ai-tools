# 开放 API

项目对外提供只读 JSON 接口，便于第三方复用导航数据。所有接口均为 **GET**，
返回 JSON 并附带 CORS 头（`access-control-allow-origin: *`），可直接在浏览器或服务端调用。

## 基础信息

| 项       | 说明                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| 数据来源 | 仓库内的 `data/` 与生成的 `icons.generated.ts`，与站点展示完全一致                |
| 缓存     | `Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=86400` |
| 运行时   | Edge Runtime（全球边缘节点就近响应）                                              |
| 索引     | `/api/` 路径已在 `robots.txt` 中标记为不参与搜索索引                              |
| 追踪     | 不记录任何请求日志到第三方，无埋点、无 Cookie                                     |

## `GET /api/sites`

站点列表，支持筛选与分页。

### 查询参数

| 参数       | 类型    | 默认 | 说明                                                                   |
| ---------- | ------- | ---- | ---------------------------------------------------------------------- |
| `category` | string  | —    | 分类 slug，取值见 `/api/categories`；未知值返回 `400 invalid_category` |
| `tag`      | string  | —    | 标签（受控词表）；未登记的标签返回 `400 invalid_tag`                   |
| `q`        | string  | —    | 关键词，匹配名称、中文名、简介与标签（大小写不敏感）                   |
| `featured` | boolean | —    | `true` 仅返回编辑精选；非法取值会忽略并计入 `warnings`                 |
| `limit`    | int     | `50` | 每页条数，范围 `1–200`；超范围会被收敛并计入 `warnings`                |
| `offset`   | int     | `0`  | 偏移量，用于分页                                                       |

### 响应

```json
{
  "total": 322,
  "limit": 50,
  "offset": 0,
  "count": 50,
  "warnings": [],
  "items": [
    {
      "id": "openai",
      "iconId": "OpenAI",
      "name": "OpenAI",
      "nameCn": "OpenAI ChatGPT",
      "url": "https://chatgpt.com",
      "category": "chat",
      "tags": ["chatbot", "llm", "api"],
      "description": "GPT 系列模型的创造者，提供 ChatGPT 与 OpenAI API。",
      "featured": true,
      "order": 1,
      "color": "#000000",
      "hasColor": false,
      "pricing": "freemium",
      "openSource": "no",
      "chineseSupport": "yes",
      "addedAt": "2026-09-08",
      "curated": true
    }
  ]
}
```

### 示例

```bash
# 编程分类下的精选工具
curl "https://<your-domain>/api/sites?category=code&featured=true"

# 搜索关键词并分页
curl "https://<your-domain>/api/sites?q=agent&limit=20&offset=20"
```

## `GET /api/categories`

分类列表及各类目条目数。

| 参数   | 类型   | 说明                                           |
| ------ | ------ | ---------------------------------------------- |
| `slug` | string | 可选，查询单个分类；未知值返回 `404 not_found` |

```json
{
  "total": 10,
  "items": [
    {
      "slug": "chat",
      "name": "AI 对话助手",
      "nameEn": "AI Chatbots",
      "description": "通用对话与问答助手，覆盖国内外主流产品",
      "icon": "MessagesSquare",
      "color": "#6e56f8",
      "order": 1,
      "keywords": ["chatgpt", "copilot.microsoft"],
      "count": 23
    }
  ]
}
```

## 字段说明

字段定义与 [`docs/spec/10-data-model.md`](./spec/10-data-model.md) 保持一致，其中三态字段含义如下：

| 字段             | 取值                                     | 说明                                   |
| ---------------- | ---------------------------------------- | -------------------------------------- |
| `pricing`        | `free` / `freemium` / `paid` / `unknown` | `unknown` 表示尚未补充，而非「不免费」 |
| `openSource`     | `yes` / `no` / `unknown`                 | 是否开源                               |
| `chineseSupport` | `yes` / `no` / `unknown`                 | 是否支持中文                           |

## 错误格式

```json
{
  "error": {
    "code": "invalid_category",
    "message": "未知分类：not-exist"
  }
}
```

| 状态码 | code               | 场景                                     |
| ------ | ------------------ | ---------------------------------------- |
| 400    | `invalid_category` | `category` 不在受控分类中                |
| 400    | `invalid_tag`      | `tag` 未在 `data/tags.json` 登记         |
| 404    | `not_found`        | `/api/categories?slug=` 指定的分类不存在 |

## 使用建议

- 请为请求设置合理缓存（响应已带 CDN 缓存头），避免高频轮询；
- 数据以仓库为准，字段可能随版本迭代新增（向后兼容），请勿依赖字段顺序；
- 引用数据时建议保留来源链接，遵守 [MIT 协议](../LICENSE)；
- 品牌图标与商标归各自权利主体所有，本 API 仅作导航用途。
