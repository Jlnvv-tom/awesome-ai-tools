import { ArrowLeft, Link2, Pencil } from 'lucide-react';
import Link from 'next/link';

import { BrandIcon } from '@/components/site/brand-icon';
import { OutboundLink } from '@/components/site/outbound-link';
import { SiteIconTile } from '@/components/site/site-icon-tile';
import { SiteMetaBadges } from '@/components/site/site-meta-badges';
import { VisitTracker } from '@/components/site/visit-tracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getIconDocsUrl } from '@/lib/icon';
import { buildSiteJsonLd } from '@/lib/seo';
import {
  getCategory,
  getCategoryName,
  getIconMeta,
  getRelatedSites,
  getSiteDisplayName,
} from '@/lib/sites';
import type { Site } from '@/types/site';

const REPO = 'https://github.com/Jlnvv-tom/awesome-ai-tools';

/** 详情页共享视图：中英文复用，展示名与文案按语言切换 */
export function SiteView({ site, locale = DEFAULT_LOCALE }: { site: Site; locale?: Locale }) {
  const dict = getDictionary(locale);
  const detail = dict.detail;

  const category = getCategory(site.category);
  const meta = getIconMeta(site.iconId);
  const related = getRelatedSites(site, 8);
  const displayName = getSiteDisplayName(site, locale);

  const host = (() => {
    try {
      return new URL(site.url).hostname.replace(/^www\./, '');
    } catch {
      return site.url;
    }
  })();

  return (
    <>
      <VisitTracker siteId={site.id} />
      <div className="container pb-16 pt-10">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={localePath(locale)} className="transition-colors hover:text-foreground">
            {detail.home}
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={localePath(locale, `/category/${category.slug}`)}
                className="transition-colors hover:text-foreground"
              >
                {getCategoryName(category, locale)}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{displayName}</span>
        </nav>

        <section className="glass-card relative overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full blur-[90px]"
            style={{ backgroundColor: `${site.color}30` }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
            <SiteIconTile
              iconId={site.iconId}
              name={site.name}
              color={site.color}
              hasColor={site.hasColor}
              size="lg"
              interactive={false}
            />

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                {category && (
                  <Badge variant="outline" className="gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {getCategoryName(category, locale)}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{site.name}</p>
              <p className="max-w-2xl text-sm leading-relaxed">{site.description}</p>

              <SiteMetaBadges site={site} className="pt-1" locale={locale} />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <OutboundLink siteId={site.id} url={site.url} name={displayName} locale={locale} />
                <Button asChild variant="outline">
                  <a
                    href={`${REPO}/issues/new?template=bug_report.yml&title=${encodeURIComponent(detail.issueTitle(site.name))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Pencil className="h-4 w-4" />
                    {detail.reportIssue}
                  </a>
                </Button>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                {host}
              </p>

              {site.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {site.tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {meta && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">{detail.dataSource}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {detail.dataSourceBody}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={getIconDocsUrl(meta)} target="_blank" rel="noopener noreferrer">
                    {detail.viewIcon}
                  </a>
                </Button>
                <Badge variant="muted">{detail.group(meta.group)}</Badge>
                <Badge variant="muted">{detail.color(site.color)}</Badge>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">{detail.curation}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {site.curated ? detail.curatedBody : detail.derivedBody}
              </p>
              <div className="mt-3">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`${REPO}/blob/master/CONTRIBUTING.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {detail.contributeGuide}
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">{detail.related}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={localePath(locale, `/site/${item.id}`)}
                  className="glass-card flex items-center gap-3 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <BrandIcon
                    iconId={item.iconId}
                    name={item.name}
                    color={item.color}
                    hasColor={item.hasColor}
                    size={30}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {getSiteDisplayName(item, locale)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Button asChild variant="ghost" size="sm">
            <Link
              href={
                category ? localePath(locale, `/category/${category.slug}`) : localePath(locale)
              }
            >
              <ArrowLeft className="h-4 w-4" />
              {detail.backTo(category ? `「${getCategoryName(category, locale)}」` : detail.home)}
            </Link>
          </Button>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSiteJsonLd(site, category)),
        }}
      />
    </>
  );
}
