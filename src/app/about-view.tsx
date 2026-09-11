import { BookOpen, Github, GitPullRequest, Layers, ShieldCheck } from 'lucide-react';

import { ICON_SOURCE, ICON_SYNCED_AT } from '@/data/icons.generated';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getStats } from '@/lib/sites';

const REPO = 'https://github.com/Jlnvv-tom/awesome-ai-tools';

/** 关于页共享视图：中英文复用，卡片文案与统计标签按语言切换 */
export function AboutView({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dict = getDictionary(locale).about;
  const stats = getStats();

  const cards = [
    { icon: Layers, title: dict.icons.source, body: dict.icons.body },
    { icon: BookOpen, title: dict.icons.sdd, body: dict.icons.sddBody },
    { icon: GitPullRequest, title: dict.icons.contribute, body: dict.icons.contributeBody },
    { icon: ShieldCheck, title: dict.icons.license, body: dict.icons.licenseBody },
  ];

  return (
    <div className="container max-w-4xl pb-20 pt-14">
      <h1 className="text-3xl font-bold tracking-tight">{dict.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{dict.intro}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="glass-card p-5">
            <card.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </div>

      <section className="glass-card mt-8 p-6">
        <h2 className="text-sm font-semibold">{dict.snapshot}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            { label: getDictionary(locale).hero.stats.tools, value: stats.total },
            { label: getDictionary(locale).hero.stats.curated, value: stats.curated },
            { label: getDictionary(locale).hero.stats.categories, value: stats.categories },
            { label: getDictionary(locale).hero.stats.tags, value: stats.tags },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-mono text-xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 break-all text-xs text-muted-foreground">
          {dict.iconSource(ICON_SOURCE, ICON_SYNCED_AT)}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-soft px-5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110"
        >
          <Github className="h-4 w-4" />
          {dict.star}
        </a>
        <a
          href={`${REPO}/blob/master/CONTRIBUTING.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-primary/60 hover:bg-primary/10"
        >
          <GitPullRequest className="h-4 w-4" />
          {dict.guide}
        </a>
      </div>
    </div>
  );
}
