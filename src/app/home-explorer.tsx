'use client';

import { ArrowRight, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { SiteCard } from '@/components/site/site-card';
import { SiteRow } from '@/components/site/site-row';
import { SiteViewToggle } from '@/components/site/site-view-toggle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { searchDocs } from '@/lib/search';
import { useViewMode } from '@/lib/view-mode';
import type { Category, SearchDoc, Site } from '@/types/site';

const ALL = 'all';

function toSearchDoc(site: Site): SearchDoc {
  return {
    id: site.id,
    name: site.name,
    nameCn: site.nameCn,
    category: site.category,
    tags: site.tags,
    description: site.description,
  };
}

/**
 * 首页浏览与筛选区（客户端）。
 * 支持关键词即时筛选 + 分类切换，数据以序列化形式从服务端传入。
 */
export function HomeExplorer({
  sites,
  categories,
}: {
  sites: Site[];
  categories: (Category & { count: number })[];
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const { view, setView } = useViewMode();

  const docs = useMemo(() => sites.map(toSearchDoc), [sites]);

  const matchedIds = useMemo(() => {
    if (!query.trim()) return null;
    return new Set(searchDocs(docs, query, 200).map((doc) => doc.id));
  }, [docs, query]);

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === ALL ? sites : sites.filter((site) => site.category === activeCategory);
    if (!matchedIds) return byCategory;
    return byCategory.filter((site) => matchedIds.has(site.id));
  }, [sites, activeCategory, matchedIds]);

  const sections = useMemo(() => {
    const featured = filtered.filter((site) => site.featured);
    const grouped = categories
      .map((category) => ({
        category,
        items: filtered.filter((site) => site.category === category.slug),
      }))
      .filter((section) => section.items.length > 0);
    return { featured, grouped };
  }, [filtered, categories]);

  /** 按当前视图渲染：网格用卡片，列表用紧凑行 */
  const renderSites = (items: Site[]) =>
    view === 'grid' ? (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    ) : (
      <ul className="space-y-2">
        {items.map((site) => (
          <li key={site.id}>
            <SiteRow site={site} />
          </li>
        ))}
      </ul>
    );

  return (
    <section className="container pb-10">
      <div className="glass-card -mt-8 flex flex-col gap-4 p-4 md:-mt-10 md:p-5">
        <div className="flex items-center gap-3 rounded-full border border-border bg-background/60 px-4 focus-within:border-primary focus-within:shadow-glow">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工具名称或关键词，例如：编程、图像、Agent…"
            aria-label="筛选 AI 工具"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="清空搜索"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory(ALL)}
            aria-pressed={activeCategory === ALL}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors',
              activeCategory === ALL
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            全部 {sites.length}
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors',
                activeCategory === category.slug
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {category.name} {category.count}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            命中 <span className="font-mono text-primary">{filtered.length}</span> 个工具
            {matchedIds && <span className="ml-1">（关键词：{query}）</span>}
          </p>
          <SiteViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {filtered.length === 0 && (
          <div className="glass-card flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm text-muted-foreground">没有匹配的工具，换个关键词或分类试试</p>
            <Badge variant="outline">也可以到 GitHub 提交收录申请</Badge>
          </div>
        )}

        {query.trim() === '' && activeCategory === ALL && sections.featured.length > 0 && (
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">编辑精选</h2>
                <p className="text-sm text-muted-foreground">社区维护的高频使用工具</p>
              </div>
            </div>
            {renderSites(sections.featured)}
          </div>
        )}

        {(query.trim() !== '' || activeCategory !== ALL) && (
          <div>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              {query.trim() !== '' ? '搜索结果' : '分类浏览'}
            </h2>
            {renderSites(filtered)}
          </div>
        )}

        {query.trim() === '' &&
          activeCategory === ALL &&
          sections.grouped.map(({ category, items }) => (
            <div key={category.slug} id={category.slug} className="scroll-mt-24">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {category.name}
                    <span className="font-mono text-sm text-muted-foreground">{items.length}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Link
                  href={`/category/${category.slug}`}
                  className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  查看全部
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {renderSites(items.slice(0, 8))}
            </div>
          ))}
      </div>
    </section>
  );
}
