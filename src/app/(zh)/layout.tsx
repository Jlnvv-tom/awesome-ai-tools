import { HtmlLang } from '@/components/layout/html-lang';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { DEFAULT_LOCALE, HTML_LANG } from '@/i18n/config';
import { getCategoriesWithCount, getCategoryName } from '@/lib/sites';

/** 中文分支布局（根路径） */
export default function ZhLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategoriesWithCount();
  const navItems = categories.map((category) => ({
    slug: category.slug,
    name: getCategoryName(category, DEFAULT_LOCALE),
    count: category.count,
  }));

  return (
    <>
      <HtmlLang lang={HTML_LANG.zh} />
      <SiteHeader navItems={navItems} locale="zh" />
      <main id="main" className="pt-16">
        {children}
      </main>
      <SiteFooter total={categories.reduce((sum, item) => sum + item.count, 0)} locale="zh" />
    </>
  );
}
