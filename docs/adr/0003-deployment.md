# ADR-0003：GitHub + MIT + Vercel 的开源与部署方案

- 状态：Accepted
- 日期：2026-09-07

## 背景

项目目标是社区共建的开源导航站，需要低门槛的贡献流程与零运维的部署。

## 决策

- 代码托管 GitHub，许可证 **MIT**；
- CI 用 GitHub Actions（lint / typecheck / test / validate-data / build）；
- 部署用 Vercel：PR 自动生成预览，合并 `main` 自动发布生产；
- 上游图标由定时 workflow 同步并自动开 PR。

## 理由

- Next.js 与 Vercel 同属一套生态，SSG/ISR 零配置；
- PR 预览让数据类贡献「所见即所得」，降低 Reviewer 成本；
- MIT 是最利于社区采用的许可证；图标版权归各自品牌方所有，仓库只引用不声称拥有。

## 代价与缓解

- 国内访问 Vercel 可能不稳定 → 后续可增加 Cloudflare Pages 镜像部署（已在 ROADMAP 中）；
- 数据贡献质量依赖 Review → 用 `validate:data` 与 PR 模板把规则前置。
