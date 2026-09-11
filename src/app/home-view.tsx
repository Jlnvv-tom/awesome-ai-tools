import { HomeExplorer } from '@/app/home-explorer';
import { HomeHero } from '@/app/home-hero';
import { HomeMyFavorites } from '@/app/home-my-favorites';
import { HomeNewArrivals } from '@/app/home-new-arrivals';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import {
  getCategoriesWithCount,
  getAllSites,
  getRecentSites,
  getStats,
  isWithinDays,
} from '@/lib/sites';

/**
 * 首页共享视图：中英文站点共用同一套区块，仅文案与展示字段按语言切换。
 *
 * 页面（`app/page.tsx` 与 `app/en/page.tsx`）只负责指定 locale，
 * 避免双语两套实现产生漂移。
 */
export function HomeView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const sites = getAllSites();
  const categories = getCategoriesWithCount();
  const stats = getStats();

  const recent = getRecentSites({ days: 7, limit: 8 });
  const hasNewThisWeek = recent.some((site) => isWithinDays(site.addedAt, 7));

  return (
    <>
      <HomeHero stats={stats} dict={dict.hero} />
      <HomeNewArrivals
        sites={recent}
        withinDays={hasNewThisWeek}
        dict={dict.newArrivals}
        locale={locale}
      />
      <HomeMyFavorites sites={sites} locale={locale} />
      <HomeExplorer sites={sites} categories={categories} locale={locale} />
    </>
  );
}
