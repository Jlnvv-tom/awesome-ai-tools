# ADR 0006：开放 API 与静态化的取舍

- 状态：已接受
- 日期：2026-09-11
- 关联：`src/app/api/sites/route.ts`、`src/app/api/categories/route.ts`、`docs/api.md`

## 背景

需要向第三方开放导航数据（`/api/sites`、`/api/categories`），并支持
`category` / `tag` / `q` / `limit` / `offset` 等筛选参数。

现有 `/api/search-index` 使用 `export const dynamic = 'force-static'`，
**静态化后在运行期读不到查询参数**；同时项目要兼容 Cloudflare Pages 镜像，
而 Edge Runtime 不支持 ISR 的 `revalidate`。

## 决策

1. 新增的两个 API 使用 **Edge Runtime + 动态处理 + CDN 缓存头**：

   ```ts
   export const runtime = 'edge';
   export const dynamic = 'force-dynamic';
   // Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=86400
   ```

   不使用 `force-static`（会让参数失效），也不使用 `revalidate`（Edge Runtime 不支持）。

2. 无参数的 `/api/search-index` 保持 `force-static`，仅补充 `runtime = 'edge'`。

3. 对外契约：
   - 响应统一为 JSON，附带 `access-control-allow-origin: *` 便于浏览器直连；
   - 参数错误区分处理：语义非法（未知分类/标签）返回结构化 400，
     格式非法（如 `limit=abc`）降级为默认值并写入 `warnings`；
   - 缓存策略完全由 `Cache-Control` 表达，让 CDN 承担绝大部分请求。

4. `/api/` 继续在 `robots.txt` 中标记为不索引；不记录任何请求日志到第三方。

## 后果

### 正面

- 同一份代码同时适用于 Vercel 与 Cloudflare Pages；
- 参数筛选在运行期生效，行为可预期；
- CDN 缓存（`s-maxage=3600` + `stale-while-revalidate`）承担主要流量，
  函数调用成本可控。

### 负面

- 无法在构建期把 API 响应完全静态化，冷缓存请求会命中边缘函数；
- 缓存时效为 1 小时，数据更新后第三方可能短暂读到旧值（已在文档说明）；
- 需要自行维护 CORS 与错误码契约（已固化为文档与测试）。
