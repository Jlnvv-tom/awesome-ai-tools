import { HomeExplorer } from '@/app/home-explorer';
import { HomeHero } from '@/app/home-hero';
import { HomeMyFavorites } from '@/app/home-my-favorites';
import { HomeNewArrivals } from '@/app/home-new-arrivals';
import {
  getCategoriesWithCount,
  getAllSites,
  getRecentSites,
  getStats,
  isWithinDays,
} from '@/lib/sites';
import { buildCollectionJsonLd, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

/** 首页为静态生成，每小时增量更新一次 */
export const revalidate = 3600;

export default function HomePage() {
  const sites = getAllSites();
  const categories = getCategoriesWithCount();
  const stats = getStats();

  const recent = getRecentSites({ days: 7, limit: 8 });
  const hasNewThisWeek = recent.some((site) => isWithinDays(site.addedAt, 7));

  return (
    <>
      <HomeHero stats={stats} />
      <HomeNewArrivals sites={recent} withinDays={hasNewThisWeek} />
      <HomeMyFavorites sites={sites} />
      <HomeExplorer sites={sites} categories={categories} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionJsonLd(sites, SITE_NAME, SITE_DESCRIPTION)),
        }}
      />
    </>
  );
}
