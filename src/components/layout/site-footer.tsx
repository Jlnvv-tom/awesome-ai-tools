import { Github, Heart } from 'lucide-react';
import Link from 'next/link';

const LINKS = [
  {
    label: '提交新工具',
    href: 'https://github.com/awesome-ai-tool/awesome-ai-tool/issues/new?template=new-site.yml',
  },
  {
    label: '贡献指南',
    href: 'https://github.com/awesome-ai-tool/awesome-ai-tool/blob/main/CONTRIBUTING.md',
  },
  {
    label: '路线图',
    href: 'https://github.com/awesome-ai-tool/awesome-ai-tool/blob/main/ROADMAP.md',
  },
  { label: 'LobeHub Icons', href: 'https://lobehub.com/icons' },
];

export function SiteFooter({ total }: { total: number }) {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Awesome AI Tool</p>
          <p className="max-w-md text-sm text-muted-foreground">
            已收录 <span className="font-mono text-primary">{total}</span> 个 AI
            工具官网，图标与品牌数据来自 LobeHub Icons，项目完全开源并欢迎社区共建。
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            关于本站
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/60 py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>基于 MIT 协议开源 · 图标版权归各自品牌方所有</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary" /> by the community
            <a
              href="https://github.com/awesome-ai-tool/awesome-ai-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 hover:text-foreground"
              aria-label="GitHub 仓库"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
