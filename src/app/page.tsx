import { HomeExplorer } from '@/app/home-explorer';
import { HomeHero } from '@/app/home-hero';
import { getCategoriesWithCount, getAllSites, getStats } from '@/lib/sites';
import { buildCollectionJsonLd, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

/** 首页为静态生成，每小时增量更新一次 */
export const revalidate = 3600;

export default function HomePage() {
  const sites = getAllSites();
  const categories = getCategoriesWithCount();
  const stats = getStats();

  return (
    <>
      <HomeHero stats={stats} />
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
