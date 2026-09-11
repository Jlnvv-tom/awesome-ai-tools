# ADR 0007：Cloudflare Pages 镜像部署

- 状态：已接受
- 日期：2026-09-11
- 关联：`.github/workflows/cloudflare-pages.yml`、`wrangler.toml`、`next.config.ts`

## 背景

主站部署在 Vercel，国内访问速度不稳定。项目保持纯静态、无后端，因此可以低成本地
增加一个边缘镜像站点，改善国内访问延迟与可用性。

约束：

- 不引入服务端状态、不做用户追踪；
- 主站与镜像必须共用同一份代码与数据，避免内容分叉；
- 镜像不作为 SEO 的规范地址，避免重复内容。

## 决策

1. 使用 `@cloudflare/next-on-pages` 生成 Cloudflare Pages 产物
   （输出目录 `.vercel/output/static`），构建命令为 `pnpm pages:build`（通过 npx 调用，不进入运行时依赖）。
2. 所有 API 路由声明 `runtime = 'edge'`，使同一份代码同时满足 Vercel 与 Cloudflare；
   其中 `/api/sites`、`/api/categories` 需要读取查询参数，因此使用动态处理 + CDN 缓存头
   而非 ISR（Edge Runtime 不支持 `revalidate`）。
3. 新增 `cloudflare-pages.yml`：监听 `master` 推送与手动触发；
   **未配置 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 时打印提示并跳过**，
   避免镜像未启用时主站 CI 变红。
4. canonical 与 sitemap 统一使用 `NEXT_PUBLIC_SITE_URL` 指向的主站域名，
   Cloudflare 域名仅作为访问入口，不写入 canonical。

## 后果

### 正面

- 国内访问由 Cloudflare 边缘网络就近响应，主站不受影响；
- 镜像与主站共用构建产物，数据一致性由仓库保证；
- 无需为镜像单独维护代码分支或配置。

### 负面

- 多了一条部署链路需要维护（依赖 CF 账号与 secrets）；
- Edge Runtime 不支持 ISR，API 缓存完全依赖 `Cache-Control`，需在改动缓存策略时注意；
- 首次启用需要在 Cloudflare 控制台创建 Pages 项目并配置 secrets（见下）。

## 启用步骤

1. 在 Cloudflare 控制台创建 Pages 项目 `awesome-ai-tools`（或使用 `wrangler pages project create`）；
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions 添加：
   - `CLOUDFLARE_API_TOKEN`（需 Pages 编辑权限）
   - `CLOUDFLARE_ACCOUNT_ID`
   - `NEXT_PUBLIC_SITE_URL`（与主站一致的规范域名）
3. 推送 `master` 或手动触发 `Cloudflare Pages` workflow 即可完成首次部署。
