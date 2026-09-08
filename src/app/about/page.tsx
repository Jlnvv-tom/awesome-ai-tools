import { BookOpen, Github, GitPullRequest, Layers, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

import { ICON_SOURCE, ICON_SYNCED_AT } from '@/data/icons.generated';
import { getStats } from '@/lib/sites';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '关于本站',
  description: '了解 Awesome AI Tool 的数据来源、开源协议、SDD 规范驱动开发流程与贡献方式。',
  path: '/about',
});

const CARDS = [
  {
    icon: Layers,
    title: '数据来源',
    body: '站点与品牌图标来自 LobeHub 开源的 lobe-icons 项目，官网地址取自其官方元数据，分类与中文简介由社区维护。',
  },
  {
    icon: BookOpen,
    title: '规范驱动开发',
    body: '项目采用 SDD：先写 docs/spec 规范与 Zod schema，再实现代码，最后由 validate:data 与 CI 强制校验。',
  },
  {
    icon: GitPullRequest,
    title: '人人可贡献',
    body: '新增或修正一个工具只需改一个 JSON 文件；提交 PR 后会有预览部署，通过校验即可合并。',
  },
  {
    icon: ShieldCheck,
    title: '开放协议',
    body: '代码以 MIT 协议开源，数据同理；各品牌图标与商标版权归原始权利人所有。',
  },
];

export default function AboutPage() {
  const stats = getStats();

  return (
    <div className="container max-w-4xl pb-20 pt-14">
      <h1 className="text-3xl font-bold tracking-tight">关于本站</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Awesome AI Tool 是一个社区驱动的 AI 工具导航站，目标是让「找一个 AI
        工具」这件事重新变得简单： 收录全、分类清、直达官网、无需注册。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <div key={card.title} className="glass-card p-5">
            <card.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </div>

      <section className="glass-card mt-8 p-6">
        <h2 className="text-sm font-semibold">当前数据快照</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            { label: '收录工具', value: stats.total },
            { label: '人工维护', value: stats.curated },
            { label: '分类', value: stats.categories },
            { label: '标签', value: stats.tags },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-mono text-xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 break-all text-xs text-muted-foreground">
          图标数据源：{ICON_SOURCE} · 同步时间：{ICON_SYNCED_AT}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="https://github.com/awesome-ai-tool/awesome-ai-tool"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-soft px-5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110"
        >
          <Github className="h-4 w-4" />在 GitHub 上 Star
        </a>
        <a
          href="https://github.com/awesome-ai-tool/awesome-ai-tool/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-primary/60 hover:bg-primary/10"
        >
          <GitPullRequest className="h-4 w-4" />
          阅读贡献指南
        </a>
      </div>
    </div>
  );
}
