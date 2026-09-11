import { Github, Heart, Rss } from 'lucide-react';
import Link from 'next/link';

import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

const REPO = 'https://github.com/Jlnvv-tom/awesome-ai-tools';

/** 页脚：外链文案与内部链接按语言切换 */
export function SiteFooter({ total, locale = DEFAULT_LOCALE }: { total: number; locale?: Locale }) {
  const dict = getDictionary(locale).footer;

  const links = [
    { label: dict.submitTool, href: `${REPO}/issues/new?template=new-site.yml` },
    { label: dict.contributeGuide, href: `${REPO}/blob/master/CONTRIBUTING.md` },
    { label: dict.roadmap, href: `${REPO}/blob/master/ROADMAP.md` },
    { label: 'LobeHub Icons', href: 'https://lobehub.com/icons' },
  ];

  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Awesome AI Tool</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {locale === 'en' ? (
              <>
                <span className="font-mono text-primary">{total}</span> AI tool sites indexed ·{' '}
                {dict.siteDesc(total).split(' · ')[1] ?? ''}
              </>
            ) : (
              dict.siteDesc(total)
            )}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {links.map((link) => (
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
            href={localePath(locale, '/contributors')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {getDictionary(locale).contributorsPage.title}
          </Link>
          <Link
            href={localePath(locale, '/about')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {dict.about}
          </Link>
          <a
            href="/rss.xml"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <Rss className="h-3.5 w-3.5 text-accent" />
            {dict.rss}
          </a>
        </nav>
      </div>

      <div className="border-t border-border/60 py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>{dict.copyright}</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary" /> by the community
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 hover:text-foreground"
              aria-label={dict.github}
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
