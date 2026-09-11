import { HtmlLang } from '@/components/layout/html-lang';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { HTML_LANG } from '@/i18n/config';
import { getCategoriesWithCount, getCategoryName } from '@/lib/sites';

/** 英文分支布局（`/en` 前缀） */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategoriesWithCount();
  const navItems = categories.map((category) => ({
    slug: category.slug,
    name: getCategoryName(category, 'en'),
    count: category.count,
  }));

  return (
    <>
      <HtmlLang lang={HTML_LANG.en} />
      <SiteHeader navItems={navItems} locale="en" />
      <main id="main" className="pt-16">
        {children}
      </main>
      <SiteFooter total={categories.reduce((sum, item) => sum + item.count, 0)} locale="en" />
    </>
  );
}
