import Link from 'next/link';

import { CategoryFilter } from '@/app/category-filter';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildCollectionJsonLd } from '@/lib/seo';
import {
  getCategoriesWithCount,
  getCategory,
  getCategoryName,
  getChildCategories,
  getSitesByCategory,
} from '@/lib/sites';
import type { Category } from '@/types/site';

/** 分类页共享视图：中英文复用，仅文案与展示字段按语言切换 */
export function CategoryView({
  category,
  locale = DEFAULT_LOCALE,
}: {
  category: Category;
  locale?: Locale;
}) {
  const dict = getDictionary(locale).category;
  const sites = getSitesByCategory(category.slug);
  const counts = getCategoriesWithCount();
  // 「看看其他分类」只列一级分类，避免二级分类灌满区块
  const others = counts.filter((item) => item.slug !== category.slug && !item.parent);
  const name = getCategoryName(category, locale);

  const parent = category.parent ? getCategory(category.parent) : undefined;
  const children = getChildCategories(category.slug).map((child) => ({
    ...child,
    count: counts.find((item) => item.slug === child.slug)?.count ?? 0,
  }));

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
            <Link href={localePath(locale)} className="transition-colors hover:text-foreground">
              {dict.home}
            </Link>
            <span>/</span>
            {parent && (
              <>
                <Link
                  href={localePath(locale, `/category/${parent.slug}`)}
                  className="transition-colors hover:text-foreground"
                >
                  {getCategoryName(parent, locale)}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground">{name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{sites.length}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {category.description} · {dict.nameEn(category.nameEn)}
          </p>
        </div>
      </section>

      {children.length > 0 && (
        <section className="container pb-4">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {dict.subcategories}
          </h2>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.slug}
                href={localePath(locale, `/category/${child.slug}`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {getCategoryName(child, locale)}
                <span className="font-mono text-[10px] opacity-70">{child.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-16">
        <CategoryFilter sites={sites} locale={locale} />

        <div className="mt-14">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">{dict.otherCategories}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={localePath(locale, `/category/${item.slug}`)}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {getCategoryName(item, locale)} {item.count}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionJsonLd(sites, name, category.description)),
        }}
      />
    </>
  );
}
