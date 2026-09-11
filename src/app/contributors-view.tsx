import { GitPullRequest, Users } from 'lucide-react';

import { ContributorAvatar } from '@/components/site/contributor-avatar';
import { Badge } from '@/components/ui/badge';
import { CONTRIBUTORS } from '@/data/contributors.generated';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurationSummary } from '@/lib/curation';
import { getCategoryName } from '@/lib/sites';

const REPO = 'https://github.com/Jlnvv-tom/awesome-ai-tools';

/** 贡献看板共享视图：贡献者卡片墙 + 待认领进度（中英复用） */
export function ContributorsView({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dict = getDictionary(locale).contributorsPage;
  const summary = getCurationSummary();

  return (
    <div className="container pb-20 pt-14">
      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-6 w-6 text-primary" />
          {dict.title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {dict.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="gap-1 font-mono">
            {dict.contributors} {CONTRIBUTORS.length}
          </Badge>
          <Badge variant="outline" className="gap-1 font-mono">
            {dict.pending(summary.pending.length)}
          </Badge>
          <Badge variant="outline" className="gap-1 font-mono">
            {dict.rate(summary.rate)}
          </Badge>
        </div>
      </header>

      <section className="mt-10">
        {CONTRIBUTORS.length === 0 ? (
          <p className="glass-card p-6 text-center text-sm text-muted-foreground">{dict.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CONTRIBUTORS.map((contributor) => (
              <div
                key={contributor.name}
                className="glass-card flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
              >
                <ContributorAvatar name={contributor.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{contributor.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dict.commits(contributor.commits)}
                    {contributor.dataCommits > 0 &&
                      ` · ${dict.dataCommits(contributor.dataCommits)}`}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {dict.lastCommit(contributor.lastCommit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">{dict.progressTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.progressDesc(summary.maintained, summary.total)}
        </p>

        <ul className="mt-4 space-y-2">
          {summary.groups.map((group) => {
            const pending = group.pending.length;
            return (
              <li key={group.category.slug} className="glass-card flex items-center gap-3 p-3">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: group.category.color }}
                  aria-hidden="true"
                />
                <span className="w-32 shrink-0 truncate text-sm font-medium">
                  {getCategoryName(group.category, locale)}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${group.rate}%` }}
                  />
                </span>
                <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                  {dict.rate(group.rate)} · {dict.pending(pending)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={`${REPO}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-soft px-5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110"
          >
            <GitPullRequest className="h-4 w-4" />
            {getDictionary(locale).about.guide}
          </a>
          <p className="text-xs text-muted-foreground">{dict.claimGuide}</p>
        </div>
      </section>
    </div>
  );
}
