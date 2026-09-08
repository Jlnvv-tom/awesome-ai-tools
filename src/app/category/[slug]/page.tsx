import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CategoryFilter } from '@/app/category/[slug]/category-filter';
import { getCategoriesWithCount, getCategory, getSitesByCategory } from '@/lib/sites';
import { buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { CATEGORIES } from '@/data/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return buildMetadata({ title: '分类不存在' });

  return buildMetadata({
    title: `${category.name} · ${category.nameEn}`,
    description: `${category.description}，共收录该分类下的 AI 工具官网，支持标签筛选与一键直达。`,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const sites = getSitesByCategory(slug);
  const others = getCategoriesWithCount().filter((item) => item.slug !== slug);

  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-14">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[100px]"
          style={{ backgroundColor: `${category.color}33` }}
          aria-hidden="true"
        />
        <div className="container relative">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              首页
            </Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{sites.length}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {category.description} · 英文分类名 {category.nameEn}
          </p>
        </div>
      </section>

      <section className="container pb-16">
        <CategoryFilter sites={sites} />

        <div className="mt-14">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">看看其他分类</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {item.name} {item.count}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionJsonLd(sites, category.name, category.description)),
        }}
      />
    </>
  );
}
