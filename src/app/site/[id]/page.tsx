import { ArrowLeft, ExternalLink, Link2, Pencil, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BrandIcon } from '@/components/site/brand-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllSites, getCategory, getIconMeta, getRelatedSites, getSiteById } from '@/lib/sites';
import { getIconDocsUrl } from '@/lib/icon';
import { buildMetadata, buildSiteJsonLd } from '@/lib/seo';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllSites().map((site) => ({ id: site.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) return buildMetadata({ title: '工具不存在' });

  return buildMetadata({
    title: `${site.nameCn ?? site.name} 官网`,
    description: site.description,
    path: `/site/${site.id}`,
  });
}

export default async function SitePage({ params }: PageProps) {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) notFound();

  const category = getCategory(site.category);
  const meta = getIconMeta(site.iconId);
  const related = getRelatedSites(site, 8);
  const host = (() => {
    try {
      return new URL(site.url).hostname.replace(/^www\./, '');
    } catch {
      return site.url;
    }
  })();

  return (
    <>
      <div className="container pb-16 pt-10">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            首页
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="transition-colors hover:text-foreground"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{site.nameCn ?? site.name}</span>
        </nav>

        <section className="glass-card relative overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full blur-[90px]"
            style={{ backgroundColor: `${site.color}30` }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-muted/40"
              style={{ boxShadow: `0 18px 48px -20px ${site.color}` }}
            >
              <BrandIcon
                iconId={site.iconId}
                name={site.name}
                color={site.color}
                size={48}
                hasColor={meta?.param.hasColor ?? true}
              />
            </span>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{site.nameCn ?? site.name}</h1>
                {category && (
                  <Badge variant="outline" className="gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {category.name}
                  </Badge>
                )}
                {site.featured && (
                  <Badge variant="accent" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    编辑精选
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{site.name}</p>
              <p className="max-w-2xl text-sm leading-relaxed">{site.description}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button asChild size="lg">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`在新窗口打开 ${site.nameCn ?? site.name} 官网`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    前往官网
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={`https://github.com/awesome-ai-tools/awesome-ai-tools/issues/new?template=bug_report.yml&title=${encodeURIComponent(`[数据修正] ${site.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Pencil className="h-4 w-4" />
                    信息有误？提交更正
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
              <h2 className="text-sm font-semibold">数据来源</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                图标与品牌信息来自{' '}
                <a
                  href="https://lobehub.com/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LobeHub Icons
                </a>
                ，官网地址取自上游元数据并经过社区校验。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={getIconDocsUrl(meta)} target="_blank" rel="noopener noreferrer">
                    查看图标详情
                  </a>
                </Button>
                <Badge variant="muted">上游分组：{meta.group}</Badge>
                <Badge variant="muted">品牌色：{site.color}</Badge>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">收录状态</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {site.curated
                  ? '该条目已由社区人工维护，分类、中文名与简介均为人工校对结果。'
                  : '该条目由脚本自动派生，简介与分类为自动归类结果，欢迎提交 PR 补充中文名与简介。'}
              </p>
              <div className="mt-3">
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://github.com/awesome-ai-tools/awesome-ai-tools/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看贡献指南
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">相关推荐</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/site/${item.id}`}
                  className="glass-card flex items-center gap-3 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <BrandIcon iconId={item.iconId} name={item.name} color={item.color} size={30} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.nameCn ?? item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Button asChild variant="ghost" size="sm">
            <Link href={category ? `/category/${category.slug}` : '/'}>
              <ArrowLeft className="h-4 w-4" />
              返回{category ? `「${category.name}」` : '首页'}
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
